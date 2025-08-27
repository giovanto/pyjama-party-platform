'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { VolunteerStats, VolunteerSession } from '@/types';

interface VolunteerDashboardProps {
  sessionId: string;
  stationCode: string;
  language?: 'en' | 'de' | 'fr';
  targetSubmissions?: number;
}

const translations = {
  en: {
    title: "Volunteer Dashboard",
    session: "Session",
    station: "Station",
    today: "Today",
    total: "All Time",
    submissions: "Submissions",
    target: "Target",
    avgTime: "Avg Time",
    lastSubmission: "Last",
    queueSize: "Queue",
    performance: "Performance",
    excellent: "Excellent!",
    good: "Good pace",
    needsSpeed: "Speed up!",
    offline: "Offline",
    online: "Online",
    timeActive: "Active",
    endSession: "End Session",
    newSession: "New Session",
    export: "Export Data"
  },
  de: {
    title: "Freiwilligen-Dashboard",
    session: "Sitzung",
    station: "Bahnhof",
    today: "Heute",
    total: "Gesamt",
    submissions: "Übermittlungen",
    target: "Ziel",
    avgTime: "Ø Zeit",
    lastSubmission: "Letzte",
    queueSize: "Warteschlange",
    performance: "Leistung",
    excellent: "Ausgezeichnet!",
    good: "Gutes Tempo",
    needsSpeed: "Schneller!",
    offline: "Offline",
    online: "Online",
    timeActive: "Aktiv",
    endSession: "Sitzung beenden",
    newSession: "Neue Sitzung",
    export: "Daten exportieren"
  },
  fr: {
    title: "Tableau de Bord Bénévole",
    session: "Session",
    station: "Gare",
    today: "Aujourd'hui",
    total: "Total",
    submissions: "Soumissions",
    target: "Objectif",
    avgTime: "Temps moy.",
    lastSubmission: "Dernière",
    queueSize: "File",
    performance: "Performance",
    excellent: "Excellent !",
    good: "Bon rythme",
    needsSpeed: "Plus vite !",
    offline: "Hors ligne",
    online: "En ligne",
    timeActive: "Actif",
    endSession: "Fin de session",
    newSession: "Nouvelle session",
    export: "Exporter données"
  }
};

