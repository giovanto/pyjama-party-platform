# 🚀 Vercel Deployment Instructions

## ✅ Repository Status: READY FOR DEPLOYMENT

### 🎯 Current Branch Structure
```
✅ main                  - Production-ready V3 code (USE THIS)
✅ archive/legacy-v1-v2  - Legacy versions archived  
```

## 🚀 **DEPLOY TO VERCEL NOW**

### Step 1: Go to Vercel Dashboard
1. Visit: [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**

### Step 2: Import Repository
1. **Repository:** `giovanto/pajama-party-platform`
2. **Branch:** `main` ⭐ (IMPORTANT: Use this branch)
3. **Root Directory:** `.` ⭐ (Code is now in root directory)

### Step 3: Configure Build Settings
```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm ci
Root Directory: . (leave empty or use . for root)
```

### Step 4: Environment Variables
Add these in Vercel project settings:

```bash
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoiZ2lvdmFudG8iLCJhIjoiY21jdnA4c3p0MDE1cDJqcXJjejE3Ymg3YiJ9.OKkbmDiZosRlNgJP-H86XA

NEXT_PUBLIC_SUPABASE_URL=https://ouzeawngrhmbyrhkypfu.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91emVhd25ncmhtYnlyaGt5cGZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxMzg0ODIsImV4cCI6MjA2NzcxNDQ4Mn0.ACBWCIMnTUN4X1A3yx3i44vFUc75bVvUp_YrZz6VDM8

NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app

NODE_ENV=production
```

### Step 5: Deploy
Click **"Deploy"** and wait ~2-3 minutes.

## ✅ **What Will Deploy**

### ✅ Working Features
- 🗺️ Interactive Mapbox map with European routes
- 🚂 Dream route submission with station autocomplete  
- 👥 Community stats and metrics
- 📱 Responsive design with animations
- 🌱 Complete night train advocacy platform

### ✅ Production Stack
- **Frontend:** Next.js 15 + React 19 + TypeScript
- **Backend:** Supabase PostgreSQL with real-time features
- **Map:** Mapbox GL with custom route visualization
- **Deployment:** Vercel serverless with global CDN
- **Testing:** 6/6 integration tests passing

## 🔍 **Post-Deployment Testing**

After deployment, test these URLs:
```bash
# Health check
https://your-app.vercel.app/api/health

# Station search
https://your-app.vercel.app/api/stations/search?q=berlin

# Community stats
https://your-app.vercel.app/api/stats
```

## 🎯 **Expected Results**
- **Load time:** < 2 seconds globally
- **Station search:** Returns Berlin, Vienna, Paris stations
- **Dream submission:** Saves to Supabase database
- **Map:** Interactive with real route data
- **Stats:** Live community metrics

## 🛠️ **If Deployment Issues**

### Build Errors
- Check environment variables are set correctly
- Verify root directory is `pajama-party-v3`
- Ensure branch is `production-main`

### Runtime Errors  
- Check Supabase database schema is applied
- Verify Mapbox token is valid
- Test API endpoints work locally first

## 🎉 **SUCCESS!**

Once deployed, you'll have:
✅ **Live demo** of the Pajama Party Platform
✅ **Global CDN** for fast worldwide access
✅ **Automatic HTTPS** with custom domain options
✅ **Professional platform** ready for community sharing
✅ **Scalable infrastructure** handling thousands of users

## 🌟 **Next Steps After Deployment**

1. **Test the platform** thoroughly
2. **Update README** with live demo URL
3. **Share with community** 
4. **Make repository public**
5. **Start collecting real dream routes!**

**Ready to advocate for sustainable night trains across Europe! 🚂✨**