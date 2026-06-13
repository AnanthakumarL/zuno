# Admin Dashboard Setup & Deployment Guide

## ⚠️ CRITICAL: How to Properly Start (MUST READ)

The Vite dev server **caches configuration at startup**. Configuration changes only apply when the dev server starts.

### Correct Startup Procedure

**Option 1: Using run-all.bat (Recommended)**
```batch
# From project root
.\run-all.bat
# Wait 10-15 seconds for everything to start
# Visit http://localhost:5173
```

**Option 2: Manual Clean Restart**
```batch
# Step 1: Close run-all.bat (Ctrl+C)
# Step 2: Kill all Node processes
taskkill /F /IM node.exe

# Step 3: Wait 3 seconds
timeout /t 3

# Step 4: Restart
.\run-all.bat
```

**Verify It's Working**
```batch
# Run the test script
.\test-services.bat
```

## Overview
The Admin Dashboard uses a **local development proxy** system to seamlessly switch between local database and production server.

## Local Development Setup

### Prerequisites
- Node.js 16+
- Backend API running on `http://localhost:7999`
- Local database setup (MySQL, PostgreSQL, etc.)

### 1. Install Dependencies
```bash
cd Admin
npm install
```

### 2. Environment Configuration
A `.env.local` file has been created for you with:
```env
VITE_API_BASE_URL=/api/v1        # Relative path - routes through Vite proxy
VITE_API_TARGET=http://localhost:7999
```

### 3. How Local Development Works

```
┌─────────────────────────────────────────────────┐
│           Browser (localhost:5173)              │
│                                                 │
│  axios request to "/api/v1/products"           │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  Vite Dev Server (Port 5173)                   │
│  - Intercepts /api/v1 requests                  │
│  - Proxies to localhost:7999                    │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  Backend FastAPI (localhost:7999)              │
│  - Connects to Local Database                   │
│  - Returns data without CORS issues             │
└─────────────────────────────────────────────────┘
```

### 4. Starting Development Server
```bash
npm run dev
```

This will:
- Start Vite dev server on http://localhost:5173
- Configure API base URL as `/api/v1` (uses proxy)
- Routes go through Vite proxy → avoids CORS issues
- Connects to local database on port 7999

## Production Deployment

### Environment Configuration
`.env.production` uses the production backend URL:
```env
VITE_API_BASE_URL=http://80.225.216.174:8000/api/v1
```

### 1. Build for Production
```bash
npm run build
```

This creates an optimized build with:
- Router basename: `/admin/`
- API base URL: Production backend
- Base path: `/admin/`

### 2. How Production Works

```
┌──────────────────────────────────────────┐
│  Production Server (80.225.216.174:8000) │
│  - Serves /admin/* on static server      │
│  - Proxy passes /api/v1 to FastAPI       │
└──────────────────┬───────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────┐
│  Browser requests to:                    │
│  - http://.../admin/                     │
│  - http://.../api/v1/products            │
└──────────────────────────────────────────┘
```

## Troubleshooting

### Issue: "CORS Error: ngrok-skip-browser-warning"
**Solution:** ✓ FIXED - Removed the problematic header from api.ts

### Issue: "Cannot reach localhost:7999"
**Solution:** Ensure your backend is running:
```bash
# In backend directory
python -m uvicorn main:app --reload --port 7999
```

### Issue: API requests still failing in development
**Check:**
1. Is Vite dev server running? (`npm run dev`)
2. Is backend running on port 7999?
3. Check browser console for detailed error messages

### Debug API Calls
Open browser DevTools → Console. You'll see logs like:
```
[API Request] GET /api/v1/products?page=1&page_size=200
[API Response] 200 /api/v1/products?page=1&page_size=200
```

## API Configuration Details

### Local Development
- **Request Flow**: Browser → Vite Proxy → Backend (localhost:7999)
- **Base URL**: `/api/v1` (relative)
- **CORS**: Handled by Vite proxy (no CORS issues)
- **Database**: Local database connected to localhost:7999

### Production
- **Request Flow**: Browser → Direct to Production Backend
- **Base URL**: `http://80.225.216.174:8000/api/v1` (absolute)
- **CORS**: Must be configured on backend
- **Database**: Production database

## File Structure
```
Admin/
├── .env.local                 # Local dev environment
├── .env.production            # Production environment (auto-created on build)
├── vite.config.js             # Vite config with proxy setup
├── src/
│   ├── config.js              # Environment-aware configuration
│   ├── App.jsx                # Dynamic router basename
│   └── services/
│       └── api.ts             # Axios client with interceptors
└── package.json
```

## Key Changes Made

### 1. Removed CORS-Blocking Header
- Removed `'ngrok-skip-browser-warning': 'true'` from axios headers
- This was causing CORS policy rejection

### 2. Added Environment-Aware Configuration
- Local dev: `/api/v1` (uses Vite proxy)
- Production: Full backend URL

### 3. Added Request/Response Interceptors
- Console logging for debugging
- Better error messages
- Clear indication of network issues

### 4. Dynamic Router Configuration
- Basename automatically adjusts based on environment
- Local: `/`
- Production: `/admin/`

## Quick Start
```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

---
**Last Updated:** May 25, 2026

## Additional Resources

- Use `test-services.bat` from project root to verify all services are running
- Vite proxy logs can be seen in browser DevTools Console
- Backend logs visible in "Zenora-Server" terminal window
