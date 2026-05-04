# 🔧 Fix Railway Build Error - "vite: not found"

## ❌ The Problem
Railway is trying to build the entire project (including client) instead of just the server.

**Error Message:**
```
sh: 1: vite: not found
Build Failed: build daemon returned an error
```

---

## ✅ The Solution

### **Step 1: Set Root Directory in Railway**

1. Go to your Railway project dashboard
2. Click on your service (the one that's failing)
3. Click on **Settings** tab (gear icon)
4. Scroll down to find **Service Settings** section
5. Look for **Root Directory** field
6. Type: `server` (exactly as shown)
7. Click **Save** or press Enter

**Visual Guide:**
```
Railway Dashboard
  └── Your Service
      └── Settings ⚙️
          └── Service Settings
              └── Root Directory: [server] ← Type this here
```

### **Step 2: Verify Start Command**

While in Settings, also verify:
- **Start Command**: `npm start`
- **Build Command**: Leave empty (Railway auto-detects)

### **Step 3: Redeploy**

Railway will automatically redeploy after you save the root directory setting.

If it doesn't:
1. Go to **Deployments** tab
2. Click **Deploy** button
3. Or push a new commit to trigger deployment

---

## 🎯 Why This Happens

Your project structure:
```
Learning_Management_system/
├── client/              ← React frontend (not needed on Railway)
├── server/              ← Node.js backend (this is what we want)
└── package.json         ← Root package.json (has client:build script)
```

Without setting root directory:
- Railway sees root `package.json`
- Runs `npm run build` from root
- This tries to build the client
- Client needs `vite` which isn't installed at root level
- **Build fails** ❌

With root directory set to `server`:
- Railway only sees `server/package.json`
- Runs `npm install` in server folder
- Runs `npm start` to start the server
- **Build succeeds** ✅

---

## 🔍 Verify It's Working

After setting root directory, check the build logs:

**Good logs should show:**
```
Building from directory: server
Running: npm install
Running: npm start
Server running on port 5000
✅ Database connected
```

**Bad logs would show:**
```
Building from directory: /
Running: npm run build
cd client && npm run build
vite: not found ❌
```

---

## 🚀 Alternative: Use Railway CLI

If you prefer using CLI:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Set root directory
railway up --service server

# Or set via environment
railway variables set ROOT_DIRECTORY=server
```

---

## 📝 Configuration File (Optional)

I've created a `server/railway.toml` file in your project:

```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

This file helps Railway understand how to build your server, but **setting the Root Directory in the dashboard is still required**.

---

## ✅ Final Checklist

- [ ] Root Directory set to `server` in Railway Settings
- [ ] Start Command is `npm start`
- [ ] Environment variables added (DB credentials, JWT secret, etc.)
- [ ] Deployment triggered
- [ ] Build logs show "Building from directory: server"
- [ ] Server starts successfully
- [ ] Database connection works

---

## 🆘 Still Having Issues?

### Check These:

1. **Root Directory is exactly:** `server` (lowercase, no slashes)
2. **server/package.json exists** and has `"start": "node src/server.js"`
3. **All environment variables** are added in Railway Variables tab
4. **Database credentials** are correct

### Common Mistakes:

❌ Root Directory: `/server` (don't add leading slash)
❌ Root Directory: `server/` (don't add trailing slash)
❌ Root Directory: `Server` (case-sensitive, use lowercase)
✅ Root Directory: `server` (correct!)

---

## 📸 Screenshot Guide

**Where to find Root Directory setting:**

```
Railway Dashboard
  ↓
Click your service name
  ↓
Click "Settings" tab (⚙️ icon)
  ↓
Scroll to "Service Settings"
  ↓
Find "Root Directory" input field
  ↓
Type: server
  ↓
Click outside or press Enter to save
  ↓
Wait for automatic redeploy
```

---

## 🎉 Success!

Once configured correctly, your server will:
- ✅ Build successfully
- ✅ Connect to Aiven database
- ✅ Start on Railway's assigned port
- ✅ Be accessible via your Railway domain

Your API will be available at:
```
https://your-app-name.railway.app/api
```

Test it:
```bash
curl https://your-app-name.railway.app/api/health
```
