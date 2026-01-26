# Environment Variables Guide - UTASVotes

## Overview

This guide explains all environment variables needed for UTASVotes and how to configure them.

---

## ✅ Required Variables

### 1. Supabase (Database & Authentication)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**What it does**: Connects your app to Supabase for database and authentication

**How to get it**:
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy **Project URL** and **anon/public key**

**Status**: ✅ Already configured in your `.env`

---

### 2. Stripe (Payment Gateway)

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

**What it does**: Processes candidate application fee payments (Ghana Cedis)

**How to get it**:
1. Create account at [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **Developers** → **API keys**
3. Copy **Publishable key** and **Secret key**

**Test vs Live**:
- **Test keys** (pk_test_... / sk_test_...): For development, no real money
- **Live keys** (pk_live_... / sk_live_...): For production, real transactions

**Status**: ⚠️ Needs configuration

**Setup Instructions**:
1. Sign up for Stripe account
2. Complete business verification
3. Add Ghana Cedis (GHS) as currency
4. Copy test keys to `.env`
5. Test payment flow
6. Switch to live keys for production

---

## ❌ Removed Variables (Not Needed)

These were in your original `.env` but are **NOT used** by UTASVotes:

### AI API Keys (Removed)
```env
# ❌ NOT NEEDED
OPENAI_API_KEY=...
GEMINI_API_KEY=...
ANTHROPIC_API_KEY=...
PERPLEXITY_API_KEY=...
```

**Why removed**: UTASVotes doesn't use AI features. These are for chatbots, content generation, etc.

---

## ⚠️ Optional Variables

### 1. Google Analytics (Optional)

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**What it does**: Tracks user behavior, page views, and site traffic

**When to use**: If you want to analyze user engagement and improve UX

**How to get it**:
1. Go to [Google Analytics](https://analytics.google.com)
2. Create property for your site
3. Copy Measurement ID (starts with G-)

**Recommendation**: ✅ Useful for understanding user behavior

---

### 2. Google AdSense (Not Recommended)

```env
NEXT_PUBLIC_ADSENSE_ID=ca-pub-XXXXXXXXXXXXXXXX
```

**What it does**: Shows ads on your site for monetization

**Recommendation**: ❌ Not recommended for electoral system
- Ads can distract from voting process
- May compromise professional appearance
- Could raise ethical concerns

---

### 3. Supabase Service Role Key (Development Only)

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**What it does**: Bypasses Row Level Security for admin operations

**When to use**:
- Running test user creation scripts
- Database migrations
- Admin CLI tools
- Server-side operations

**How to get it**:
1. Supabase Dashboard → Settings → API
2. Copy **service_role key** (secret)

**⚠️ SECURITY WARNING**:
- **NEVER** expose this key in client-side code
- **NEVER** commit to version control
- Only use in server-side code or scripts
- Can access ALL data, bypassing security

---

## 📁 File Structure

### `.env` (Local Development)
```env
# Your local development environment
# Not committed to git
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### `.env.production` (Production)
```env
# Production environment
# Not committed to git
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

### `.env.example` (Template)
```env
# Committed to git as template
# No actual keys, just placeholders
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-key
```

---

## 🔒 Security Best Practices

### 1. Never Commit Secrets
```bash
# Verify .env is in .gitignore
cat .gitignore | grep .env

# Should show:
# .env
# .env.local
# .env.production
```

### 2. Use Different Keys per Environment
- **Development**: Test keys, local database
- **Staging**: Test keys, staging database
- **Production**: Live keys, production database

### 3. Rotate Keys Regularly
- Change Stripe keys every 6 months
- Rotate Supabase keys if compromised
- Update service role key annually

### 4. Limit Key Exposure
- Only share keys via secure channels (1Password, LastPass)
- Don't paste keys in Slack, email, or chat
- Use environment variable managers in production

### 5. Monitor Key Usage
- Check Stripe dashboard for unusual activity
- Review Supabase logs for suspicious queries
- Set up alerts for failed authentication attempts

---

## 🚀 Setup Checklist

### Initial Setup
- [x] Supabase URL and anon key configured
- [ ] Stripe test keys added
- [ ] Test payment flow working
- [ ] Google Analytics added (optional)
- [ ] Service role key added (for scripts)

### Before Production
- [ ] Switch to Stripe live keys
- [ ] Verify Supabase production database
- [ ] Test all payment flows
- [ ] Enable Stripe webhooks
- [ ] Set up monitoring and alerts
- [ ] Document key rotation schedule

---

## 🧪 Testing Environment Variables

### Verify Supabase Connection
```typescript
// In any component
import { supabase } from '@/lib/supabase';

const testConnection = async () => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('count');
  
  console.log('Supabase connected:', !error);
};
```

### Verify Stripe Configuration
```typescript
// In payment component
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const testStripe = async () => {
  try {
    const balance = await stripe.balance.retrieve();
    console.log('Stripe connected:', balance);
  } catch (error) {
    console.error('Stripe error:', error);
  }
};
```

---

## 🐛 Troubleshooting

### Issue: "Supabase client not initialized"
**Solution**: Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set

### Issue: "Stripe publishable key not found"
**Solution**: Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to `.env`

### Issue: "Environment variable not loading"
**Solution**: 
1. Restart dev server (`npm run dev`)
2. Check variable name has `NEXT_PUBLIC_` prefix for client-side
3. Verify `.env` file is in project root

### Issue: "Payment failing in production"
**Solution**: Make sure you switched from test keys to live keys

---

## 📚 Additional Resources

- [Supabase Environment Variables](https://supabase.com/docs/guides/getting-started/local-development#environment-variables)
- [Stripe API Keys](https://stripe.com/docs/keys)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Google Analytics Setup](https://support.google.com/analytics/answer/9304153)

---

## 📝 Summary

**Minimum Required**:
```env
NEXT_PUBLIC_SUPABASE_URL=...          # ✅ Already set
NEXT_PUBLIC_SUPABASE_ANON_KEY=...     # ✅ Already set
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=... # ⚠️ Needs setup
STRIPE_SECRET_KEY=...                  # ⚠️ Needs setup
```

**Next Steps**:
1. ✅ Supabase is configured
2. ⚠️ Set up Stripe account and add keys
3. ✅ Remove unused AI API keys (already done)
4. ⚠️ Optionally add Google Analytics
5. ✅ Keep `.env` secure and never commit

Your application will work with just Supabase configured, but you'll need Stripe for candidate application payments to function.

