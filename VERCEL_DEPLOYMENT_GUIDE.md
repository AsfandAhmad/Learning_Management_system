# Vercel Deployment Guide - NexLern Frontend

## 📋 Vercel Configuration

### **Root Directory**
```
client
```

### **Framework Preset**
```
Vite
```

### **Build Command**
```bash
npm run build
```

### **Output Directory**
```
dist
```

### **Install Command**
```bash
npm install
```

---

## 🔐 Environment Variables

Add this environment variable in Vercel dashboard:

### **API URL** (REQUIRED)
```env
VITE_API_URL=https://your-railway-app.railway.app/api
```

**⚠️ Important:** Replace `your-railway-app` with your actual Railway deployment URL!

---

## 📝 Step-by-Step Deployment

### **1. Prepare Your Repository**

First, commit and push the updated files:

```bash
git add client/src/api/http.js client/vercel.json client/.env.example
git commit -m "Configure frontend for Vercel deployment"
git push origin main
```

### **2. Create New Project in Vercel**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository: `Learning_Management_system`
4. Click **"Import"**

### **3. Configure Project Settings**

Vercel will show configuration screen:

#### **Framework Preset:**
- Select: **Vite** (should auto-detect)

#### **Root Directory:**
- Click **"Edit"** next to Root Directory
- Select: `client`
- Click **"Continue"**

#### **Build and Output Settings:**
- **Build Command:** `npm run build` (auto-filled)
- **Output Directory:** `dist` (auto-filled)
- **Install Command:** `npm install` (auto-filled)

### **4. Add Environment Variables**

Before deploying, add environment variables:

1. Expand **"Environment Variables"** section
2. Add variable:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://your-railway-app.railway.app/api`
   - Select: **Production**, **Preview**, **Development** (all three)
3. Click **"Add"**

**🔴 CRITICAL:** You MUST replace `your-railway-app` with your actual Railway backend URL!

### **5. Deploy**

1. Click **"Deploy"** button
2. Wait for build to complete (usually 1-2 minutes)
3. Vercel will show you the deployment URL

### **6. Get Your Deployment URL**

After successful deployment:
- Your app will be available at: `https://your-project.vercel.app`
- Vercel provides a production URL automatically
- You can add custom domains later

---

## 🔗 Connect Frontend to Backend

### **Get Your Railway Backend URL**

1. Go to Railway dashboard
2. Click on your server service
3. Go to **Settings** → **Domains**
4. Copy the generated domain (e.g., `https://nexlern-production.up.railway.app`)

### **Update Vercel Environment Variable**

1. Go to Vercel dashboard
2. Click on your project
3. Go to **Settings** → **Environment Variables**
4. Find `VITE_API_URL`
5. Click **"Edit"**
6. Update value to: `https://your-actual-railway-url.railway.app/api`
7. Click **"Save"**
8. Go to **Deployments** tab
9. Click **"Redeploy"** on the latest deployment

---

## 🎯 Project Structure

Your deployment setup:

```
Learning_Management_system/
├── client/                    ← Vercel deploys this
│   ├── src/
│   │   └── api/
│   │       └── http.js       ← Updated to use VITE_API_URL
│   ├── vercel.json           ← Vercel configuration
│   ├── .env.example          ← Environment variable template
│   ├── package.json
│   └── vite.config.js
└── server/                    ← Railway deploys this
    └── ...
```

---

## ✅ Verification Steps

### **1. Test Frontend Deployment**

Visit your Vercel URL:
```
https://your-project.vercel.app
```

You should see the NexLern landing page with purple theme.

### **2. Test API Connection**

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Try to login or register
4. Check **Network** tab for API calls
5. Verify requests go to your Railway backend URL

### **3. Check Environment Variables**

In browser console, run:
```javascript
console.log(import.meta.env.VITE_API_URL)
```

Should output: `https://your-railway-app.railway.app/api`

---

## 🛠️ Troubleshooting

### **Build Fails**

**Error:** `Cannot find module 'vite'`
- **Solution:** Make sure Root Directory is set to `client`

