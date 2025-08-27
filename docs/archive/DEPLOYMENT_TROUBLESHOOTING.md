# 🔧 Deployment Troubleshooting Guide

## Quick Diagnosis

Run this command to check your deployment configuration:
```bash
npm run check-deployment
```

## Common Vercel Deployment Issues & Solutions

### 1. Module Resolution Errors
**Error**: `Module not found: Can't resolve '@/components/layout'`

**Causes & Solutions**:
- ✅ **Fixed**: Webpack alias configuration in `next.config.ts`
- ✅ **Fixed**: TypeScript path mapping with `baseUrl` in `tsconfig.json`
- ✅ **Fixed**: Git case sensitivity configuration

### 2. Case Sensitivity Issues
**Problem**: Files work locally but fail on Vercel due to case-sensitive filesystem.

**Solution**: 
```bash
git config core.ignorecase false
```

### 3. Node.js Version Compatibility
**Problem**: Different Node.js versions between local and Vercel.

**Solution**: Set specific Node.js version in `vercel.json`:
```json
{
  "nodeVersion": "18.x"
}
```

## Deployment Configuration Files

### ✅ `next.config.ts` - Webpack Alias Configuration
```typescript
import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};
```

### ✅ `tsconfig.json` - TypeScript Configuration
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### ✅ `vercel.json` - Vercel Configuration
```json
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "nodeVersion": "18.x",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

## Pre-deployment Checklist

Before deploying to Vercel, ensure:

1. **✅ Build passes locally**: `npm run build`
2. **✅ Tests pass**: `npm run test:all`
3. **✅ Lint passes**: `npm run lint`
4. **✅ Configuration check**: `npm run check-deployment`
5. **✅ Environment variables set** in Vercel dashboard
6. **✅ Git case sensitivity**: `git config core.ignorecase false`

## Environment Variables for Vercel

Required environment variables in Vercel dashboard:

```
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
NODE_ENV=production
```

## Debugging Steps

1. **Check Vercel Build Logs**
   - Look for specific error messages
   - Check if dependencies are installing correctly
   - Verify build command execution

2. **Compare Local vs Vercel**
   - Ensure same Node.js version
   - Check environment variables
   - Verify file structure matches

3. **Test Individual Components**
   - Isolate failing imports
   - Check component export/import structure
   - Verify path alias resolution

## Support Commands

```bash
# Check deployment configuration
npm run check-deployment

# Test full build process
npm run build

# Run all tests
npm run test:all

# Check for TypeScript issues
npx tsc --noEmit

# Verify git case sensitivity
git config core.ignorecase

# Check Next.js configuration
npx next info
```

## Recovery Strategies

If deployment still fails:

1. **Fallback to Relative Imports**
   ```typescript
   // Instead of: import { Header } from '@/components/layout'
   // Use: import { Header } from '../src/components/layout'
   ```

2. **Manual Webpack Configuration**
   - Add more specific webpack aliases
   - Configure module resolution explicitly

3. **Environment Debugging**
   - Add console.log statements in next.config.ts
   - Check Vercel function logs

## Success Indicators

✅ Vercel build completes without errors
✅ All API endpoints respond correctly
✅ Static assets load properly
✅ TypeScript compilation succeeds
✅ Client-side navigation works
✅ Database connections established

---

**Last Updated**: After implementing webpack alias configuration, git case sensitivity fixes, and comprehensive deployment validation.