export default function VolunteerDashboard({
  sessionId,
  stationCode,
  language = 'en',
  targetSubmissions = 50
}: VolunteerDashboardProps) {
  const [stats, setStats] = useState<VolunteerStats>({
    sessionId,
    stationCode,
    submissionsToday: 0,
    submissionsTotal: 0,
    avgTimePerSubmission: 0,
    offlineQueueSize: 0,
    targetSubmissions
  });
  
  const [session, setSession] = useState<VolunteerSession | null>(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const t = translations[language];

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Track online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load session data
  useEffect(() => {
    const loadSession = () => {
      try {
        const stored = localStorage.getItem(`volunteer_session_${sessionId}`);
        if (stored) {
          setSession(JSON.parse(stored));
        } else {
          // Create new session
          const newSession: VolunteerSession = {
            id: sessionId,
            volunteerId: `vol_${Date.now()}`,
            stationCode,
            language,
            startTime: new Date().toISOString(),
            submissionsCount: 0,
            lastActivity: new Date().toISOString()
          };
          setSession(newSession);
          localStorage.setItem(`volunteer_session_${sessionId}`, JSON.stringify(newSession));
        }
      } catch (error) {
        console.error('Error loading session:', error);
      }
    };

    loadSession();
  }, [sessionId, stationCode, language]);

  // Fetch stats periodically
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/volunteer/stats?sessionId=${sessionId}&stationCode=${stationCode}`);
        if (response.ok) {
          const data = await response.json();
          setStats(prev => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.log('Could not fetch stats, using local data');
        // Fallback to local storage stats
        updateLocalStats();
      }
    };

    const updateLocalStats = () => {
      try {
        // Count submissions in local storage
        const queue = JSON.parse(localStorage.getItem('interviewQueue') || '[]');
        const completedToday = queue.filter((item: any) => {
          const itemDate = new Date(item.timestamp).toDateString();
          return itemDate === new Date().toDateString() && item.status === 'completed';
        }).length;

        setStats(prev => ({
          ...prev,
          submissionsToday: completedToday,
          offlineQueueSize: queue.filter((item: any) => item.status !== 'completed').length
        }));
      } catch (error) {
        console.error('Error updating local stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [sessionId, stationCode]);

  const getActiveTime = () => {
    if (!session) return '0:00';
    const start = new Date(session.startTime);
    const diff = currentTime.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `${hours}:${minutes.toString().padStart(2, '0')}` : `${minutes}:${Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return Math.min((stats.submissionsToday / targetSubmissions) * 100, 100);
  };

  const getPerformanceStatus = () => {
    const percentage = getProgressPercentage();
    if (percentage >= 80) return { text: t.excellent, color: 'text-green-600', bg: 'bg-green-100' };
    if (percentage >= 50) return { text: t.good, color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { text: t.needsSpeed, color: 'text-red-600', bg: 'bg-red-100' };
  };

  const endSession = () => {
    if (session) {
      const updatedSession = {
        ...session,
        endTime: new Date().toISOString()
      };
      localStorage.setItem(`volunteer_session_${sessionId}`, JSON.stringify(updatedSession));
      localStorage.removeItem(`volunteer_session_${sessionId}`);
      window.location.href = '/interview/volunteer';
    }
  };

  const exportData = () => {
    const data = {
      session,
      stats,
      exportTime: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `volunteer-session-${sessionId}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const performanceStatus = getPerformanceStatus();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
            <span>{t.session}: {sessionId.slice(-8)}</span>
            <span>•</span>
            <span>{t.station}: {stationCode}</span>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
              <span>{isOnline ? t.online : t.offline}</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={exportData}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {t.export}
          </button>
          <button
            onClick={endSession}
            className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            {t.endSession}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <motion.div 
          className="bg-gradient-to-br from-bot-green/10 to-bot-green/20 rounded-lg p-4"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-2xl font-bold text-bot-green">{stats.submissionsToday}</div>
          <div className="text-sm text-gray-600">{t.today}</div>
        </motion.div>

        <motion.div 
          className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-4"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-2xl font-bold text-blue-600">{stats.submissionsTotal}</div>
          <div className="text-sm text-gray-600">{t.total}</div>
        </motion.div>

        <motion.div 
          className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg p-4"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-2xl font-bold text-purple-600">
            {stats.avgTimePerSubmission > 0 ? `${Math.round(stats.avgTimePerSubmission)}s` : '--'}
          </div>
          <div className="text-sm text-gray-600">{t.avgTime}</div>
        </motion.div>

        <motion.div 
          className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg p-4"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-2xl font-bold text-orange-600">
            {stats.offlineQueueSize || 0}
          </div>
          <div className="text-sm text-gray-600">{t.queueSize}</div>
        </motion.div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {t.target}: {stats.submissionsToday}/{targetSubmissions} {t.submissions}
          </span>
          <span className={`text-sm px-2 py-1 rounded-full ${performanceStatus.bg} ${performanceStatus.color}`}>
            {performanceStatus.text}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            className="bg-gradient-to-r from-bot-green to-bot-dark-green h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${getProgressPercentage()}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="text-right text-sm text-gray-500 mt-1">
          {Math.round(getProgressPercentage())}% complete
        </div>
      </div>

      {/* Active Time and Last Activity */}
      <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
        <div className="flex items-center space-x-4">
          <span>{t.timeActive}: {getActiveTime()}</span>
          {stats.lastSubmissionTime && (
            <>
              <span>•</span>
              <span>{t.lastSubmission}: {new Date(stats.lastSubmissionTime).toLocaleTimeString()}</span>
            </>
          )}
        </div>
        <div className="text-xs">
          {currentTime.toLocaleString()}
        </div>
      </div>

      {/* Performance Tips */}
      {stats.avgTimePerSubmission > 45 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
        >
          <h3 className="font-medium text-yellow-800 mb-2">💡 Tips for faster collection:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Pre-fill the station name for each person</li>
            <li>• Focus on name and destination - other fields are optional</li>
            <li>• Use voice input if available</li>
            <li>• Keep the energy high and positive!</li>
          </ul>
        </motion.div>
      )}
    </div>
  );
}