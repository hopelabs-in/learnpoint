# LearnPoint Deployment Roadmap

Complete guide to deploy your training platform to production.

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Backend Deployment Options](#backend-deployment-options)
3. [Frontend Deployment Options](#frontend-deployment-options)
4. [Database Deployment](#database-deployment)
5. [Recommended Stack](#recommended-stack)
6. [Step-by-Step Deployment](#step-by-step-deployment)
7. [Post-Deployment](#post-deployment)
8. [Maintenance & Monitoring](#maintenance--monitoring)

---

## Pre-Deployment Checklist

### Code Preparation
- [ ] Test all features locally (both frontend and backend)
- [ ] Review and update environment variables
- [ ] Remove any hardcoded secrets or API keys
- [ ] Add error handling and logging
- [ ] Set up proper CORS configuration for production domain
- [ ] Review security settings (rate limiting, input validation)
- [ ] Create production-ready seed data (if needed)

### Account Setup
- [ ] Create accounts on chosen hosting platforms
- [ ] Set up payment method (most platforms have free tiers)
- [ ] Verify email addresses
- [ ] Set up 2FA for security

---

## Backend Deployment Options

### Option 1: **Railway** (Recommended for Beginners)
**Pros:**
- Free tier with $5 credit/month
- One-click MongoDB deployment
- Automatic HTTPS
- Easy environment variable management
- GitHub integration

**Pricing:** Free tier, then $5/month per service

**Steps:**
1. Sign up at [railway.app](https://railway.app)
2. Connect GitHub account
3. Deploy from repository
4. Add MongoDB from Railway marketplace
5. Set environment variables

### Option 2: **Heroku**
**Pros:**
- Well-documented
- Large ecosystem
- Easy scaling
- Add-ons marketplace

**Cons:**
- No free tier anymore
- $5-7/month minimum

**Steps:**
1. Install Heroku CLI
2. `heroku create your-app-name`
3. Add MongoDB add-on: `heroku addons:create mongolab`
4. Push code: `git push heroku main`
5. Set env vars: `heroku config:set KEY=value`

### Option 3: **Render**
**Pros:**
- Free tier available
- Automatic deploys from Git
- Easy to use
- Built-in MongoDB hosting

**Pricing:** Free tier (sleeps after 15 min inactivity), then $7/month

**Steps:**
1. Sign up at [render.com](https://render.com)
2. Create new Web Service
3. Connect Git repository
4. Set build/start commands
5. Add environment variables

### Option 4: **DigitalOcean App Platform**
**Pros:**
- $5/month basic plan
- Full control
- Scalable
- Good documentation

**Steps:**
1. Create account at [digitalocean.com](https://digitalocean.com)
2. Create App → Import from GitHub
3. Configure app settings
4. Deploy

### Option 5: **AWS / Google Cloud / Azure** (Advanced)
**Pros:**
- Enterprise-grade
- Highly scalable
- Full control
- Many services

**Cons:**
- Complex setup
- Steeper learning curve
- Can be expensive

---

## Frontend Deployment Options

### Option 1: **Vercel** (Recommended)
**Pros:**
- Best for React apps
- Automatic deployments from Git
- Free tier (generous)
- Excellent performance (CDN)
- Easy custom domains

**Pricing:** Free for personal projects

**Steps:**
1. Sign up at [vercel.com](https://vercel.com)
2. Import Git repository
3. Vercel auto-detects React
4. Set environment variable: `REACT_APP_API_URL`
5. Deploy

### Option 2: **Netlify**
**Pros:**
- Similar to Vercel
- Free tier
- Easy to use
- Good CI/CD

**Steps:**
1. Sign up at [netlify.com](https://netlify.com)
2. Import repository
3. Set build command: `npm run build`
4. Set publish directory: `build`
5. Add env variables

### Option 3: **GitHub Pages**
**Pros:**
- Completely free
- Easy if using GitHub

**Cons:**
- Static hosting only
- Custom domain requires setup

**Steps:**
1. Add `homepage` to `package.json`
2. Install gh-pages: `npm install gh-pages`
3. Add deploy script
4. Run `npm run deploy`

### Option 4: **Cloudflare Pages**
**Pros:**
- Free
- Fast (Cloudflare CDN)
- Easy setup

**Steps:**
1. Sign up at [pages.cloudflare.com](https://pages.cloudflare.com)
2. Connect GitHub
3. Configure build settings
4. Deploy

---

## Database Deployment

### Option 1: **MongoDB Atlas** (Recommended)
**Pros:**
- Official MongoDB cloud service
- Free tier (512MB)
- Automatic backups
- Easy to use
- Global availability

**Pricing:** Free tier, then $9/month for 2GB

**Setup:**
1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create new cluster (choose free M0 tier)
3. Set up database user
4. Whitelist IP addresses (0.0.0.0/0 for anywhere)
5. Get connection string
6. Replace in your backend env vars

**Connection String Format:**
```
mongodb+srv://username:password@cluster.xxxxx.mongodb.net/training-platform?retryWrites=true&w=majority
```

### Option 2: **Railway MongoDB**
- Included with Railway backend deployment
- Pay-as-you-go pricing

### Option 3: **Self-Hosted**
- Use DigitalOcean Droplet
- Install MongoDB
- Manage yourself
- More control, more work

---

## Recommended Stack (Best for Most Users)

### 🎯 **Optimal Setup**

| Component | Service | Cost | Why |
|-----------|---------|------|-----|
| **Backend** | Railway | Free ($5 credit) | Easy, includes MongoDB |
| **Frontend** | Vercel | Free | Best for React, fast |
| **Database** | MongoDB Atlas | Free (512MB) | Reliable, automatic backups |
| **Domain** | Namecheap/GoDaddy | ~$12/year | Custom domain |

**Total Cost:** ~$1/month (after free credits) + domain

---

## Step-by-Step Deployment

### Phase 1: Database Setup (10 minutes)

1. **Create MongoDB Atlas Account**
   ```
   → Go to mongodb.com/cloud/atlas
   → Sign up with email
   → Create free M0 cluster
   → Choose cloud provider & region (closest to users)
   → Wait for cluster to be created (~5 min)
   ```

2. **Configure Database Access**
   ```
   → Database Access → Add User
   → Username: admin
   → Password: [generate strong password]
   → User Privileges: Read and write to any database
   ```

3. **Configure Network Access**
   ```
   → Network Access → Add IP Address
   → Click "Allow Access from Anywhere" (0.0.0.0/0)
   → Confirm
   ```

4. **Get Connection String**
   ```
   → Clusters → Connect → Connect your application
   → Copy connection string
   → Replace <password> with your password
   → Replace <dbname> with: training-platform
   ```

### Phase 2: Backend Deployment (15 minutes)

Using **Railway**:

1. **Prepare Code**
   ```bash
   cd training-platform/backend
   # Ensure package.json has start script
   ```

2. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_URL
   git push -u origin main
   ```

3. **Deploy on Railway**
   ```
   → Go to railway.app
   → Sign in with GitHub
   → New Project → Deploy from GitHub repo
   → Select your repository → Select backend folder
   → Configure:
     - Start Command: npm start
     - Build Command: npm install
   ```

4. **Set Environment Variables**
   ```
   → Variables tab
   → Add each variable:
   
   PORT=5000
   MONGODB_URI=[Your MongoDB Atlas connection string]
   JWT_SECRET=[Generate random string, e.g., openssl rand -base64 32]
   JWT_EXPIRE=7d
   NODE_ENV=production
   CLIENT_URL=[Your frontend URL after step 3]
   ```

5. **Deploy & Test**
   ```
   → Click Deploy
   → Wait for build to complete
   → Copy the Railway URL (e.g., https://your-app.railway.app)
   → Test: Visit https://your-app.railway.app/health
   → Should see: {"success": true, "message": "Server is running"}
   ```

### Phase 3: Frontend Deployment (10 minutes)

Using **Vercel**:

1. **Update API URL**
   ```bash
   cd training-platform/frontend
   # Create .env.production file
   echo "REACT_APP_API_URL=https://your-backend.railway.app/api" > .env.production
   ```

2. **Deploy on Vercel**
   ```
   → Go to vercel.com
   → Sign in with GitHub
   → Import Project → Import Git Repository
   → Select your repository
   → Configure:
     - Framework Preset: Create React App
     - Root Directory: frontend
     - Build Command: npm run build
     - Output Directory: build
   ```

3. **Set Environment Variables**
   ```
   → Settings → Environment Variables
   → Add:
     Key: REACT_APP_API_URL
     Value: https://your-backend.railway.app/api
   ```

4. **Deploy**
   ```
   → Click Deploy
   → Wait for build (~2-3 minutes)
   → Visit your Vercel URL
   → Test login and features
   ```

### Phase 4: Configure CORS (5 minutes)

Update backend to allow your frontend domain:

1. **Update backend/server.js**
   ```javascript
   app.use(cors({
     origin: [
       process.env.CLIENT_URL,
       'https://your-vercel-app.vercel.app'
     ],
     credentials: true
   }));
   ```

2. **Commit and Push**
   ```bash
   git add .
   git commit -m "Update CORS for production"
   git push
   ```
   Railway will auto-deploy!

### Phase 5: Seed Data (5 minutes)

1. **Run seed script remotely**
   ```bash
   # Option 1: Railway CLI
   railway run node seedData.js
   
   # Option 2: Add to package.json
   # "seed": "node seedData.js"
   # Then run in Railway dashboard
   ```

2. **Or manually create admin user via Postman**
   ```
   POST https://your-backend.railway.app/api/auth/register
   Body: {
     "name": "Admin User",
     "email": "admin@yourcompany.com",
     "password": "SecurePassword123!",
     "department": "IT",
     "banks": ["All"],
     "role": "admin"
   }
   ```

---

## Post-Deployment

### Set Up Custom Domain (Optional)

1. **Buy Domain** (~$12/year)
   - Namecheap, GoDaddy, or Google Domains

2. **Configure Frontend Domain (Vercel)**
   ```
   → Vercel Dashboard → Your Project → Settings → Domains
   → Add your domain (e.g., learn.yourcompany.com)
   → Follow DNS configuration instructions
   → Add CNAME record pointing to Vercel
   ```

3. **Configure Backend Domain (Railway)**
   ```
   → Railway Dashboard → Settings → Domains
   → Add custom domain (e.g., api.yourcompany.com)
   → Update DNS with provided CNAME
   → Update CLIENT_URL env var in Railway
   → Update REACT_APP_API_URL in Vercel
   ```

### Enable HTTPS
- Vercel & Railway provide automatic HTTPS
- No action needed!

### Test Everything
- [ ] User registration
- [ ] Login/logout
- [ ] Course creation
- [ ] Module/chapter creation
- [ ] Chapter completion tracking
- [ ] Progress bars
- [ ] Admin dashboard
- [ ] All navigation

---

## Maintenance & Monitoring

### Regular Tasks

**Daily:**
- Monitor error logs in Railway/Vercel dashboards
- Check uptime (use UptimeRobot.com - free)

**Weekly:**
- Review user activity
- Check database size (MongoDB Atlas dashboard)
- Update content as needed

**Monthly:**
- Update dependencies: `npm outdated` → `npm update`
- Review and rotate secrets if needed
- Backup database (MongoDB Atlas auto-backups)

### Monitoring Tools

**Free Options:**
1. **UptimeRobot** - Monitors if site is up
2. **Sentry** - Error tracking (free tier)
3. **LogRocket** - Session replay
4. **Google Analytics** - User analytics

### Backup Strategy

**MongoDB Atlas:**
- Free tier includes snapshots
- Manual backups: Database → Clusters → ... → Backup

**Code:**
- Keep Git repository updated
- Tag releases: `git tag v1.0.0`

---

## Scaling & Optimization

### When to Scale

Monitor these metrics:
- Response time > 2 seconds
- 90%+ CPU usage
- 90%+ RAM usage
- 90%+ database storage

### How to Scale

**Backend:**
- Railway: Upgrade plan for more resources
- Add Redis for caching
- Database indexing

**Frontend:**
- Already on CDN (Vercel)
- Enable gzip compression
- Optimize images

**Database:**
- Upgrade MongoDB Atlas tier
- Add indexes:
  ```javascript
  db.users.createIndex({ email: 1 })
  db.courses.createIndex({ "tags.department": 1 })
  ```

---

## Troubleshooting

### Common Issues

**"Cannot connect to database"**
- Check MongoDB Atlas IP whitelist
- Verify connection string
- Check env variables in Railway

**"CORS Error"**
- Update backend CORS config
- Check CLIENT_URL env variable
- Verify frontend is using correct API URL

**"502 Bad Gateway"**
- Check Railway logs
- May need to increase memory/CPU
- Check if app is starting properly

**"Build Failed" (Frontend)**
- Check build logs in Vercel
- Verify all dependencies in package.json
- Check for environment-specific code

---

## Cost Estimate

### Minimal Setup (Free Tier)
- **Backend:** Railway - Free ($5 credit)
- **Frontend:** Vercel - Free
- **Database:** MongoDB Atlas - Free (512MB)
- **Total:** $0/month (for first few months)

### Small Company (< 50 users)
- **Backend:** Railway - $5/month
- **Frontend:** Vercel - Free
- **Database:** MongoDB Atlas - Free
- **Domain:** ~$1/month
- **Total:** ~$6/month

### Medium Company (< 500 users)
- **Backend:** Railway - $10/month
- **Frontend:** Vercel - Free (or $20/month Pro)
- **Database:** MongoDB Atlas - $9/month (2GB)
- **Domain:** ~$1/month
- **Total:** ~$20-40/month

---

## Support & Resources

### Documentation
- **Railway:** docs.railway.app
- **Vercel:** vercel.com/docs
- **MongoDB Atlas:** docs.atlas.mongodb.com
- **Express:** expressjs.com
- **React:** react.dev

### Community
- **Railway Discord:** railway.app/discord
- **Stack Overflow:** Tag your questions properly
- **GitHub Issues:** For code-specific problems

### Need Help?
1. Check error logs first
2. Search error message on Google/Stack Overflow
3. Check platform-specific docs
4. Ask in Discord communities
5. Create detailed GitHub issue

---

## Next Steps After Deployment

1. **User Training**
   - Create user guides
   - Record video tutorials
   - Schedule training sessions

2. **Content Creation**
   - Add actual courses
   - Create quality content
   - Get department input

3. **Feedback Loop**
   - Gather user feedback
   - Track usage analytics
   - Iterate on features

4. **Security**
   - Enable rate limiting
   - Set up monitoring
   - Regular security audits

5. **Compliance**
   - GDPR compliance (if EU users)
   - Data retention policies
   - Privacy policy

---

## Conclusion

You now have a production-ready training platform! The recommended stack (Railway + Vercel + MongoDB Atlas) will handle hundreds of users easily and can scale as needed.

**Quick Deploy Timeline:**
- Database setup: 10 minutes
- Backend deployment: 15 minutes
- Frontend deployment: 10 minutes
- Configuration: 10 minutes
- **Total: ~45 minutes**

Good luck with your deployment! 🚀
