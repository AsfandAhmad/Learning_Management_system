# 🔧 Railway Deployment Crash - Troubleshooting Guide

## 🚨 Common Causes of Railway Crashes

### **1. Wrong Root Directory**
**Symptom:** Build tries to run client code
**Fix:** Set Root Directory to `server`

### **2. Wrong Start Command**
**Symptom:** `nodemon: not found` or `vite: not found`
**Fix:** Use `node src/server.js` NOT `npm start` or `npm run dev`

### **3. Missing Environment Variables**
**Symptom:** Database connection fails
**Fix:** Add all required environment variables

### **4. Database Connection Issues**
**Symptom:** Server starts but crashes immediately
**Fix:** Verify database credentials

---

## ✅ Step-by-Step Fix

### **Step 1: Check Root Directory**

1. Go to Railway dashboard
2. Click your service
3. Go to **Settings** tab
4. Scroll to **Service Settings**
5. Find **Root Directory**
6. Make sure it says: `server`
7. If not, type `server` and save

### **Step 2: Check Start Command**

In **Settings** → **Deploy**:

**Start Command should be:**
```bash
node src/server.js
```

**NOT:**
- ❌ `npm start`
- ❌ `npm run dev`
- ❌ `nodemon src/server.js`

### **Step 3: Verify Environment Variables**

Go to **Variables** tab and make sure you have ALL of these:

```env
DB_HOST=your-aiven-host.aivencloud.com
DB_PORT=27794
DB_USER=your-db-username
DB_PASSWORD=your-db-password
DB_NAME=NexLern
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
PORT=5000
NODE_ENV=production
JWT_SECRET=your-long-secret-key
```

### **Step 4: Check Build Logs**

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Check the logs for errors

**Look for:**
- ❌ `Cannot find module`
- ❌ `ECONNREFUSED` (database connection)
- ❌ `nodemon: not found`
- ❌ `vite: not found`

---

## 🔍 Specific Error Solutions

### **Error: `nodemon: not found`**

**Cause:** Start command is using `npm run dev`

**Fix:**
1. Go to Settings
2. Set Start Command to: `node src/server.js`
3. Redeploy

### **Error: `vite: not found`**

**Cause:** Root Directory is not set to `server`

**Fix:**
1. Go to Settings
2. Set Root Directory to: `server`
3. Save and redeploy

### **Error: `Failed to connect to database`**

**Cause:** Missing or incorrect database credentials

**Fix:**
1. Go to Variables tab
2. Verify all DB_* variables are correct
3. Check DB_HOST, DB_USER, DB_PASSWORD
4. Make sure DB_SSL=true
5. Redeploy

### **Error: `Port already in use`**

**Cause:** Multiple deployments running

**Fix:**
1. Railway handles this automatically
2. Just redeploy

### **Error: `Cannot find module 'express'`**

**Cause:** Dependencies not installed

**Fix:**
1. Make sure `package.json` is in `server/` folder
2. Railway should auto-install
3. Check build logs

---

## 🎯 Correct Railway Configuration

### **Settings Tab:**

```
Root Directory: server
```

### **Deploy Section:**

```
Build Command: (leave empty - auto-detected)
Start Command: node src/server.js
```

### **Variables Tab:**

```
DB_HOST=your-database-host
DB_PORT=27794
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=NexLern
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
PORT=5000
NODE_ENV=production
JWT_SECRET=your-secret-key
```

---

## 🧪 Test Your Configuration

### **1. Test Locally First**

```bash
cd server
node src/server.js
```

Should output:
```
✅ Database connected
Server running on port 5000
```

### **2. Test with Production Environment**

```bash
cd server
NODE_ENV=production node src/server.js
```

### **3. Check Railway Logs**

After deployment, check logs for:
```
✅ Database connected
Server running on port 5000
```

---

## 📋 Deployment Checklist

Before deploying, verify:

- [ ] Root Directory = `server`
- [ ] Start Command = `node src/server.js`
- [ ] All environment variables added
- [ ] DB credentials are correct
- [ ] `server/package.json` exists
- [ ] `server/src/server.js` exists
- [ ] Local test works: `node src/server.js`

---

## 🚀 Force Redeploy

If everything looks correct but still crashing:

1. Go to **Deployments** tab
2. Click **"Deploy"** button (top right)
3. Or push a new commit:
```bash
git commit --allow-empty -m "Trigger Railway redeploy"
git push origin main
```

---

## 🆘 Still Crashing?

### **Get Detailed Logs:**

1. Go to Railway dashboard
2. Click your service
3. Go to **Deployments** tab
4. Click the failed deployment
5. Copy the full error log
6. Look for the actual error message (usually at the bottom)

### **Common Log Patterns:**

**Pattern 1: Module not found**
```
Error: Cannot find module 'express'
```
**Fix:** Dependencies not installed. Check Root Directory.

**Pattern 2: Database connection**
```
Error: connect ECONNREFUSED
```
**Fix:** Check database environment variables.

**Pattern 3: Port issues**
```
Error: listen EADDRINUSE
```
**Fix:** Railway handles ports automatically. Redeploy.

**Pattern 4: Syntax errors**
```
SyntaxError: Unexpected token
```
**Fix:** Code error. Check your recent changes.

---

## 📞 Quick Fixes Summary

| Error | Quick Fix |
|-------|-----------|
| `nodemon: not found` | Change start command to `node src/server.js` |
| `vite: not found` | Set Root Directory to `server` |
| Database connection fails | Check environment variables |
| Module not found | Verify Root Directory is `server` |
| Port in use | Just redeploy |

---

## ✅ Expected Successful Deployment

**Build logs should show:**
```
Building from directory: server
Running: npm install
Dependencies installed
Starting: node src/server.js
✅ Database connected
Server running on port 5000
```

**Service should show:**
- Status: ✅ Active
- Health: ✅ Healthy
- Domain: Generated and accessible

---

## 🔗 Test Your Deployment

Once deployed successfully:

```bash
# Test health endpoint
curl https://your-app.railway.app/api/health

# Should return:
{"ok":true}
```

---

## 💡 Pro Tips

1. **Always set Root Directory first** - This is the #1 cause of crashes
2. **Use `node` not `npm`** - Production should use node directly
3. **Check logs immediately** - Don't wait, check logs right after deploy
4. **Test locally first** - Run `node src/server.js` locally before deploying
5. **One change at a time** - If it works, don't change multiple things at once

---

*Last Updated: Now*
