# Railway Deployment Guide - NexLern Server

## 📋 Railway Configuration

### **IMPORTANT: Root Directory Setting**
⚠️ **You MUST set the Root Directory in Railway to avoid build errors!**

### **Root Directory**
```
server
```
**This is CRITICAL!** Railway needs to know to only build the server folder, not the entire monorepo.

### **Build Command**
```bash
npm install
```
(Railway auto-detects this, but you can set it explicitly)

### **Start Command**
```bash
npm start
```

### **Watch Paths** (Optional)
```
server/**
```

---

## 🔐 Environment Variables

Add these environment variables in Railway dashboard:

### **Database Configuration**
```env
DB_HOST=your-database-host.aivencloud.com
DB_PORT=27794
DB_USER=your-db-username
DB_PASSWORD=your-database-password
DB_NAME=NexLern
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
```

### **Server Configuration**
```env
PORT=5000
NODE_ENV=production
```

### **JWT Secret**
```env
JWT_SECRET=a7f3d8e9c2b1f4a6e8d3c7b9f2a5e8d1c4b7f9a2e5d8c1b4f7a9e2d5c8b1f4a7e9d2c5b8f1a4e7d9c2b5f8a1e4d7c9b2f5a8e1d4c7b9f2a5e8d1c4b7
```

---

## 📝 Step-by-Step Deployment

### **1. Create New Project in Railway**
- Go to [Railway.app](https://railway.app)
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose your repository: `Learning_Management_system`

### **2. Configure Service Settings** ⚠️ **CRITICAL STEP**
- Click on your service
- Go to **Settings** tab
- Scroll down to **Service Settings**
- Find **Root Directory** field
- Set **Root Directory**: `server` (type exactly: `server`)
- Click **Save**
- Set **Start Command**: `npm start`
- Railway will automatically redeploy with correct settings

**Why this is important:** Without setting the root directory, Railway will try to build from the project root and fail because it will try to build the client too.

### **3. Add Environment Variables**
- Go to **Variables** tab
- Click "New Variable"
- Add all the environment variables listed above (one by one)

**Quick Copy-Paste Format:**
```
DB_HOST=your-database-host.aivencloud.com
DB_PORT=27794
DB_USER=your-db-username
DB_PASSWORD=your-database-password
DB_NAME=NexLern
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
PORT=5000
NODE_ENV=production
JWT_SECRET=a7f3d8e9c2b1f4a6e8d3c7b9f2a5e8d1c4b7f9a2e5d8c1b4f7a9e2d5c8b1f4a7e9d2c5b8f1a4e7d9c2b5f8a1e4d7c9b2f5a8e1d4c7b9f2a5e8d1c4b7
```

### **4. Deploy**
- Railway will automatically deploy after you add the variables
- Or click "Deploy" button manually

### **5. Get Your Deployment URL**
- Go to **Settings** tab
- Under "Domains" section
- Click "Generate Domain"
- Your API will be available at: `https://your-app.railway.app`

---

## 🔍 Important Notes

### **API Endpoints**
All your API endpoints are prefixed with `/api`:
- Auth: `/api/auth/*`
- Courses: `/api/courses/*`
- Students: `/api/students/*`
- Teachers: `/api/teachers/*`
- Admin: `/api/admin/*`
- etc.

### **File Uploads**
The server uses `multer` for file uploads. Railway has ephemeral storage, so uploaded files will be lost on redeployment. Consider using:
- **Cloudinary** (recommended for images/videos)
- **AWS S3**
- **Railway Volumes** (persistent storage)

### **Database Connection**
- Your database is already hosted on Aiven Cloud
- SSL is enabled for secure connection
- Connection will be tested on server startup

### **Health Check**
After deployment, test your server:
```bash
curl https://your-app.railway.app/api/health
```

---

## 🚀 Post-Deployment

### **Update Client API URL**
Update your client's API base URL to point to Railway:

In `client/src/api/http.js` or similar:
```javascript
const API_BASE_URL = 'https://your-app.railway.app/api'
```

### **Test Endpoints**
Test key endpoints:
- `GET /api/health` - Health check
- `POST /api/auth/login` - Login
- `GET /api/courses` - Get courses

### **Monitor Logs**
- Go to Railway dashboard
- Click on your service
- View **Deployments** tab for logs
- Check for any errors or warnings

---

## 🛠️ Troubleshooting

### **Build Fails**
- Check if `package.json` is in the `server` directory
- Verify Root Directory is set to `server`
- Check build logs for specific errors

### **Database Connection Issues**
- Verify all DB environment variables are correct
- Check if Aiven database is accessible
- Ensure SSL settings are correct

### **Port Issues**
- Railway automatically assigns a PORT
- Your app should use `process.env.PORT`
- Default fallback is 5000

### **Environment Variables Not Working**
- Make sure variables are added in Railway dashboard
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

---

## 📊 Railway Dashboard Overview

```
Project
  └── Service (NexLern Server)
      ├── Settings
      │   ├── Root Directory: server
      │   ├── Start Command: npm start
      │   └── Domains: Generate domain here
      ├── Variables
      │   └── Add all environment variables
      ├── Deployments
      │   └── View logs and deployment history
      └── Metrics
          └── Monitor CPU, Memory, Network
```

---

## ✅ Deployment Checklist

- [ ] Repository connected to Railway
- [ ] Root directory set to `server`
- [ ] All environment variables added
- [ ] NODE_ENV set to `production`
- [ ] Database credentials verified
- [ ] Domain generated
- [ ] Deployment successful
- [ ] Health check endpoint working
- [ ] API endpoints tested
- [ ] Client updated with new API URL

---

## 🔗 Useful Links

- Railway Dashboard: https://railway.app/dashboard
- Railway Docs: https://docs.railway.app
- Your Repository: https://github.com/AsfandAhmad/Learning_Management_system

---

## 📞 Support

If you encounter issues:
1. Check Railway deployment logs
2. Verify environment variables
3. Test database connection
4. Check server logs for errors

**Server Entry Point:** `server/src/server.js`
**Port:** Railway assigns automatically (or 5000 as fallback)
**Database:** Aiven Cloud MySQL (already configured)