**Error:** `Build exceeded maximum duration`
- **Solution:** Check if all dependencies are in `package.json`
- Try deploying again (sometimes it's a temporary issue)

### **API Connection Issues**

**Error:** `Network Error` or `CORS Error`
- **Solution:** Check if `VITE_API_URL` is set correctly
- Verify Railway backend is running
- Check Railway backend has CORS enabled

**Error:** `404 Not Found` on API calls
- **Solution:** Make sure API URL ends with `/api`
- Example: `https://your-app.railway.app/api` (not just `https://your-app.railway.app`)

### **Routing Issues (404 on refresh)**

**Error:** Page not found when refreshing on routes like `/student/dashboard`
- **Solution:** The `vercel.json` file handles this (already created)
- Make sure `vercel.json` is in the `client` folder

### **Environment Variables Not Working**

- Make sure variable name starts with `VITE_` (required by Vite)
- Redeploy after adding/changing environment variables
- Check variable is added to all environments (Production, Preview, Development)

---

## 🚀 Post-Deployment Configuration

### **1. Update CORS on Backend**

Make sure your Railway backend allows requests from Vercel:

In `server/src/app.js`, update CORS configuration:

```javascript
import cors from 'cors';

const allowedOrigins = [
  'http://localhost:3000',
  'https://your-project.vercel.app',  // Add your Vercel URL
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

Or allow all origins (for testing):
```javascript
app.use(cors());
```

### **2. Add Custom Domain (Optional)**

1. Go to Vercel project settings
2. Click **"Domains"**
3. Add your custom domain
4. Follow DNS configuration instructions

### **3. Enable Analytics (Optional)**

Vercel provides free analytics:
1. Go to **Analytics** tab in your project
2. Click **"Enable"**

---

## 📊 Vercel Dashboard Overview

```
Project (NexLern Frontend)
  ├── Overview
  │   └── Latest deployment status
  ├── Deployments
  │   └── All deployment history
  ├── Settings
  │   ├── General
  │   │   └── Root Directory: client
  │   ├── Environment Variables
  │   │   └── VITE_API_URL
  │   ├── Domains
  │   │   └── Add custom domains
  │   └── Git
  │       └── Connected repository
  └── Analytics
      └── Traffic and performance
```

---

## 🔄 Automatic Deployments

Vercel automatically deploys when you push to GitHub:

- **Push to `main` branch** → Production deployment
- **Push to other branches** → Preview deployment
- **Pull requests** → Preview deployment with unique URL

### **Disable Auto-Deploy (Optional)**

If you want manual control:
1. Go to **Settings** → **Git**
2. Disable **"Production Branch"** auto-deployments

---

## ✅ Deployment Checklist

- [ ] Repository pushed to GitHub
- [ ] Vercel project created
- [ ] Root directory set to `client`
- [ ] Framework preset set to `Vite`
- [ ] `VITE_API_URL` environment variable added
- [ ] Railway backend URL is correct
- [ ] Build successful
- [ ] Frontend accessible via Vercel URL
- [ ] API calls working (check Network tab)
- [ ] Login/Register functionality working
- [ ] CORS configured on backend
- [ ] All routes working (no 404 on refresh)

---

## 🎨 Your Deployed Stack

```
┌─────────────────────────────────────┐
│   Frontend (Vercel)                 │
│   https://nexlern.vercel.app        │
│   - React + Vite                    │
│   - Purple theme UI                 │
│   - Client-side routing             │
└─────────────┬───────────────────────┘
              │
              │ HTTPS API Calls
              │
┌─────────────▼───────────────────────┐
│   Backend (Railway)                 │
│   https://nexlern.railway.app/api   │
│   - Node.js + Express               │
│   - JWT Authentication              │
│   - File uploads                    │
└─────────────┬───────────────────────┘
              │
              │ MySQL Connection
              │
┌─────────────▼───────────────────────┐
│   Database (Aiven Cloud)            │
│   MySQL Database                    │
│   - User data                       │
│   - Courses, Lessons, etc.          │
└─────────────────────────────────────┘
```

---

## 🔗 Useful Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Vercel Docs:** https://vercel.com/docs
- **Vite Docs:** https://vitejs.dev
- **Your Repository:** https://github.com/AsfandAhmad/Learning_Management_system

---

## 📞 Quick Commands

### **Redeploy from CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd client
vercel --prod
```

### **View Logs**

```bash
vercel logs
```

### **Check Environment Variables**

```bash
vercel env ls
```

---

## 🎉 Success Indicators

Your deployment is successful when:

✅ Build completes without errors
✅ Vercel provides a deployment URL
✅ Landing page loads with purple theme
✅ Navigation works (Header, Footer)
✅ Login page accessible
✅ API calls reach Railway backend
✅ No CORS errors in console
✅ Authentication works
✅ Dashboard pages load after login

---

## 🔒 Security Notes

1. **Never commit `.env` files** - Use `.env.example` instead
2. **Use environment variables** for all API URLs
3. **Enable HTTPS only** - Vercel provides this automatically
4. **Keep dependencies updated** - Run `npm audit` regularly
5. **Use Railway environment variables** for sensitive backend data

---

## 📈 Performance Tips

1. **Enable Vercel Analytics** - Monitor performance
2. **Use Vercel Image Optimization** - For course thumbnails
3. **Enable Edge Caching** - Faster global access
4. **Optimize bundle size** - Check build output
5. **Use lazy loading** - For routes and components

---

## 🆘 Need Help?

If you encounter issues:

1. Check Vercel build logs
2. Check browser console for errors
3. Verify environment variables
4. Test Railway backend separately
5. Check CORS configuration

**Common Issues:**
- API URL missing `/api` at the end
- CORS not configured on backend
- Environment variable not starting with `VITE_`
- Root directory not set to `client`
