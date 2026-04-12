# Cuenti.to - Ownership Transfer & Deployment Guide

> **UPDATE:** The codebase has been refactored to use environment variables. All hardcoded
> Supabase URLs, admin emails, and analytics IDs have been replaced. You now only need to
> edit the `.env` file and set Supabase Edge Function secrets — no more editing 25+ source files.

This document lists **every single change** you need to make to make this project fully yours.

---

## Table of Contents

1. [Overview of What Needs Changing](#1-overview-of-what-needs-changing)
2. [External Accounts You Need to Create](#2-external-accounts-you-need-to-create)
3. [STEP-BY-STEP: All Code Changes Required](#3-step-by-step-all-code-changes-required)
4. [Supabase Edge Function Secrets](#4-supabase-edge-function-secrets)
5. [Database Migration Fix](#5-database-migration-fix)
6. [Deployment to Hetzner VPS](#6-deployment-to-hetzner-vps)
7. [Post-Deployment Verification Checklist](#7-post-deployment-verification-checklist)
8. [Optional: Rebranding Considerations](#8-optional-rebranding-considerations)

---

## 1. Overview of What Needs Changing

There are **5 categories** of placeholders/hardcoded values scattered throughout the codebase:

| Placeholder | Where Found | Count |
|---|---|---|
| `YOUR_SUPABASE_PROJECT_ID` | Frontend (13 files) + 1 edge function | ~20 occurrences |
| `YOUR_SUPABASE_ANON_KEY_HERE` | Frontend (1 file) | 1 occurrence |
| `ADMIN_EMAIL_HERE` | Frontend (3 files) + Edge functions (4 files) + Migration (1 file) | 8 occurrences |
| `YOUR_ADSENSE_PUB_ID` | index.html | 1 occurrence |
| `GTM-TGRPM26` (Google Tag Manager) | index.html | 2 occurrences |
| `fb:app_id` (Facebook App ID) | index.html | 1 occurrence |
| `notifications@cuentito.app` | Edge functions (emails) | Multiple |
| Previous owner's AdSense pub ID | public/ads.txt | 1 occurrence |

---

## 2. External Accounts You Need to Create

Before touching code, create accounts and get API keys from these services:

### Required (Core Functionality)

| Service | What You Get | Used For | Sign Up |
|---|---|---|---|
| **Supabase** | Project URL + Anon Key + Service Role Key | Database, Auth, Storage, Edge Functions | Already have: `hsgxwvvdorcshrwcmhel` |
| **Replicate** | REPLICATE_API_TOKEN | Story & image generation via Replicate AI | Get from replicate.com → API tokens |
| **Google OAuth** | Client ID + Secret | Google login for users | console.cloud.google.com → Credentials |
| **Facebook OAuth** | App ID + Secret | Facebook login for users | developers.facebook.com |

### Required (Payments - pick one or both)

| Service | What You Get | Used For | Sign Up |
|---|---|---|---|
| **Stripe** | STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET | International payments | dashboard.stripe.com |
| **MercadoPago** | MERCADOPAGO_ACCESS_TOKEN | Latin America payments | mercadopago.com.ar/developers |

### Required (Email - need both)

| Service | What You Get | Used For | Sign Up |
|---|---|---|---|
| **Resend** | RESEND_API_KEY | Contact form, feedback, newsletter notifications | resend.com |
| **Brevo** | BREVO_API_KEY | Story emails, subscription emails, feedback notifications | brevo.com |

### Optional (Enhanced Features)

| Service | What You Get | Used For | Sign Up |
|---|---|---|---|
| **Microsoft Azure** | MICROSOFT_SPEECH_SUBSCRIPTION_KEY | Text-to-speech audio for stories | portal.azure.com → Cognitive Services |
| **Meta WhatsApp Business** | WHATSAPP_ACCESS_TOKEN + APP_SECRET + PHONE_NUMBER_ID | WhatsApp story bot | business.facebook.com |
| **Google AdSense** | Publisher ID (ca-pub-XXXXX) | Ad monetization | adsense.google.com |
| **Google Tag Manager** | GTM ID (GTM-XXXXXXX) | Analytics tracking | tagmanager.google.com |

---

## 3. STEP-BY-STEP: Configuration (env-based — no source edits needed)

### 3.1 — Edit the `.env` File (ONLY file you need to touch)

All Supabase URLs, Anon Keys, admin emails, and analytics IDs are now read from
environment variables. Open `.env` in the project root and fill in your values:

```env
# --- Supabase (REQUIRED) ---
VITE_SUPABASE_URL=https://hsgxwvvdorcshrwcmhel.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-from-supabase-dashboard

# --- Admin (REQUIRED) ---
VITE_ADMIN_EMAIL=your-admin@email.com

# --- Google AdSense (optional — set to your pub ID or leave placeholder) ---
VITE_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX

# --- Google Tag Manager (optional) ---
VITE_GTM_ID=GTM-XXXXXXX

# --- Facebook App ID (optional — for og:fb meta tag) ---
VITE_FB_APP_ID=000000000000000
```

> Get your Anon Key from: **Supabase Dashboard → Settings → API → Project API keys → `anon` `public`**

These variables are automatically used by:
- `src/integrations/supabase/client.ts` — Supabase connection
- `src/utils/config.ts` — Storage URL builder, admin email, OG image
- `index.html` — Meta tags, AdSense, GTM, Facebook App ID (via Vite's `%VITE_*%` syntax)
- All components and pages that previously had hardcoded URLs

A `.env.example` template is also provided for reference.

---

### 3.2 — public/ads.txt

**File:** `public/ads.txt`

```
BEFORE:
  google.com, pub-1171399760792159, DIRECT, f08c47fec0942fa0

AFTER:
  google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

Replace `pub-1171399760792159` with your own AdSense publisher ID. If you don't use AdSense, delete the file.

---

### 3.3 — Email Sender Addresses in Edge Functions (only if changing domain)

The edge functions use `cuentito@cuentito.app` and `notifications@cuentito.app` as the "from" address. If you're keeping the cuenti.to domain, just verify these sender domains in Brevo and Resend. If you change the domain, update these files:

| File | Current "from" | What to Change |
|---|---|---|
| `supabase/functions/send-contact-email/index.ts` | `notifications@cuentito.app` | Your verified sender email |
| `supabase/functions/send-email-story/index.ts` | `cuentito@cuentito.app` | Your verified sender email |
| `supabase/functions/send-feedback-email/index.ts` | `notifications@cuentito.app` | Your verified sender email |
| `supabase/functions/send-feedback-notification/index.ts` | `cuentito@cuentito.app` | Your verified sender email |
| `supabase/functions/send-newsletter-notification/index.ts` | `notifications@cuentito.app` | Your verified sender email |
| `supabase/functions/send-subscription-email/index.ts` | `cuentito@cuentito.app` | Your verified sender email |

---

### 3.7 — OAuth Redirect URLs

After setting up Google and Facebook OAuth, configure these redirect URLs in their dashboards:

**Google Cloud Console → Credentials → OAuth 2.0 Client:**
```
Authorized redirect URIs:
  https://hsgxwvvdorcshrwcmhel.supabase.co/auth/v1/callback
```

**Facebook Developers → Your App → Facebook Login → Settings:**
```
Valid OAuth Redirect URIs:
  https://hsgxwvvdorcshrwcmhel.supabase.co/auth/v1/callback
```

Then configure the providers in **Supabase Dashboard → Authentication → Providers**:
- Enable Google → paste Client ID and Client Secret
- Enable Facebook → paste App ID and App Secret

---

### 3.8 — Stripe Webhook Endpoint

In **Stripe Dashboard → Developers → Webhooks**, create an endpoint:
```
Endpoint URL: https://hsgxwvvdorcshrwcmhel.supabase.co/functions/v1/stripe-webhook
Events to listen for:
  - checkout.session.completed
  - customer.subscription.deleted
```

Copy the **Signing Secret** — that's your `STRIPE_WEBHOOK_SECRET`.

---

### 3.9 — MercadoPago Webhook

In **MercadoPago Dashboard → Your App → Webhooks**, configure:
```
Notification URL: https://hsgxwvvdorcshrwcmhel.supabase.co/functions/v1/payment-webhook
Topics: payments, preapproval
```

---

## 4. Supabase Edge Function Secrets

All edge functions read API keys from environment variables via `Deno.env.get()`. Set these using the Supabase CLI:

```bash
# Core Supabase (usually auto-set, but set explicitly to be safe)
supabase secrets set SUPABASE_URL=https://hsgxwvvdorcshrwcmhel.supabase.co
supabase secrets set SUPABASE_ANON_KEY=your_anon_key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Admin email (used by edge functions for notifications & access control)
supabase secrets set ADMIN_EMAIL=your-admin@email.com

# AI - Story Generation
supabase secrets set REPLICATE_API_TOKEN=your_replicate_api_token

# Payments
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxxxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx
supabase secrets set MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxx

# Email
supabase secrets set RESEND_API_KEY=re_xxxxx
supabase secrets set BREVO_API_KEY=xkeysib-xxxxx

# Text-to-Speech (optional)
supabase secrets set MICROSOFT_SPEECH_SUBSCRIPTION_KEY=xxxxx

# WhatsApp Bot (optional)
supabase secrets set WHATSAPP_ACCESS_TOKEN=xxxxx
supabase secrets set WHATSAPP_APP_SECRET=xxxxx
supabase secrets set WHATSAPP_PHONE_NUMBER_ID=xxxxx
```

### Complete List of Required Secrets

| Secret Name | Required? | Used By |
|---|---|---|
| `SUPABASE_URL` | YES | Multiple edge functions |
| `SUPABASE_ANON_KEY` | YES | Some edge functions |
| `SUPABASE_SERVICE_ROLE_KEY` | YES | Most edge functions (admin access) |
| `ADMIN_EMAIL` | YES | `get-all-users`, `send-contact-email`, `send-feedback-notification`, `send-newsletter-notification` |
| `REPLICATE_API_TOKEN` | YES | `generate-story`, `generate-image` (Replicate AI) |
| `STRIPE_SECRET_KEY` | For Stripe | `create-stripe-payment`, `stripe-webhook` |
| `STRIPE_WEBHOOK_SECRET` | For Stripe | `stripe-webhook` |
| `MERCADOPAGO_ACCESS_TOKEN` | For MercadoPago | `create-payment`, `payment-webhook` |
| `RESEND_API_KEY` | YES | `send-contact-email`, `send-feedback-email`, `send-newsletter-notification` |
| `BREVO_API_KEY` | YES | `send-email-story`, `send-subscription-email`, `send-feedback-notification` |
| `MICROSOFT_SPEECH_SUBSCRIPTION_KEY` | Optional | `generate-speech` |
| `WHATSAPP_ACCESS_TOKEN` | Optional | `whatsapp-webhook` |
| `WHATSAPP_APP_SECRET` | Optional | `whatsapp-webhook` |
| `WHATSAPP_PHONE_NUMBER_ID` | Optional | `whatsapp-webhook` |

---

## 5. Database Migration Fix

The migration file at `supabase/migrations/20260129235555_*.sql` tries to insert your admin user. You need to update the email **before** running `supabase db push`:

**File:** `supabase/migrations/20260129235555_5e787ede-6c71-4b91-bbae-af3c4776780f.sql`

Lines 52 and 59 both have:
```sql
WHERE email = 'ADMIN_EMAIL_HERE'
```

Change to:
```sql
WHERE email = 'your_actual_email@gmail.com'
```

**Important:** This migration runs during `supabase db push`. If you've already pushed and your user doesn't exist yet, the INSERT will simply do nothing (it has `ON CONFLICT DO NOTHING`). You can manually grant admin later via SQL Editor:

```sql
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'your_actual_email@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

---

## 6. Deployment to Hetzner VPS

### Prerequisites

- Ubuntu VPS (Hetzner or any provider)
- Domain (cuenti.to) pointed to your server IP
- All code changes from Section 3 completed
- All API keys from Section 2 ready

### Step-by-step

```bash
# 1. SSH into server
ssh root@YOUR_SERVER_IP

# 2. System setup
apt update && apt upgrade -y
adduser deploy
usermod -aG sudo deploy
su - deploy

# 3. Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 4. Install tools
sudo apt install -y git nginx postgresql-client certbot python3-certbot-nginx
sudo npm install -g pm2
npm install -g supabase

# 5. Clone repo (push your updated code first)
cd /home/deploy
git clone https://github.com/YOUR_REPO/cuentitov2.git
cd cuentitov2

# 6. Install and build
npm install
npm run build

# 7. Link Supabase project
supabase login
supabase link --project-ref hsgxwvvdorcshrwcmhel

# 8. Push database schema (if fresh Supabase project)
supabase db push

# 9. Restore database dump (if you have one from seller)
# On LOCAL machine first: scp cuentito_dump.sql.gz deploy@SERVER_IP:/home/deploy/
gunzip cuentito_dump.sql.gz
psql "postgresql://postgres:YOUR_DB_PASSWORD@db.hsgxwvvdorcshrwcmhel.supabase.co:5432/postgres" \
  -f /home/deploy/cuentito_dump.sql

# 10. Set edge function secrets
supabase secrets set SUPABASE_URL=https://hsgxwvvdorcshrwcmhel.supabase.co
supabase secrets set SUPABASE_ANON_KEY=your_anon_key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
supabase secrets set REPLICATE_API_TOKEN=your_replicate_token
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
supabase secrets set MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxx
supabase secrets set RESEND_API_KEY=re_xxx
supabase secrets set BREVO_API_KEY=xkeysib-xxx
# Add optional secrets as needed

# 11. Deploy edge functions
supabase functions deploy

# 12. Serve the built app
# Since this is a Vite SPA, the build output is in dist/
# Option A: Serve with Nginx directly (recommended for SPA)
# Option B: Use pm2 with vite preview
pm2 start "npx vite preview --host 0.0.0.0 --port 8080" --name "cuentito"
pm2 save
pm2 startup
# Run the command pm2 outputs

# 13. Configure Nginx
sudo tee /etc/nginx/sites-available/cuentito > /dev/null << 'NGINX'
server {
    listen 80;
    server_name cuenti.to www.cuenti.to;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
}
NGINX

sudo ln -s /etc/nginx/sites-available/cuentito /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 14. DNS: Point cuenti.to → YOUR_SERVER_IP (A record)
# Wait for propagation...

# 15. SSL
sudo certbot --nginx -d cuenti.to -d www.cuenti.to

# 16. Grant yourself admin (after signing up on the site)
# Go to Supabase Dashboard → SQL Editor:
# INSERT INTO user_roles (user_id, role)
# SELECT id, 'admin' FROM auth.users WHERE email = 'your@email.com';
```

### Alternative: Serve as Pure Static Files (Better for SPA)

Since this is a Vite SPA that builds to static files, you can skip pm2 entirely and serve directly from Nginx:

```bash
# Build outputs to dist/
npm run build

# Copy to nginx serving directory
sudo mkdir -p /var/www/cuentito
sudo cp -r dist/* /var/www/cuentito/

# Nginx config for static SPA:
sudo tee /etc/nginx/sites-available/cuentito > /dev/null << 'NGINX'
server {
    listen 80;
    server_name cuenti.to www.cuenti.to;
    root /var/www/cuentito;
    index index.html;

    # SPA: send all routes to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINX

sudo ln -s /etc/nginx/sites-available/cuentito /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

This approach is simpler, faster, and uses less memory since there's no Node.js process running.

---

## 7. Post-Deployment Verification Checklist

After deployment, verify each feature works:

- [ ] **Homepage loads** — Visit https://cuenti.to
- [ ] **Google login works** — Click "Iniciar sesion" → Google OAuth
- [ ] **Facebook login works** — Click "Iniciar sesion" → Facebook OAuth
- [ ] **Profile completion** — After first login, redirected to /profile
- [ ] **Story generation** — Go to /story/new, enter a prompt, generate
- [ ] **AI images appear** — Story should have a featured illustration
- [ ] **Library loads** — Visit /library, see stories
- [ ] **Story likes work** — Click heart icon on a story
- [ ] **Search works** — Visit /search, search for a story
- [ ] **Contact form works** — Visit /contact, submit (check your admin email)
- [ ] **Admin dashboard** — Visit /dashboard (after granting admin role)
- [ ] **Subscription modal** — Click "Pricing" in nav, plans should load
- [ ] **Stripe payment** — Test with Stripe test mode first
- [ ] **Email delivery** — Generate a story, check if email arrives
- [ ] **Audio player** — On a story page, click the audio player (if Microsoft key set)
- [ ] **Language switcher** — Toggle ES/EN/PT in navbar

---

## 8. Optional: Rebranding Considerations

If you want to rebrand beyond just changing credentials:

### Brand Name References

The name "Cuentito" / "Cuenti.to" appears in:
- `index.html` — page title, meta tags, structured data
- `src/i18n/translations/*.ts` — all 3 translation files
- `src/components/nav/NavLogo.tsx` — logo image URL
- `src/pages/PrivacyPolicy.tsx` — legal text
- `src/pages/TermsOfService.tsx` — legal text
- `src/components/Footer.tsx` — copyright text
- Edge function email templates — sender names and branding
- `public/robots.txt` — sitemap URL

### Logo

The logo is loaded from Supabase Storage:
```
https://cuenti.to/logo-cuentito.png
```

Upload your new logo to Supabase Storage (bucket: `cuentito`) and update `NavLogo.tsx`.

### Domain Change

If changing domain from cuenti.to:
1. Update all `cuenti.to` references in code
2. Update Supabase Auth → URL Configuration → Site URL
3. Update OAuth redirect URLs in Google/Facebook
4. Update Stripe/MercadoPago webhook URLs
5. Update DNS records
6. Get new SSL certificate

---

## Quick Reference: What to Configure

```
1. EDIT .env FILE (all frontend config in one place):
   .env                                        ← Supabase URL, Anon Key, Admin Email,
                                                  AdSense ID, GTM ID, FB App ID

2. SET SUPABASE SECRETS (for edge functions):
   supabase secrets set SUPABASE_URL=...
   supabase secrets set SUPABASE_ANON_KEY=...
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...
   supabase secrets set ADMIN_EMAIL=...
   supabase secrets set REPLICATE_API_TOKEN=...
   supabase secrets set STRIPE_SECRET_KEY=...
   supabase secrets set STRIPE_WEBHOOK_SECRET=...
   supabase secrets set MERCADOPAGO_ACCESS_TOKEN=...
   supabase secrets set RESEND_API_KEY=...
   supabase secrets set BREVO_API_KEY=...
   (+ optional: MICROSOFT_SPEECH_*, WHATSAPP_*)

3. MANUAL EDITS (only 2 files):
   supabase/migrations/20260129235555_*.sql    ← Your admin email (line 52)
   public/ads.txt                              ← Your AdSense pub ID (or delete)

Architecture of the env setup:
   .env  →  VITE_SUPABASE_URL  →  src/utils/config.ts  →  all components/pages
   .env  →  VITE_ADMIN_EMAIL   →  src/utils/config.ts  →  AdminRoute, useSessionData, etc.
   .env  →  VITE_*             →  index.html            →  meta tags, scripts
   supabase secrets             →  Deno.env.get()       →  edge functions
```
