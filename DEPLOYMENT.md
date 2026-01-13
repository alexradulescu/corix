# Deployment Guide for Corix

This guide walks you through deploying Corix to production using Vercel (frontend) and Convex Cloud (backend + database).

## Prerequisites

Before starting, ensure you have accounts for:
- [Convex](https://www.convex.dev/) - Backend and database
- [Vercel](https://vercel.com/) - Frontend hosting
- [Resend](https://resend.com/) - Email delivery
- [Google Cloud Console](https://console.cloud.google.com/) - OAuth credentials

## Part 1: Convex Deployment

### 1.1 Create Convex Production Deployment

```bash
# Login to Convex (if not already logged in)
npx convex dev

# Deploy to production
npx convex deploy --prod
```

This will create a production deployment and give you a deployment URL like:
```
https://your-deployment-name.convex.cloud
```

**Save this URL** - you'll need it for Vercel configuration.

### 1.2 Configure Convex Environment Variables

Go to your [Convex Dashboard](https://dashboard.convex.dev):

1. Select your production deployment
2. Go to **Settings** → **Environment Variables**
3. Add the following variables:

#### Google OAuth Configuration

```bash
AUTH_GOOGLE_ID=your-google-client-id.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=your-google-client-secret
```

**How to get Google OAuth credentials:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Choose **Web application**
6. Add authorized redirect URIs:
   ```
   https://your-deployment-name.convex.site/api/auth/callback/google
   https://yourdomain.com/api/auth/callback/google
   ```
7. Copy the Client ID and Client Secret

#### Resend Configuration

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
```

**How to get Resend API key:**

1. Go to [Resend Dashboard](https://resend.com/api-keys)
2. Create a new API key
3. Verify your sending domain:
   - Go to **Domains** → **Add Domain**
   - Add your domain (e.g., `yourdomain.com`)
   - Add the DNS records (SPF, DKIM) to your domain
   - Wait for verification (usually 5-10 minutes)

#### Site URL

```bash
SITE_URL=https://yourdomain.com
```

This is used for generating invitation links. Set to your production domain.

### 1.3 Create Super Admin User

After deployment, you'll need at least one super admin user:

1. Register a user through the normal signup flow
2. Go to Convex Dashboard → **Data** → **users** table
3. Find your user record
4. Click **Edit**
5. Add field: `isSuperAdmin` = `true` (boolean)
6. Save

This user will now have access to the Admin panel at `/admin/groups`.

## Part 2: Vercel Deployment

### 2.1 Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your Git repository
4. Vercel will auto-detect the framework (Vite)

### 2.2 Configure Environment Variables

In Vercel project settings:

1. Go to **Settings** → **Environment Variables**
2. Add the following:

```bash
# Convex URL (from Part 1.1)
VITE_CONVEX_URL=https://your-deployment-name.convex.cloud
```

### 2.3 Configure Build Settings

Vercel should auto-detect these, but verify:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 2.4 Deploy

Click **Deploy** and wait for the build to complete.

Once deployed, your app will be available at:
```
https://your-project.vercel.app
```

### 2.5 Add Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Update `SITE_URL` in Convex environment variables

## Part 3: Post-Deployment Configuration

### 3.1 Update Google OAuth Redirect URIs

Go back to Google Cloud Console and add your production URLs:

```
https://your-project.vercel.app/api/auth/callback/google
https://yourdomain.com/api/auth/callback/google  (if using custom domain)
```

### 3.2 Test Authentication Flows

1. **Email/Password Registration**:
   - Go to `/register`
   - Create a test account
   - Verify email verification works

2. **Google OAuth**:
   - Click "Sign in with Google"
   - Complete OAuth flow
   - Verify account is created

3. **Password Reset**:
   - Try "Forgot Password" flow
   - Verify email is sent (check Resend logs)

### 3.3 Test Core Functionality

1. **Group Creation**:
   - Create a test group
   - Verify you're automatically added as admin

2. **Invitations**:
   - Invite a user to the group
   - Check Resend dashboard for email delivery
   - Accept invitation with test email

3. **Messages**:
   - Post messages in a group
   - Verify real-time updates work

4. **Admin Panel** (as super-admin):
   - Go to `/admin/groups`
   - Verify you can see all groups
   - Test soft-delete and restore
   - Test hard delete (use caution!)

## Part 4: Monitoring & Maintenance

### 4.1 Convex Dashboard

Monitor your backend at [dashboard.convex.dev](https://dashboard.convex.dev):

- **Functions**: View all queries/mutations and their performance
- **Logs**: See function execution logs and errors
- **Data**: Browse and edit database tables
- **Usage**: Monitor API calls and storage

### 4.2 Vercel Analytics

Monitor your frontend at [vercel.com](https://vercel.com):

- **Deployments**: See build logs and deployment history
- **Analytics**: View page views and performance
- **Logs**: Runtime errors and function logs

### 4.3 Resend Dashboard

Monitor email delivery at [resend.com](https://resend.com):

- **Emails**: See all sent emails and their status
- **Domains**: Verify domain health
- **Analytics**: Track open rates and delivery

## Troubleshooting

### Issue: "Not authorized" errors

**Solution**: Check Convex environment variables are set correctly in the production deployment (not dev).

### Issue: Invitation emails not sending

**Possible causes**:
1. `RESEND_API_KEY` not set or invalid
2. `FROM_EMAIL` domain not verified in Resend
3. Check Convex function logs for errors

**Solution**:
- Verify Resend API key in Convex dashboard
- Check domain verification status
- Review logs in Convex Functions tab

### Issue: Google OAuth fails

**Possible causes**:
1. Redirect URI mismatch
2. Wrong client ID/secret
3. Google+ API not enabled

**Solution**:
- Verify redirect URIs match exactly (including `/api/auth/callback/google`)
- Check `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` in Convex
- Enable Google+ API in Cloud Console

### Issue: Invitation links lead to 404

**Solution**: Verify `SITE_URL` is set correctly in Convex environment variables.

### Issue: Super admin panel shows "Access Denied"

**Solution**:
- Verify `isSuperAdmin: true` is set on your user in Convex Data browser
- Hard refresh the page (Ctrl+Shift+R / Cmd+Shift+R)

## Security Checklist

Before going live, verify:

- [ ] All environment variables are set in production (not exposed in client)
- [ ] Google OAuth redirect URIs are restricted to your domains only
- [ ] Resend domain is verified and SPF/DKIM configured
- [ ] At least one super-admin account exists
- [ ] Test account deletion flow (ensure can't delete while sole admin)
- [ ] Test group soft-delete (all members removed)
- [ ] Review PRODUCTION_NOTES.md for additional considerations

## Rollback Procedure

If you need to rollback:

### Vercel
1. Go to **Deployments**
2. Find previous working deployment
3. Click **⋯** → **Promote to Production**

### Convex
1. Convex doesn't have instant rollback
2. Deploy previous version: `git checkout <commit> && npx convex deploy --prod`
3. Restore data from backup if needed (contact Convex support)

## Cost Estimates

### Free Tier Limits:
- **Convex**: 1M function calls/month, 1GB storage
- **Vercel**: 100GB bandwidth/month, unlimited deployments
- **Resend**: 100 emails/day

### Paid Plans (if exceeded):
- **Convex**: ~$25/month for Starter ($0.000003 per read)
- **Vercel**: ~$20/month for Pro
- **Resend**: ~$20/month for 50k emails

## Support

- **Convex**: [docs.convex.dev](https://docs.convex.dev) | [Discord](https://convex.dev/community)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs) | [Support](https://vercel.com/support)
- **Resend**: [resend.com/docs](https://resend.com/docs) | [Support](https://resend.com/support)

---

**Deployment Version**: 1.0
**Last Updated**: January 2026
**Tested on**: Node 18+, npm 9+
