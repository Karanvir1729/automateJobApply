# Deployment Guide

## Deploy Backend to Railway

### Step 1: Prepare Your Repository
1. Push your code to GitHub
2. Make sure all files are committed

### Step 2: Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Sign up with your GitHub account
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway will automatically detect it's a Node.js project

### Step 3: Configure Environment
1. In Railway dashboard, go to your project
2. Click "Variables" tab
3. Add any environment variables you need:
   - `NODE_ENV=production`
   - `PORT=3001` (Railway will override this automatically)

### Step 4: Get Your Backend URL
1. After deployment, Railway will give you a URL like:
   `https://your-app-name.railway.app`
2. Copy this URL

### Step 5: Update Frontend Configuration
1. In `src/config/api.ts`, replace the placeholder URL with your Railway URL
2. Redeploy your frontend to Netlify

### Step 6: Test
Your backend will now be running 24/7 on Railway!

## Alternative: Render Deployment

1. Go to [render.com](https://render.com)
2. Connect your GitHub account
3. Create a new "Web Service"
4. Select your repository
5. Use these settings:
   - **Build Command**: `npm install`
   - **Start Command**: `npm run server`
   - **Environment**: Node

## Alternative: Heroku Deployment

1. Install Heroku CLI
2. Run these commands:
```bash
heroku create your-app-name
git push heroku main
```

## Keeping It Running
- Railway: Runs automatically, no sleep mode
- Render: Free tier sleeps after 15 minutes of inactivity
- Heroku: Free tier sleeps after 30 minutes of inactivity

For production use, consider upgrading to paid tiers for better reliability.