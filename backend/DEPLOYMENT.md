# Deploying to Render

This guide explains how to deploy your backend API to Render.

## Prerequisites

- A [Render account](https://render.com/signup)
- MongoDB Atlas database (or other MongoDB hosting)
- Git repository (GitHub, GitLab, or Bitbucket)
- Cloudinary account (for image uploads)
- PayPal developer account (for payments)

## Quick Deploy via Render Dashboard

### 1. Push Your Code to Git

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Create New Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your Git repository
4. Render will auto-detect Node.js

### 3. Configure Service

| Setting | Value |
|---------|-------|
| **Name** | `plusway-backend` (or your preferred name) |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | Free (or your preferred plan) |

### 4. Configure Environment Variables

Add the following environment variables in Render:

#### Required Variables

| Name | Value | Description |
|------|-------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `10000` | Port (Render default) |
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB connection string |
| `JWT_SECRET` | `<random-string>` | Secure random string for JWT |
| `ALLOWED_ORIGINS` | `https://yourapp.vercel.app` | Your Vercel frontend URL |

#### Cloudinary (Image Uploads)

| Name | Value |
|------|-------|
| `CLOUDINARY_CLOUD_NAME` | Your cloud name |
| `CLOUDINARY_API_KEY` | Your API key |
| `CLOUDINARY_API_SECRET` | Your API secret |

#### PayPal (Payments)

| Name | Value |
|------|-------|
| `CLIENT_ID` | Your PayPal client ID |
| `CLIENT_SECRET` | Your PayPal client secret |

#### Email (Optional)

| Name | Value |
|------|-------|
| `EMAIL_HOST` | SMTP host |
| `EMAIL_PORT` | SMTP port |
| `EMAIL_USER` | SMTP username |
| `EMAIL_PASS` | SMTP password |

> [!IMPORTANT]
> **ALLOWED_ORIGINS**: Must include your Vercel frontend URL. For multiple origins, use comma-separated values: `https://yourapp.vercel.app,https://www.yourapp.com`

### 5. Deploy

Click **"Create Web Service"** and Render will:
- Clone your repository
- Install dependencies
- Start your server
- Provide a public URL (e.g., `https://plusway-backend.onrender.com`)

## Deploy via Render Blueprint

### 1. Use render.yaml

The included `render.yaml` file configures automatic deployment:

```bash
# Push to Git
git add render.yaml
git commit -m "Add Render blueprint"
git push origin main
```

### 2. Import Blueprint

1. Go to Render Dashboard
2. Click **"New +"** → **"Blueprint"**
3. Connect repository
4. Render will read `render.yaml` and create services

### 3. Configure Environment Variables

Set the required environment variables (see table above).

## MongoDB Atlas Setup

### 1. Create Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create a database user
4. Whitelist Render's IP addresses (or allow from anywhere: `0.0.0.0/0`)

### 2. Get Connection String

1. Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Add to Render as `MONGODB_URI`

## Post-Deployment

### Verify Deployment

1. Visit your Render service URL
2. You should see: "PlusWay Spare Parts API is running"
3. Test API endpoints:
   ```bash
   curl https://your-app.onrender.com/api/customer/brands
   ```

### Update Frontend

Update your Vercel frontend environment variable:

```env
VITE_API_URL=https://your-app.onrender.com
```

Redeploy your frontend on Vercel.

### Test Integration

1. Visit your frontend
2. Test user authentication
3. Browse products
4. Test cart and checkout
5. Verify all features work

## Troubleshooting

### Build Fails

- Check Render build logs
- Verify `package.json` has all dependencies
- Ensure Node.js version is compatible (>=18.0.0)

### Database Connection Fails

- Verify MongoDB connection string
- Check MongoDB Atlas IP whitelist
- Ensure database user has correct permissions

### CORS Errors

- Verify `ALLOWED_ORIGINS` includes your frontend URL
- Check frontend is using correct backend URL
- Ensure no trailing slashes in URLs

### API Returns 500 Errors

- Check Render logs for error details
- Verify all environment variables are set
- Test endpoints individually

### Free Tier Limitations

> [!WARNING]
> Render's free tier spins down after 15 minutes of inactivity. First request after spin-down may take 30-60 seconds.

**Solutions**:
- Upgrade to paid plan for always-on service
- Use a cron job to ping your API every 10 minutes
- Accept the cold start delay

## Automatic Deployments

Render automatically deploys when you push to your main branch:

```bash
git add .
git commit -m "Update API"
git push origin main
```

Render will rebuild and redeploy automatically.

## Custom Domain (Optional)

1. Go to your Render service settings
2. Navigate to **"Custom Domain"**
3. Add your domain
4. Update DNS records as instructed
5. Render provides free SSL certificates

## Monitoring

### View Logs

1. Go to your Render service
2. Click **"Logs"** tab
3. View real-time application logs

### Metrics

1. Click **"Metrics"** tab
2. View CPU, memory, and request metrics

## Support

- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Node.js on Render](https://render.com/docs/deploy-node-express-app)
