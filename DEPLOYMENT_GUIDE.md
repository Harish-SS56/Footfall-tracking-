# Vercel Deployment Guide for Sri Shabari Jewellery Dashboard

## ✅ Step-by-Step Deployment Instructions

### Current Status: ✓ Git initialized and committed

The Vercel CLI is asking you questions. Here's what to answer:

### 1. **Which scope should contain your project?**
   - Press `Enter` to accept: `8t6q2i4rkeudgjw's projects`

### 2. **Link to existing project?**
   - Type: `n` (No) and press `Enter`

### 3. **What's your project's name?**
   - Type: `sri-shabari-dashboard` (must be lowercase, no spaces)
   - Press `Enter`

### 4. **In which directory is your code located?**
   - Type: `./` (current directory)
   - Press `Enter`

### 5. **Want to modify the settings?**
   - Type: `n` (No) and press `Enter`

---

## 🔐 IMPORTANT: Add Environment Variables

After deployment completes, you MUST add your database connection:

### Option 1: Via Vercel Dashboard (Recommended)
1. Go to: https://vercel.com/dashboard
2. Click on your project: `sri-shabari-dashboard`
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Key**: `DATABASE_URL`
   - **Value**: Your NeonDB connection string from `.env.local`
   - **Environments**: Check all (Production, Preview, Development)
5. Click **Save**
6. Go to **Deployments** tab
7. Click on the latest deployment
8. Click **Redeploy** button

### Option 2: Via Vercel CLI
```bash
vercel env add DATABASE_URL production
```
Then paste your NeonDB URL when prompted.

---

## 📝 Your NeonDB Connection String

Copy from your `.env.local` file:
```
DATABASE_URL=postgresql://neondb_owner:***@ep-polished-firefly-a8jfs7t7-pooler.eastus2.azure.neon.tech/neondb?sslmode=require
```

---

## 🎉 After Deployment

1. Vercel will provide a URL like: `https://sri-shabari-dashboard.vercel.app`
2. Add the environment variable as described above
3. Redeploy
4. Visit your live dashboard!

---

## 🔄 For Future Updates

Whenever you make changes:

```bash
cd c:\Users\ASUS\Downloads\footfalltracking\dashboard
git add .
git commit -m "Update: description of changes"
vercel --prod
```

Vercel will automatically rebuild and deploy!

---

## 🌐 Custom Domain (Optional)

To use your own domain:
1. Go to Vercel Dashboard → Project Settings → Domains
2. Add your domain (e.g., `dashboard.srishabari.com`)
3. Update DNS records as shown by Vercel
4. SSL certificate is automatic!

---

## 📱 Mobile Access

The dashboard is fully responsive and works perfectly on:
- 📱 Phones (iOS & Android)
- 📱 Tablets
- 💻 Desktop browsers

Share the Vercel URL with your team!

---

## 🆘 Troubleshooting

### Issue: "Project name error"
**Solution**: Use only lowercase letters, numbers, hyphens. No spaces.
Example: `sri-shabari-dashboard`

### Issue: "Database connection failed"
**Solution**: Make sure you added the `DATABASE_URL` environment variable and redeployed.

### Issue: "Build failed"
**Solution**: Check the build logs in Vercel dashboard. Usually resolved by adding env variables.

---

## ✨ Success!

Once deployed, your dashboard will be accessible 24/7 from anywhere in the world!
The shop PC tracking system will continue to save data to NeonDB, and the Vercel dashboard will display it beautifully.

**Congratulations!** 🎊
