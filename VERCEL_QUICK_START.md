# 🚀 Vercel Quick Start - Deploy in 5 Minutes

## Step 1: Push Updated Code

```bash
git add .
git commit -m "Configure frontend for Vercel deployment"
git push origin main
```

## Step 2: Go to Vercel

1. Visit: https://vercel.com/new
2. Import your repository: `Learning_Management_system`
3. Click **Import**

## Step 3: Configure Settings

### Root Directory:
```
client
```
Click "Edit" → Select `client` → Continue

### Framework Preset:
```
Vite
```
(Should auto-detect)

### Environment Variables:
Add this variable:

**Name:**
```
VITE_API_URL
```

**Value:** (Replace with your Railway URL)
```
https://your-railway-app.railway.app/api
```

✅ Check all three: Production, Preview, Development

## Step 4: Deploy

Click **"Deploy"** button and wait 1-2 minutes.

## Step 5: Test

Visit your Vercel URL and test:
- ✅ Landing page loads
- ✅ Purple theme visible
- ✅ Login/Register works
- ✅ API calls successful

---

## 🔗 Get Your Railway URL

1. Go to Railway dashboard
2. Click your server service
3. Settings → Domains
4. Copy the URL (e.g., `https://nexlern-production.up.railway.app`)
5. Add `/api` at the end
6. Use this in Vercel's `VITE_API_URL`

---

## ⚠️ Important Notes

1. **Root Directory MUST be `client`** - Don't forget this!
2. **API URL must end with `/api`** - Example: `https://your-app.railway.app/api`
3. **Environment variable must start with `VITE_`** - This is required by Vite
4. **Redeploy after changing env vars** - Changes require redeployment

---

## ✅ Success Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Root directory = `client`
- [ ] `VITE_API_URL` added
- [ ] Build successful
- [ ] Site accessible
- [ ] Login works
- [ ] No CORS errors

---

## 🆘 Common Issues

### Build Fails
- Check Root Directory is set to `client`

### API Not Working
- Verify `VITE_API_URL` is correct
- Make sure it ends with `/api`
- Check Railway backend is running

### 404 on Page Refresh
- `vercel.json` handles this (already created)

---

## 📱 Your URLs

**Frontend (Vercel):**
```
https://your-project.vercel.app
```

**Backend (Railway):**
```
https://your-railway-app.railway.app/api
```

**Database (Aiven):**
```
Already configured in Railway
```

---

## 🎉 Done!

Your full-stack app is now live:
- Frontend on Vercel ✅
- Backend on Railway ✅
- Database on Aiven ✅

Test the complete flow:
1. Visit Vercel URL
2. Register a new account
3. Login
4. Access dashboard
5. Create/view courses

Everything should work seamlessly! 🚀
