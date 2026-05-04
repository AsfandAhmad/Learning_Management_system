# ⚡ Railway Quick Fix - Stop the Crash

## 🎯 Do These 3 Things RIGHT NOW:

### **1. Set Root Directory**
Railway Dashboard → Your Service → Settings → Service Settings
```
Root Directory: server
```
Type exactly: `server` (lowercase, no slashes)

### **2. Set Start Command**
Railway Dashboard → Your Service → Settings → Deploy
```
Start Command: node src/server.js
```
Type exactly: `node src/server.js`

### **3. Check Environment Variables**
Railway Dashboard → Your Service → Variables

Make sure you have these (use YOUR actual values):
```
DB_HOST=your-aiven-host.aivencloud.com
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

## ✅ Then Redeploy

Click **"Deploy"** button in Railway dashboard

---

## 🔍 Check Logs

After deployment, go to **Deployments** tab and look for:

**✅ Success looks like:**
```
Building from directory: server
npm install
Starting: node src/server.js
✅ Database connected
Server running on port 5000
```

**❌ Failure looks like:**
```
nodemon: not found
vite: not found
Cannot find module
```

---

## 🆘 If Still Crashing

**Copy the error from Railway logs and share it.**

The error is usually at the bottom of the deployment logs.

---

## 📸 Visual Guide

```
Railway Dashboard
  ↓
Click Your Service
  ↓
Settings Tab
  ↓
Service Settings Section
  ↓
Root Directory: [server] ← Type this
  ↓
Deploy Section
  ↓
Start Command: [node src/server.js] ← Type this
  ↓
Variables Tab
  ↓
Add all DB_* variables
  ↓
Deployments Tab
  ↓
Click "Deploy"
```

---

## 🎉 Success Test

Once deployed, test:
```bash
curl https://your-app.railway.app/api/health
```

Should return: `{"ok":true}`
