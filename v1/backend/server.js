const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const compression = require('compression');
const morgan = require('morgan');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database setup
const dbPath = process.env.DB_PATH || './data/pajama-party.db';
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Dreams table - stores user submissions
  db.run(`CREATE TABLE IF NOT EXISTS dreams (
    id TEXT PRIMARY KEY,
    dreamer_name TEXT NOT NULL,
    origin_station TEXT NOT NULL,
    origin_country TEXT,
    origin_lat REAL,
    origin_lng REAL,
    destination_city TEXT NOT NULL,
    destination_country TEXT,
    destination_lat REAL,
    destination_lng REAL,
    email TEXT,
    email_verified BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME
  )`);

  // Add dreamer_name column if it doesn't exist (for existing databases)
  db.run(`ALTER TABLE dreams ADD COLUMN dreamer_name TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding dreamer_name column:', err);
    }
  });

  // European railway stations table
  db.run(`CREATE TABLE IF NOT EXISTS stations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    type TEXT DEFAULT 'station',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Stats table for demo
  db.run(`CREATE TABLE IF NOT EXISTS stats (
    key TEXT PRIMARY KEY,
    value INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Initialize basic stats
  db.run(`INSERT OR IGNORE INTO stats (key, value) VALUES ('total_dreams', 0)`);
  db.run(`INSERT OR IGNORE INTO stats (key, value) VALUES ('active_stations', 0)`);
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://api.mapbox.com"],
      scriptSrc: ["'self'", "https://api.mapbox.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://api.mapbox.com"],
      connectSrc: ["'self'", "https://api.mapbox.com", "https://events.mapbox.com"],
      workerSrc: ["'self'", "blob:"]
    }
  }
}));

app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// API Routes

// Get all dreams for map visualization
app.get('/api/dreams', (req, res) => {
  db.all(`SELECT 
    dreamer_name, origin_station, origin_country, origin_lat, origin_lng,
    destination_city, destination_country, destination_lat, destination_lng,
    created_at
    FROM dreams 
    WHERE expires_at IS NULL OR expires_at > datetime('now')
    ORDER BY created_at DESC
    LIMIT 1000`, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch dreams' });
    }
    res.json(rows);
  });
});

// Get statistics
app.get('/api/stats', (req, res) => {
  db.all('SELECT key, value FROM stats', (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch stats' });
    }
    
    const stats = {};
    rows.forEach(row => {
      stats[row.key] = row.value;
    });
    
    res.json(stats);
  });
});

// Search railway stations
app.get('/api/stations/search', (req, res) => {
  const { q } = req.query;
  
  if (!q || q.length < 2) {
    return res.json([]);
  }
  
  db.all(`SELECT name, country, lat, lng 
    FROM stations 
    WHERE name LIKE ? OR country LIKE ?
    ORDER BY 
      CASE 
        WHEN name LIKE ? THEN 1 
        WHEN name LIKE ? THEN 2 
        ELSE 3 
      END,
      name
    LIMIT 20`, 
    [`%${q}%`, `%${q}%`, `${q}%`, `%${q}%`], 
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to search stations' });
      }
      res.json(rows);
    });
});

// Submit a new dream
app.post('/api/dreams', [
  body('dreamer_name').isLength({ min: 2, max: 255 }).trim(),
  body('origin_station').isLength({ min: 1, max: 255 }).trim(),
  body('destination_city').isLength({ min: 1, max: 255 }).trim(),
  body('email').optional().isEmail().normalizeEmail()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    dreamer_name,
    origin_station,
    origin_country,
    origin_lat,
    origin_lng,
    destination_city,
    destination_country,
    destination_lat,
    destination_lng,
    email
  } = req.body;

  const dreamId = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days retention

  db.run(`INSERT INTO dreams (
    id, dreamer_name, origin_station, origin_country, origin_lat, origin_lng,
    destination_city, destination_country, destination_lat, destination_lng,
    email, expires_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    dreamId, dreamer_name, origin_station, origin_country, origin_lat, origin_lng,
    destination_city, destination_country, destination_lat, destination_lng,
    email, expiresAt.toISOString()
  ], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to save dream' });
    }

    // Update stats
    db.run('UPDATE stats SET value = value + 1, updated_at = CURRENT_TIMESTAMP WHERE key = "total_dreams"');
    
    // Check if this is a new station
    db.get(`SELECT COUNT(*) as count FROM dreams WHERE origin_station = ? AND id != ?`, 
      [origin_station, dreamId], (err, row) => {
        if (!err && row.count === 0) {
          db.run('UPDATE stats SET value = value + 1, updated_at = CURRENT_TIMESTAMP WHERE key = "active_stations"');
        }
      });

    res.json({
      id: dreamId,
      message: 'Dream submitted successfully!',
      community_message: checkCommunityMessage(origin_station)
    });
  });
});

// Helper function to generate community messages
function checkCommunityMessage(station) {
  // This would be enhanced with real community data
  const messages = [
    `2 people from ${station} want to organize a pajama party!`,
    `Join 3 other dreamers from ${station} planning night train adventures!`,
    `${station} has an active community of night train enthusiasts!`,
    `Connect with fellow travelers from ${station} on our Discord!`
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
}

// Get community info for a station
app.get('/api/community/:station', (req, res) => {
  const { station } = req.params;
  
  db.get(`SELECT COUNT(*) as count FROM dreams WHERE origin_station = ?`, 
    [station], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch community info' });
      }
      
      const count = row.count;
      res.json({
        station,
        dreamers_count: count,
        message: count > 1 ? 
          `${count} people from ${station} want to organize a pajama party!` :
          `Be the first to connect with dreamers from ${station}!`,
        discord_invite: 'https://discord.gg/back-on-track' // Placeholder
      });
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0-mvp'
  });
});

// Serve the main application
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚂 Pajama Party Platform running on port ${PORT}`);
  console.log(`🌙 Where would you like to wake up tomorrow?`);
  console.log(`📍 Visit: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});