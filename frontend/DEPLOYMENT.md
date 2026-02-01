# Deploying to Vercel

This guide explains how to deploy your frontend application to Vercel.

## Prerequisites

- A [Vercel account](https://vercel.com/signup)
- Your backend API deployed and accessible via a public URL
- Git repository (GitHub, GitLab, or Bitbucket)

## Quick Deploy via Vercel Dashboard

### 1. Push Your Code to Git

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Select your Git repository
4. Vercel will auto-detect Vite configuration

### 3. Configure Environment Variables

In the Vercel project settings, add the following environment variable:

| Name | Value | Description |
|------|-------|-------------|
| `VITE_API_URL` | `https://your-backend-api.com` | Your production backend API URL |

**Example**: If your backend is at `https://api.plusway.com`, set:
```
VITE_API_URL=https://api.plusway.com
```

> [!IMPORTANT]
> Do NOT include a trailing slash in the API URL

### 4. Deploy

Click **"Deploy"** and Vercel will:
- Install dependencies
- Build your application
- Deploy to a production URL

## Deploy via Vercel CLI

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy

```bash
cd frontend
vercel
```

Follow the prompts to configure your project.

### 4. Set Environment Variables

```bash
vercel env add VITE_API_URL production
```

Enter your backend API URL when prompted.

### 5. Deploy to Production

```bash
vercel --prod
```

## Local Testing Before Deployment

### 1. Create Production Environment File

Create `.env.production.local`:

```env
VITE_API_URL=https://your-backend-api.com
```

### 2. Build and Preview

```bash
npm run build
npm run preview
```

Visit `http://localhost:4173` to test the production build locally.

## Post-Deployment

### Verify Deployment

1. Visit your Vercel deployment URL
2. Open browser DevTools → Network tab
3. Verify API calls are going to your production backend
4. Test key features:
   - User login/signup
   - Product browsing
   - Cart functionality
   - Checkout process

### Custom Domain (Optional)

1. Go to your Vercel project settings
2. Navigate to **Domains**
3. Add your custom domain
4. Follow DNS configuration instructions

## Troubleshooting

### API Calls Failing

- Verify `VITE_API_URL` is set correctly in Vercel
- Check backend CORS settings allow your Vercel domain
- Ensure backend is accessible publicly

### Build Errors

- Check build logs in Vercel dashboard
- Verify all dependencies are in `package.json`
- Test build locally: `npm run build`

### Environment Variables Not Working

- Environment variables must start with `VITE_`
- Redeploy after adding/changing environment variables
- Clear browser cache and hard refresh

## Automatic Deployments

Vercel automatically deploys:
- **Production**: Commits to `main` branch
- **Preview**: Commits to other branches and pull requests

Each deployment gets a unique URL for testing.

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
