# Cuenti.to (Cuentizo) - Complete Project Documentation

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Folder Structure](#3-folder-structure)
4. [Architecture - How Frontend & Backend Connect](#4-architecture---how-frontend--backend-connect)
5. [Database Schema & Models](#5-database-schema--models)
6. [Authentication Flow](#6-authentication-flow)
7. [Core Business Logic](#7-core-business-logic)
8. [Frontend - Pages & Routing](#8-frontend---pages--routing)
9. [Frontend - Components Breakdown](#9-frontend---components-breakdown)
10. [Frontend - Custom Hooks](#10-frontend---custom-hooks)
11. [Frontend - Utilities](#11-frontend---utilities)
12. [Backend - Supabase Edge Functions](#12-backend---supabase-edge-functions)
13. [Payment & Subscription System](#13-payment--subscription-system)
14. [Internationalization (i18n)](#14-internationalization-i18n)
15. [Content Moderation & Safety](#15-content-moderation--safety)
16. [Email & Notification System](#16-email--notification-system)
17. [WhatsApp Integration](#17-whatsapp-integration)
18. [SEO & Marketing](#18-seo--marketing)
19. [Admin Dashboard](#19-admin-dashboard)
20. [Data Flow Diagrams](#20-data-flow-diagrams)
21. [Security - Row Level Security (RLS)](#21-security---row-level-security-rls)
22. [Key Design Decisions](#22-key-design-decisions)

---

## 1. Project Overview

**Cuenti.to** is an AI-powered children's story generator. Users type a prompt (e.g., "a story about a dragon who learns to share"), and the platform uses **Google Gemini AI** to generate a complete story with a title, synopsis, body text, tags, and AI-generated illustrations.

### What the App Does

- **Generates children's stories** from text prompts using AI (Gemini)
- **Creates AI illustrations** for each story (via Gemini image generation)
- **Supports anonymous users** (1 free story) and **registered users** (credit-based)
- **Monetizes** through subscription plans via **Stripe** and **MercadoPago**
- **Provides a public library** of published stories users can browse, like, and share
- **Sends stories via email** and supports **text-to-speech** audio generation
- **Integrates with WhatsApp** for story generation via chat
- **Supports 3 languages**: Spanish (primary), English, and Portuguese
- **Has an admin dashboard** for user management and analytics

---

## 2. Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React 18** | UI library |
| **TypeScript** | Type safety |
| **Vite** | Build tool and dev server |
| **React Router v6** | Client-side routing |
| **TanStack React Query** | Server state management, caching, and data fetching |
| **Tailwind CSS** | Utility-first CSS framework |
| **shadcn/ui** (Radix UI) | Pre-built accessible UI component library |
| **i18next** | Internationalization (Spanish, English, Portuguese) |
| **Recharts** | Charts for admin dashboard |
| **Lucide React** | Icon library |
| **Zod** | Schema validation |
| **React Hook Form** | Form management |
| **React PDF / pdf-lib** | PDF generation for printable stories |
| **Sonner** | Toast notifications |

### Backend (Supabase)

| Technology | Purpose |
|---|---|
| **Supabase** | Backend-as-a-Service (BaaS) |
| **PostgreSQL** | Relational database (managed by Supabase) |
| **Supabase Auth** | Authentication (Google, Facebook OAuth) |
| **Supabase Edge Functions** (Deno) | Serverless API endpoints |
| **Supabase Storage** | File storage (images, audio) |
| **Supabase Realtime** | (Available but not heavily used) |
| **Row Level Security (RLS)** | Database-level authorization |

### External Services

| Service | Purpose |
|---|---|
| **Google Gemini AI** | Story text generation + image generation |
| **Stripe** | Payment processing (international) |
| **MercadoPago** | Payment processing (Latin America) |
| **Brevo (Sendinblue)** | Transactional emails (stories, subscriptions) |
| **Resend** | Transactional emails (contact, feedback, newsletter) |
| **Microsoft Cognitive Services** | Text-to-speech audio generation |
| **Meta WhatsApp API** | WhatsApp bot for story generation |
| **Google AdSense** | Advertising monetization |

---

## 3. Folder Structure

```
cuentizo/
├── index.html                    # SPA entry point
├── package.json                  # Dependencies & scripts
├── vite.config.ts                # Vite build configuration
├── tsconfig.json                 # TypeScript config (root)
├── tsconfig.app.json             # TypeScript config (app source)
├── tsconfig.node.json            # TypeScript config (Node/Vite)
├── tailwind.config.ts            # Tailwind CSS configuration
├── postcss.config.js             # PostCSS config (Tailwind plugin)
├── eslint.config.js              # ESLint configuration
├── components.json               # shadcn/ui component config
│
├── public/                       # Static assets
│   ├── ads.txt                   # AdSense verification
│   ├── robots.txt                # SEO crawl rules
│   ├── placeholder.svg           # Placeholder image
│   └── _redirects                # SPA routing for static hosts (Netlify/etc)
│
├── src/                          # === FRONTEND SOURCE ===
│   ├── main.tsx                  # React DOM entry point
│   ├── App.tsx                   # Root component (providers + router)
│   ├── App.css                   # Global app styles
│   ├── index.css                 # Tailwind base imports
│   ├── vite-env.d.ts             # Vite type declarations
│   │
│   ├── components/               # === UI COMPONENTS ===
│   │   ├── routing/
│   │   │   └── AppRoutes.tsx     # All route definitions
│   │   ├── auth/
│   │   │   ├── ProtectedRoute.tsx    # Auth guard HOC
│   │   │   ├── AdminRoute.tsx        # Admin-only guard HOC
│   │   │   ├── AuthForm.tsx          # OAuth login form
│   │   │   └── AuthModalHeader.tsx   # Auth modal header
│   │   ├── nav/
│   │   │   ├── NavLogo.tsx           # Logo component
│   │   │   ├── NavLinks.tsx          # Navigation links
│   │   │   ├── NavActions.tsx        # Login/CTA buttons
│   │   │   ├── UserMenu.tsx          # Authenticated user dropdown
│   │   │   └── useNavigation.tsx     # Navigation hook (auth state)
│   │   ├── admin/
│   │   │   ├── AdminUsersTable.tsx   # Users management table
│   │   │   ├── UserDetails.tsx       # User detail dialog
│   │   │   └── TopCountriesCard.tsx  # Country analytics card
│   │   ├── contact/
│   │   │   └── ContactForm.tsx       # Contact us form
│   │   ├── feedback/                 # Feedback components
│   │   ├── newsletter/              # Newsletter subscription
│   │   ├── print/                   # Print/PDF story components
│   │   ├── profile/
│   │   │   └── ProfileForm.tsx      # Profile edit form
│   │   ├── subscription/
│   │   │   └── SubscriptionModalContent.tsx  # Pricing plans UI
│   │   ├── ui/                      # shadcn/ui primitives (30+ files)
│   │   │
│   │   ├── Nav.tsx                  # Top navigation bar
│   │   ├── Footer.tsx               # Site footer
│   │   ├── Hero.tsx                 # Landing page hero section
│   │   ├── Features.tsx             # Landing page features
│   │   ├── FAQ.tsx                  # Landing page FAQ
│   │   ├── SEO.tsx                  # SEO meta tags (React Helmet)
│   │   ├── AdSenseScript.tsx        # Google AdSense loader
│   │   ├── AdSlot.tsx               # Ad placement component
│   │   ├── LanguageSwitcher.tsx     # i18n language selector
│   │   ├── NewsletterRegistration.tsx # Newsletter signup
│   │   │
│   │   ├── StoryGenerator.tsx       # Story creation orchestrator
│   │   ├── StoryPromptForm.tsx      # Prompt input form
│   │   ├── StoryContentWrapper.tsx  # Story page layout wrapper
│   │   ├── StoryContainer.tsx       # Story content container
│   │   ├── StoryContent.tsx         # Story body renderer
│   │   ├── StoryContentHeader.tsx   # Story title/meta header
│   │   ├── StoryContentBody.tsx     # Story text body
│   │   ├── StoryHeader.tsx          # Story page header
│   │   ├── StorySidebar.tsx         # Story sidebar (related)
│   │   ├── StoryCard.tsx            # Story card for grids
│   │   ├── StoriesGrid.tsx          # Grid layout for story cards
│   │   ├── StoryActions.tsx         # Like/share/print actions
│   │   ├── StoryTags.tsx            # Tag display + links
│   │   ├── StoryLikeHandler.tsx     # Like toggle logic
│   │   ├── StoryShareModal.tsx      # Social sharing modal
│   │   ├── StoryFlagModal.tsx       # Report story modal
│   │   ├── StoryHistory.tsx         # Story version history
│   │   ├── StoryAudioPlayer.tsx     # Text-to-speech player
│   │   │
│   │   ├── RegistrationModal.tsx    # Signup prompt for anon users
│   │   ├── SubscriptionTiersModal.tsx  # Pricing plans modal
│   │   ├── LibraryHeader.tsx        # Library page header + sort
│   │   ├── LibraryPagination.tsx    # Pagination controls
│   │   └── LibraryLoadingState.tsx  # Library skeleton loader
│   │
│   ├── pages/                    # === ROUTE-LEVEL PAGES ===
│   │   ├── Index.tsx             # Landing page (/)
│   │   ├── Login.tsx             # Login page (/login)
│   │   ├── AuthCallback.tsx      # OAuth callback (/auth/callback)
│   │   ├── Profile.tsx           # Profile editor (/profile)
│   │   ├── Library.tsx           # Story library (/library)
│   │   ├── Search.tsx            # Story search (/search)
│   │   ├── Story.tsx             # Story detail page (/story/:title/:id?)
│   │   ├── LikedStories.tsx      # User's liked stories (/liked)
│   │   ├── TaggedStories.tsx     # Stories by tag (/tagged/:tag)
│   │   ├── Dashboard.tsx         # Admin dashboard (/dashboard)
│   │   ├── PaymentSuccess.tsx    # Post-payment page (/payment/success)
│   │   ├── Contact.tsx           # Contact form (/contact)
│   │   ├── TermsOfService.tsx    # Legal - ToS (/terms-of-service)
│   │   └── PrivacyPolicy.tsx     # Legal - Privacy (/privacy-policy)
│   │
│   ├── hooks/                    # === CUSTOM REACT HOOKS ===
│   │   ├── useStoryGeneration.ts     # Core story generation flow
│   │   ├── useStoryData.tsx          # Fetch story by slug/ID
│   │   ├── useStoryLikes.tsx         # Like/unlike mutations
│   │   ├── useStoryAttribution.ts    # Link anon stories to user
│   │   ├── useUserCredits.ts         # Fetch user's story credits
│   │   ├── useSession.ts             # Current auth session
│   │   ├── useSessionData.tsx         # Extended session data
│   │   ├── useAnonymousSession.ts    # Cookie-based anon session
│   │   ├── useAnonymousUserStories.ts # Anon story tracking
│   │   ├── usePromptValidation.ts    # Prompt content filter
│   │   ├── useIsPayingUser.ts        # Subscription status check
│   │   ├── useNoAds.ts              # Ad-free for subscribers
│   │   ├── usePendingSubscription.ts # Handle pending payments
│   │   ├── useSubscriptionManagement.ts # Subscription CRUD
│   │   ├── use-toast.ts             # Toast notification hook
│   │   └── use-mobile.tsx           # Mobile breakpoint detection
│   │
│   ├── utils/                    # === UTILITY FUNCTIONS ===
│   │   ├── storyContent.ts          # Parse & clean story responses
│   │   ├── storyLimits.ts           # Credit & rate limit checks
│   │   ├── slugUtils.ts             # URL slug generation
│   │   ├── contentFilter.ts         # Banned word detection
│   │   ├── bannedWords.ts           # Banned word patterns list
│   │   ├── emailUtils.ts            # Email sending helpers
│   │   ├── imageUtils.ts            # Image URL utilities
│   │   ├── sessionUtils.ts          # Session/cookie helpers
│   │   ├── subscriptionUtils.ts     # Plan sorting & pricing
│   │   ├── pricingUtils.ts          # Price formatting
│   │   └── importStories.ts         # Bulk story import
│   │
│   ├── services/
│   │   └── ImageGenerationService.ts  # AI image generation client
│   │
│   ├── types/                    # === TYPESCRIPT TYPES ===
│   │   ├── story.ts                 # Story & image types
│   │   ├── admin.ts                 # Admin dashboard types
│   │   ├── pricing.ts               # Pricing plan types
│   │   ├── subscription.ts          # Subscription types
│   │   └── database/               # Manual DB type overrides
│   │       ├── index.ts
│   │       ├── auth.ts
│   │       ├── profiles.ts
│   │       └── stories.ts
│   │
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts            # Supabase client initialization
│   │       └── types.ts             # Auto-generated DB types (843 lines)
│   │
│   ├── i18n/
│   │   ├── config.ts               # i18next configuration
│   │   ├── banned_words.txt         # Banned words reference
│   │   └── translations/
│   │       ├── en.ts                # English translations
│   │       ├── es.ts                # Spanish translations (primary)
│   │       └── pt.ts                # Portuguese translations
│   │
│   └── styles/
│       └── print.css               # Print-specific stylesheet
│
└── supabase/                     # === BACKEND (SUPABASE) ===
    ├── config.toml               # Supabase project config
    ├── migrations/               # Database migrations (SQL)
    │   ├── 20240320000000_add_http_extension.sql
    │   ├── 20240327000000_add_rls_policies.sql
    │   ├── 20240328000000_add_profiles_rls.sql
    │   ├── 20240328000000_add_sitemap_trigger.sql
    │   ├── 20240328000001_add_image_generation_logs.sql
    │   ├── 20260129235246_*.sql    # Role system + admin setup
    │   └── 20260129235555_*.sql    # Advanced RLS + functions
    │
    └── functions/                # Supabase Edge Functions (Deno)
        ├── _shared/              # Shared utilities
        │   ├── cors.ts               # CORS headers helper
        │   └── slugUtils.ts          # Slug generation (server-side)
        │
        ├── generate-story/           # AI story generation (Gemini)
        ├── generate-image/           # AI image generation (Gemini)
        ├── generate-speech/          # Text-to-speech (Microsoft)
        │
        ├── get-library-stories/      # Public story library
        ├── get-user-stories/         # User's own stories
        ├── get-top-stories/          # Top liked stories
        ├── get-story/                # Single story by ID
        ├── get-user-credits/         # User credit balance
        ├── get-user-info/            # Full user profile (admin)
        ├── get-all-users/            # All users list (admin)
        ├── get-top-countries/        # Country analytics
        ├── get-top-countries-last-week/ # Weekly country analytics
        │
        ├── create-payment/           # MercadoPago checkout
        ├── create-stripe-payment/    # Stripe checkout
        ├── payment-webhook/          # MercadoPago webhook
        ├── stripe-webhook/           # Stripe webhook
        │
        ├── send-email-story/         # Email story to user
        ├── send-contact-email/       # Contact form email
        ├── send-feedback-email/      # Feedback email
        ├── send-feedback-notification/ # Admin feedback alert
        ├── send-subscription-email/  # Subscription confirmation
        ├── send-newsletter-notification/ # Newsletter admin alert
        │
        ├── check-is-admin/           # Admin role verification
        ├── whatsapp-webhook/         # WhatsApp bot
        ├── update-sitemap/           # Dynamic sitemap generation
        ├── fetch-stories/            # Import stories from JSON
        ├── batch-import-stories/     # Bulk story import
        ├── import-wordpress-stories/ # WordPress migration
        └── import-wordpress-users/   # WordPress user migration
```

---

## 4. Architecture - How Frontend & Backend Connect

This project uses a **serverless architecture** pattern where:

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│        React SPA (Vite + TypeScript)                │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐                 │
│  │  React Query  │  │   Supabase   │                │
│  │  (caching)    │  │   JS Client  │                │
│  └──────┬───────┘  └──────┬───────┘                 │
└─────────┼─────────────────┼─────────────────────────┘
          │                 │
          │    HTTPS        │   HTTPS
          │                 │
┌─────────┼─────────────────┼─────────────────────────┐
│         ▼                 ▼       SUPABASE           │
│  ┌──────────────┐  ┌──────────────┐                 │
│  │ Edge Functions│  │  PostgREST   │                │
│  │ (Deno runtime)│  │  (auto API)  │                │
│  └──────┬───────┘  └──────┬───────┘                 │
│         │                 │                          │
│         ▼                 ▼                          │
│  ┌─────────────────────────────────┐                │
│  │       PostgreSQL Database        │                │
│  │    (with RLS policies)           │                │
│  └─────────────────────────────────┘                │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐                 │
│  │  Supabase     │  │  Supabase    │                │
│  │  Auth         │  │  Storage     │                │
│  └──────────────┘  └──────────────┘                 │
└─────────────────────────────────────────────────────┘
          │
          │   External API Calls
          ▼
┌─────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES                       │
│  Google Gemini │ Stripe │ MercadoPago │ Brevo/Resend │
│  Microsoft TTS │ Meta WhatsApp API                   │
└─────────────────────────────────────────────────────┘
```

### Connection Patterns

**Pattern 1: Direct Database Queries (PostgREST)**
The frontend uses the Supabase JS client to directly query the PostgreSQL database. Supabase auto-generates a REST API from the database schema. Security is enforced via Row Level Security (RLS).

```typescript
// Example: Fetching a story directly from the database
const { data, error } = await supabase
  .from('stories')
  .select('id, title, body, likes')
  .eq('id', storyId)
  .single();
```

**Pattern 2: Edge Function Invocation**
For complex logic (AI generation, payments, emails), the frontend invokes Supabase Edge Functions which run on Deno serverless runtime.

```typescript
// Example: Invoking an edge function to generate a story
const { data, error } = await supabase.functions.invoke('generate-story', {
  body: { prompt: "a story about a brave cat" }
});
```

**Pattern 3: React Query Caching Layer**
All data fetching is wrapped in TanStack React Query for automatic caching, background refetching, and optimistic updates.

```typescript
// Example: React Query wrapping a Supabase call
const { data, isLoading } = useQuery({
  queryKey: ['library-stories'],
  queryFn: async () => {
    const { data } = await supabase.functions.invoke('get-library-stories');
    return data;
  },
  staleTime: 5 * 60 * 1000, // Cache for 5 minutes
});
```

### How the Supabase Client is Initialized

```typescript
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "YOUR_ANON_KEY";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
```

The client is **typed** with auto-generated `Database` types, providing full TypeScript autocomplete for all table operations.

---

## 5. Database Schema & Models

The PostgreSQL database has **16 tables**:

### Core Tables

#### `stories`
The central table holding all generated stories.

| Column | Type | Purpose |
|---|---|---|
| `id` | uuid (PK) | Unique story identifier |
| `title` | text | Story title (AI-generated) |
| `prompt` | text | User's original prompt |
| `content` | text | Raw story content |
| `body` | text | Cleaned story body text |
| `synopsis` | text | Short summary |
| `tags` | text | Comma-separated tags |
| `image_url` | text | Featured image URL |
| `image_prompt` | text | AI prompt for featured image |
| `image_prompt1` | text | AI prompt for middle image 1 |
| `image_prompt2` | text | AI prompt for middle image 2 |
| `final_image_url` | text | Combined middle image URLs |
| `middle_images` | text[] | Array of middle image URLs |
| `likes` | integer | Like count |
| `status` | text | 'published' / 'draft' |
| `user_id` | uuid (FK) | Authenticated author |
| `anonymous_user_id` | uuid (FK) | Anonymous author |
| `wordpress_user_id` | text | Migrated WordPress author |
| `wordpress_slug` | text | Original WordPress slug |
| `cuentito_uid` | text | Internal UID |
| `raw_response` | text | Full AI response (JSON) |
| `created_at` | timestamptz | Creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |

#### `profiles`
Extended user profiles (auto-created on signup via Supabase trigger).

| Column | Type | Purpose |
|---|---|---|
| `id` | uuid (PK, FK→auth.users) | User ID |
| `first_name` | text | First name |
| `last_name` | text | Last name |
| `story_credits` | integer | Remaining story generation credits |
| `country` | text | User's country |
| `avatar_url` | text | Profile picture |
| `created_at` | timestamptz | Account creation |
| `updated_at` | timestamptz | Last profile update |

#### `story_likes`
Join table for the many-to-many like relationship.

| Column | Type | Purpose |
|---|---|---|
| `id` | uuid (PK) | Like record ID |
| `story_id` | uuid (FK→stories) | Which story |
| `user_id` | uuid (FK→auth.users) | Who liked it |
| `created_at` | timestamptz | When liked |

### User & Auth Tables

#### `anonymous_users`
Tracks anonymous (non-registered) users via cookies.

| Column | Type | Purpose |
|---|---|---|
| `id` | uuid (PK) | Anonymous user ID |
| `session_id` | text | Cookie-based session |
| `created_at` | timestamptz | First visit |

#### `user_roles`
Role-based access control (RBAC).

| Column | Type | Purpose |
|---|---|---|
| `id` | bigint (PK) | Role assignment ID |
| `user_id` | uuid (FK) | User |
| `role` | app_role (enum) | 'admin' or 'moderator' |

The `app_role` enum: `'admin'` | `'moderator'`

### Subscription & Payment Tables

#### `subscription_plans`
Available pricing tiers.

| Column | Type | Purpose |
|---|---|---|
| `id` | uuid (PK) | Plan ID |
| `name` | text | Plan name |
| `price` | numeric | Price amount |
| `stories_per_month` | integer | Monthly story quota |
| `features` | text[] | Feature list |
| `stripe_price_id` | text | Stripe price identifier |
| `mercadopago_plan_id` | text | MercadoPago plan ID |
| `is_recurring` | boolean | Subscription vs one-time |

#### `user_subscriptions`
Active user subscriptions.

| Column | Type | Purpose |
|---|---|---|
| `id` | uuid (PK) | Subscription record |
| `user_id` | uuid (FK) | Subscriber |
| `plan_id` | uuid (FK) | Plan reference |
| `status` | text | 'active', 'cancelled', etc. |
| `stripe_subscription_id` | text | Stripe sub ID |
| `mercadopago_subscription_id` | text | MP sub ID |
| `mercadopago_payment_id` | text | MP payment ID |
| `starts_at` | timestamptz | Subscription start |
| `ends_at` | timestamptz | Subscription end |

#### `processed_payments`
Payment audit trail to prevent duplicate processing.

| Column | Type | Purpose |
|---|---|---|
| `id` | uuid (PK) | Payment record |
| `payment_id` | text | External payment ID |
| `payment_type` | text | 'stripe' or 'mercadopago' |
| `user_id` | uuid (FK) | Payer |
| `amount` | numeric | Payment amount |
| `status` | text | Payment status |
| `processed_at` | timestamptz | Processing time |

### Content & Engagement Tables

#### `story_translations`
Multi-language story translations.

#### `story_audio`
Text-to-speech audio files for stories.

| Column | Type | Purpose |
|---|---|---|
| `story_id` | uuid (FK) | Story reference |
| `audio_url` | text | Storage URL for audio file |
| `voice_name` | text | TTS voice used |

#### `story_flags`
User-reported content flags.

#### `feedback`
User feedback submissions.

#### `newsletter_subscriptions`
Email newsletter signups.

#### `image_generation_logs`
Audit log for AI image generation requests.

#### `whatsapp_messages`
Log of WhatsApp bot interactions.

### Database Functions (RPCs)

| Function | Purpose |
|---|---|
| `add_story_credits(user_id, credits)` | Add credits to a user's profile |
| `check_is_admin(user_id)` | Check if user has admin role |
| `has_role(user_id, role)` | Check if user has a specific role |
| `import_stories_from_json(stories_json)` | Bulk import stories from JSON |
| `increment_likes(row_id)` | Atomically increment story likes |
| `decrement_likes(row_id)` | Atomically decrement story likes |
| `get_top_countries()` | Aggregate user country statistics |
| `get_top_countries_last_week()` | Weekly country statistics |
| `get_cuentito_user_id()` | Get the system "cuentito" user ID |

---

## 6. Authentication Flow

The app uses **Supabase Auth** with **OAuth-only** authentication (Google and Facebook). There is no email/password login.

### Flow Diagram

```
User clicks "Iniciar sesión" (Login)
         │
         ▼
    /login page
    (Supabase Auth UI)
         │
    ┌────┴────┐
    │ Google  │  Facebook
    │ OAuth   │  OAuth
    └────┬────┘
         │
    OAuth redirect to provider
         │
    Provider authenticates user
         │
    Redirect back to /auth/callback
         │
         ▼
  AuthCallback.tsx handles:
    1. Get session from Supabase
    2. Check for pending story attribution
       (link anonymous stories to new account)
    3. Check for pending subscription
       (redirect to payment if mid-checkout)
    4. Check profile completeness
       (redirect to /profile if first_name/last_name missing)
    5. Navigate to home (/)
```

### Anonymous Users

Users can generate **1 free story** without registering:

1. `useAnonymousSession` creates a UUID cookie (`anonymous-session-id`, 30-day expiry)
2. An `anonymous_users` record is created in the database
3. Stories are saved with `anonymous_user_id` instead of `user_id`
4. After registering, `AuthCallback` re-attributes the story to the new user account

### Route Protection

```typescript
// ProtectedRoute: Redirects to /login if no session AND no anonymous session
<ProtectedRoute>
  <Library />
</ProtectedRoute>

// AdminRoute: Additional check for admin role
<AdminRoute>
  <Dashboard />
</AdminRoute>
```

The `AdminRoute` checks admin status via:
1. `has_role` RPC call (checks `user_roles` table)
2. Fallback: checks if email matches hardcoded admin email
3. Checks `app_metadata.is_super_admin` flag

---

## 7. Core Business Logic

### 7.1 Story Generation Pipeline

This is the most critical flow in the application:

```
User enters prompt
       │
       ▼
StoryPromptForm.tsx
  - Validates prompt (content filter for banned words)
  - Checks character limits
       │
       ▼
StoryGenerator.tsx
  - Checks if user is authenticated
  - If authenticated: checks story_credits > 0
  - If anonymous: checks if already used free story
  - If no credits: shows SubscriptionTiersModal
       │
       ▼
useStoryGeneration hook
  1. handleLimitCheck() → storyLimits.ts
     - Authenticated: query profiles.story_credits
     - Anonymous: count stories by anonymous_user_id
       │
  2. Invoke 'generate-story' Edge Function
     - Sends prompt to Google Gemini AI
     - Returns: { title, content, synopsis, tags, image_prompts }
       │
  3. parseStoryResponse() → storyContent.ts
     - Extracts structured data from AI response
     - Cleans content (removes JSON wrappers)
       │
  4. Determine image count by subscription tier:
     - Anonymous/free: 1 image (featured only)
     - Registered (no sub): 2 images (featured + 1 middle)
     - Subscriber: 3 images (featured + 2 middle)
       │
  5. ImageGenerationService.generateImage()
     - Invokes 'generate-image' Edge Function
     - Uses Gemini to generate illustration
     - Returns image URL
       │
  6. Insert story into database
     - Saves all fields (title, body, images, tags, etc.)
     - Links to user_id or anonymous_user_id
       │
  7. Send story via email (if authenticated)
     - Invokes 'send-email-story' Edge Function
       │
  8. Navigate to /story/{slug}/{id}
```

### 7.2 Credit System

The app uses a **credit-based** monetization model:

| User Type | Credits | Behavior |
|---|---|---|
| Anonymous | 1 story total | Cookie-tracked, no registration needed |
| Free registered | Initial credits from profile | Credits deducted per story |
| Subscriber | Monthly credit allocation | Credits reset based on plan |

**Credit flow:**
1. User generates a story → `story_credits` decremented
2. User purchases a plan → payment webhook calls `add_story_credits` RPC
3. `processed_payments` table prevents duplicate credit additions

### 7.3 Story Likes System

```
User clicks ❤️ on a story
       │
       ▼
useStoryLikes hook
  1. INSERT into story_likes (story_id, user_id)
  2. Call increment_likes RPC (atomic counter)
  3. Invalidate React Query cache → UI updates
       │
User clicks ❤️ again (unlike)
       │
  1. DELETE from story_likes
  2. Call decrement_likes RPC
  3. Invalidate cache
```

### 7.4 Story Display & URL Structure

Stories use **SEO-friendly slugs**: `/story/{title-as-slug}/{uuid}`

The `useStoryData` hook resolves stories by:
1. First try: fetch by UUID (if `id` parameter present)
2. Second try: match by `wordpress_slug` (for migrated content)
3. Third try: fetch all stories and match by generated slug from title

---

## 8. Frontend - Pages & Routing

All routes are defined in `AppRoutes.tsx`. Every page is wrapped in `<Nav />` (top) and `<Footer />` (bottom).

| Route | Page Component | Access | Purpose |
|---|---|---|---|
| `/` | `Index` | Public | Landing page (Hero + Features + FAQ + Newsletter) |
| `/login` | `Login` | Public | OAuth login (Google/Facebook) |
| `/auth/callback` | `AuthCallback` | Public | OAuth redirect handler |
| `/story/new` | `StoryGenerator` | Protected | Create a new story |
| `/story/:title/:id?` | `Story` | Protected | View a story |
| `/library` | `Library` | Protected | Browse all stories |
| `/search` | `Search` | Protected | Search stories by title |
| `/liked` | `LikedStories` | Protected | User's liked stories |
| `/tagged/:tag` | `TaggedStories` | Protected | Stories filtered by tag |
| `/profile` | `Profile` | Protected | Edit user profile |
| `/dashboard` | `Dashboard` | Admin only | Analytics & user management |
| `/payment/success` | `PaymentSuccess` | Public | Post-payment confirmation |
| `/contact` | `Contact` | Public | Contact form |
| `/terms-of-service` | `TermsOfService` | Public | Legal terms |
| `/privacy-policy` | `PrivacyPolicy` | Public | Privacy policy |

### Page Details

**Index (Landing Page)**: Composed of `Hero` (CTA to create a story), `Features` (platform highlights), `FAQ` (accordion), and `NewsletterRegistration`.

**Library**: Fetches stories via `get-user-stories` edge function. Supports client-side sorting (by likes or date) and pagination (9 items per page).

**Story**: Uses `useStoryData` to fetch the story, renders via `StoryContentWrapper` → `StoryContainer` → `StoryContent`. Includes SEO meta tags, like/share actions, audio player, and tag navigation.

**Dashboard**: Admin-only page with analytics charts (Recharts), story/user/credit statistics, country distribution, and a full user management table with CSV export.

---

## 9. Frontend - Components Breakdown

### Navigation System

```
Nav.tsx
├── NavLogo.tsx          → Logo linking to /
├── NavLinks.tsx         → Pricing, Library, Search links
├── LanguageSwitcher.tsx → ES/EN/PT language toggle
└── NavActions.tsx
    ├── (Unauthenticated) → Login button + "Write a story" CTA
    └── (Authenticated) → "Write a story" + UserMenu dropdown
        └── UserMenu.tsx → Profile, Dashboard (admin), My Stories, Liked, Upgrade, Logout
```

### Story Generation UI

```
StoryGenerator.tsx (orchestrator)
├── StoryPromptForm.tsx      → Text input + submit button
├── RegistrationModal.tsx    → Prompts anonymous users to register
└── SubscriptionTiersModal.tsx → Shows pricing when credits are 0
    └── SubscriptionModalContent.tsx → Plan cards with Stripe/MP buttons
```

### Story Display Stack

```
Story.tsx (page)
├── SEO.tsx                  → Meta tags for social sharing
├── StoryContentWrapper.tsx  → Layout with sidebar
│   ├── StoryContainer.tsx   → Main content area
│   │   └── StoryContent.tsx → Full story rendering
│   │       ├── StoryContentHeader.tsx → Title, author, date
│   │       ├── StoryContentBody.tsx   → Story text with images
│   │       ├── StoryTags.tsx          → Clickable tag links
│   │       └── StoryActions.tsx       → Like, share, print, audio, email
│   │           ├── StoryLikeHandler.tsx
│   │           ├── StoryShareModal.tsx
│   │           ├── StoryAudioPlayer.tsx
│   │           └── StoryFlagModal.tsx
│   └── StorySidebar.tsx     → Related stories / ads
└── RegistrationModal.tsx    → Prompt to register (for anon users)
```

### Library & Grid System

```
Library.tsx (page)
├── LibraryHeader.tsx        → Title + sort dropdown (likes/date)
├── StoriesGrid.tsx          → CSS grid of StoryCard components
│   └── StoryCard.tsx        → Card with image, title, synopsis, likes
├── LibraryPagination.tsx    → Page navigation
└── LibraryLoadingState.tsx  → Skeleton loading placeholder
```

---

## 10. Frontend - Custom Hooks

| Hook | Purpose | Key Logic |
|---|---|---|
| `useStoryGeneration` | Orchestrates the full story creation pipeline | Checks limits → calls AI → generates images → saves to DB → emails → navigates |
| `useStoryData` | Fetches a story by slug/ID with fallback strategies | ID → WordPress slug → title matching |
| `useStoryLikes` | Like/unlike mutations with optimistic updates | Insert/delete `story_likes` + RPC counter |
| `useStoryAttribution` | Links anonymous stories to authenticated user | Updates `user_id`, clears `anonymous_user_id` |
| `useUserCredits` | Fetches remaining story credits | Anonymous=1, authenticated=from edge function |
| `useSession` | Returns current Supabase auth session | `supabase.auth.getSession()` + listener |
| `useSessionData` | Extended session with React Query caching | Same as `useSession` but query-cached |
| `useAnonymousSession` | Creates/retrieves anonymous session cookie | UUID cookie with 30-day expiry |
| `useAnonymousUserStories` | Tracks anonymous user's story count | Creates `anonymous_users` record, checks limit |
| `usePromptValidation` | Validates prompts against banned word list | Returns matched banned word or null |
| `useIsPayingUser` | Checks if user has active subscription | Queries `user_subscriptions` |
| `useNoAds` | Determines if ads should be hidden | True for paying users |
| `usePendingSubscription` | Handles subscriptions started before login | Reads from localStorage, completes after auth |
| `useSubscriptionManagement` | Subscription CRUD operations | Create, cancel, update subscriptions |
| `useNavigation` | Nav bar state (auth, user name, modals) | Auth listener + profile completion check |
| `use-toast` | Toast notification management | Wrapper around Radix toast |
| `use-mobile` | Mobile breakpoint detection | Media query listener |

---

## 11. Frontend - Utilities

| Utility | Purpose |
|---|---|
| `storyContent.ts` | `cleanStoryContent()` - strips JSON wrappers from AI response; `parseStoryResponse()` - extracts structured story data; `sendStoryByEmail()` - sends story email |
| `storyLimits.ts` | `checkMonthlyLimit()` - checks if user has credits; `checkAnonymousUserLimit()` - checks if anon user already created a story; `handleLimitCheck()` - unified limit checker |
| `slugUtils.ts` | `createSlug()` - converts story titles to URL-safe slugs |
| `contentFilter.ts` | `checkForBannedWords()` - regex-based content moderation against banned word patterns |
| `bannedWords.ts` | Array of 50+ regex patterns for inappropriate content |
| `emailUtils.ts` | Helper to invoke the email edge function |
| `imageUtils.ts` | Image URL manipulation and validation |
| `sessionUtils.ts` | Cookie and session management helpers |
| `subscriptionUtils.ts` | `sortSubscriptionPlans()` - sorts by price; `isPopularPlan()` - identifies middle-tier plan |
| `pricingUtils.ts` | Price formatting for display |
| `importStories.ts` | Bulk import stories from JSON data |

---

## 12. Backend - Supabase Edge Functions

Edge Functions are serverless functions running on **Deno** runtime. They handle all complex server-side logic.

### AI Functions

#### `generate-story`
- **Trigger**: User submits a prompt
- **Logic**: Sends prompt to Google Gemini API with a system prompt that instructs the AI to return a structured JSON with title, content, synopsis, tags, and image prompts
- **Auth**: Optional (works for both anonymous and authenticated users)
- **Returns**: `{ data: { title, content, synopsis, tags, image_prompts } }`

#### `generate-image`
- **Trigger**: Called by frontend after story generation
- **Logic**: Takes an image prompt → sends to Gemini image generation → returns URL
- **Auth**: Optional (anonymous users get `Bearer anonymous` header)
- **Returns**: `{ imageURL: string }`

#### `generate-speech`
- **Trigger**: User clicks audio player on a story
- **Logic**: Sends story text to Microsoft Cognitive Services TTS → uploads MP3 to Supabase Storage → upserts `story_audio` record
- **Returns**: `{ audioUrl: string }`

### Data Retrieval Functions

| Function | Purpose | Auth Required |
|---|---|---|
| `get-library-stories` | Returns up to 27 published stories | No |
| `get-user-stories` | Returns user's stories or top-rated stories (limit 100) | No |
| `get-top-stories` | Top 10 stories by like count | No |
| `get-story` | Single story by ID | No (service role) |
| `get-user-credits` | User's remaining credits | Yes |
| `get-user-info` | Full user profile + stats (admin) | Service role |
| `get-all-users` | All users with search/enrich (admin) | Admin role |
| `get-top-countries` | Country statistics from profiles | No |
| `get-top-countries-last-week` | Weekly country stats | No |

### Payment Functions

#### `create-payment` (MercadoPago)
- Creates either a **preapproval** (recurring subscription) or a **checkout preference** (one-time payment)
- Inserts `user_subscriptions` record with status 'pending'
- Returns `checkoutUrl` for redirect

#### `create-stripe-payment`
- Creates a **Stripe Checkout Session**
- Handles both recurring (subscription) and one-time payments
- Inserts `user_subscriptions` record
- Returns `checkoutUrl`

#### `payment-webhook` (MercadoPago)
- Receives MercadoPago IPN notifications
- Verifies payment status
- On success: calls `add_story_credits` RPC, records in `processed_payments`, invokes `send-subscription-email`

#### `stripe-webhook`
- Receives Stripe webhook events
- Handles `checkout.session.completed` and `customer.subscription.deleted`
- On success: adds credits, records payment, sends confirmation email
- On deletion: updates subscription status

### Email Functions

| Function | Provider | Purpose |
|---|---|---|
| `send-email-story` | Brevo | Sends story to user via email with a link |
| `send-subscription-email` | Brevo | Subscription confirmation thank-you |
| `send-contact-email` | Resend | Contact form submission to admin |
| `send-feedback-email` | Resend | User feedback submission |
| `send-feedback-notification` | Brevo | Admin notification for new feedback |
| `send-newsletter-notification` | Resend | Admin notification for new subscriber |

### Admin & Utility Functions

| Function | Purpose |
|---|---|
| `check-is-admin` | Verifies if a user has admin privileges |
| `update-sitemap` | Generates XML sitemap from all stories and uploads to storage |
| `fetch-stories` | Imports stories from an external JSON URL |
| `batch-import-stories` | Bulk imports stories with service role access |
| `import-wordpress-stories` | Migrates stories from WordPress export |
| `import-wordpress-users` | Migrates users from WordPress export |
| `whatsapp-webhook` | WhatsApp Business API integration |

---

## 13. Payment & Subscription System

The app supports **two payment providers** for maximum geographic coverage:

### Payment Flow

```
User clicks "Subscribe" on a plan
         │
    ┌────┴─────┐
    │          │
 Stripe    MercadoPago
    │          │
    ▼          ▼
create-stripe-payment  OR  create-payment
  Edge Function              Edge Function
    │                          │
    ▼                          ▼
Insert user_subscriptions    Insert user_subscriptions
(status: 'pending')          (status: 'pending')
    │                          │
    ▼                          ▼
Redirect to Stripe         Redirect to MercadoPago
Checkout                   Checkout
    │                          │
    ▼                          ▼
User completes payment     User completes payment
    │                          │
    ▼                          ▼
stripe-webhook             payment-webhook
    │                          │
    ├─ Verify event            ├─ Verify event
    ├─ Check processed_payments├─ Check processed_payments
    │  (prevent duplicates)    │  (prevent duplicates)
    ├─ add_story_credits RPC   ├─ add_story_credits RPC
    ├─ Record payment          ├─ Record payment
    ├─ Update subscription     ├─ Update subscription
    │  status → 'active'       │  status → 'active'
    └─ Send confirmation email └─ Send confirmation email
         │                          │
         ▼                          ▼
    /payment/success page      /payment/success page
    (shows success toast)      (shows success toast)
```

### Subscription Tiers

Plans are stored in `subscription_plans` table with:
- Plan name and price
- `stories_per_month` - monthly credit allocation
- `features` - array of feature descriptions
- `stripe_price_id` / `mercadopago_plan_id` - external identifiers
- `is_recurring` - whether it's a subscription or one-time purchase

### Image Tier Logic

The number of AI-generated illustrations scales with the user's subscription level:

| Tier | Images per Story | Image Types |
|---|---|---|
| Anonymous / Free | 1 | Featured image only |
| Registered (no subscription) | 2 | Featured + 1 middle image |
| Active subscriber | 3 | Featured + 2 middle images |

---

## 14. Internationalization (i18n)

The app uses **i18next** with React bindings for multi-language support.

### Configuration

```typescript
// src/i18n/config.ts
i18n.init({
  lng: 'es',           // Default language: Spanish
  fallbackLng: 'es',   // Fallback: Spanish
  resources: { es, en, pt }
});
```

### Supported Languages

| Code | Language | Completeness |
|---|---|---|
| `es` | Spanish | Primary (100%) |
| `en` | English | Full translation |
| `pt` | Portuguese | Full translation |

### Translation Structure

Translations are organized by feature area:

```typescript
{
  hero: { title, description, button },
  nav: { pricing, library, search, my_stories, liked, edit_profile },
  story: { generating, error_limit_title, like, share, ... },
  footer: { write_story, contact, terms, privacy, rights },
  newsletter: { title, placeholder, button, success, error },
  auth: { welcome_back, sign_in_continue, registration_title },
  pages: { liked_stories, tagged_stories }
}
```

### Language Switcher

The `LanguageSwitcher` component in the navbar allows users to toggle between languages. It calls `i18n.changeLanguage()` to switch.

---

## 15. Content Moderation & Safety

### Banned Words Filter

The app includes a content moderation system to prevent inappropriate story prompts:

1. **`bannedWords.ts`** contains 50+ regex patterns covering inappropriate content in Spanish and English
2. **`contentFilter.ts`** exports `checkForBannedWords()` which tests user input against all patterns
3. **`usePromptValidation`** hook integrates the filter into the UI

```typescript
// How it works:
const bannedWord = checkForBannedWords(userPrompt);
if (bannedWord) {
  // Block submission, show warning toast
  toast({ title: "Inappropriate content detected", variant: "destructive" });
}
```

### Content Flagging

Users can report stories via `StoryFlagModal`, which inserts a record into `story_flags` for admin review.

### Captcha Protection

The contact form uses a **math-based captcha** (`CaptchaInput` component) - two random numbers the user must add together to prove they're human.

---

## 16. Email & Notification System

The app uses **two email providers** for different purposes:

### Brevo (Sendinblue)

Used for user-facing transactional emails:

| Function | When Triggered | Content |
|---|---|---|
| `send-email-story` | After story generation | HTML email with story link |
| `send-subscription-email` | After successful payment | Thank-you email with plan details |
| `send-feedback-notification` | After feedback submission | Admin notification |

### Resend

Used for admin-facing notifications and contact:

| Function | When Triggered | Content |
|---|---|---|
| `send-contact-email` | Contact form submission | User's message to admin |
| `send-feedback-email` | Feedback submission | Feedback details to admin |
| `send-newsletter-notification` | New newsletter signup | Subscriber info to admin |

---

## 17. WhatsApp Integration

The `whatsapp-webhook` edge function implements a WhatsApp Business API bot:

### How it Works

1. **Verification**: Meta sends a verification challenge on setup; the function responds with the `hub.challenge` token
2. **Security**: Incoming messages are verified via HMAC-SHA256 signature using the app secret
3. **Message handling**: When a user sends a message to the WhatsApp number:
   - The message is logged to `whatsapp_messages` table
   - The text is treated as a story prompt
   - `generateStory()` is called internally
   - The generated story is sent back via WhatsApp API
4. **Response**: The bot sends the story text as a WhatsApp message reply

---

## 18. SEO & Marketing

### SEO Component

The `SEO.tsx` component uses **React Helmet** to inject meta tags:

```typescript
<SEO
  title="Story Title | Cuenti.to"
  description="Story synopsis..."
  image="https://storage-url/story-image.jpg"
  url="https://cuenti.to/story/slug/id"
/>
```

This generates Open Graph (`og:*`) and Twitter Card meta tags for social sharing.

### Dynamic Sitemap

The `update-sitemap` edge function:
1. Fetches all published stories from the database
2. Generates XML sitemap with story URLs
3. Uploads to Supabase Storage as a public file
4. Triggered automatically via a PostgreSQL trigger on story inserts

### AdSense Integration

- `AdSenseScript.tsx` loads the Google AdSense script
- `AdSlot.tsx` renders ad placements within story pages
- `useNoAds` hook hides ads for paying subscribers
- `ads.txt` in `/public` for AdSense domain verification

### Newsletter

The `NewsletterRegistration` component on the landing page collects email addresses into the `newsletter_subscriptions` table and notifies the admin via email.

---

## 19. Admin Dashboard

Accessible only to admin users at `/dashboard`.

### Features

1. **Analytics Overview**
   - Total stories generated
   - Total registered users
   - Total likes across all stories
   - Total story credits consumed

2. **Charts** (using Recharts)
   - Story creation trends over time
   - User registration trends

3. **Top Countries**
   - User distribution by country (all time)
   - User distribution by country (last week)
   - Uses `get-top-countries` and `get-top-countries-last-week` edge functions

4. **User Management** (`AdminUsersTable`)
   - Searchable list of all users
   - Shows: email, name, stories count, credits
   - Click a user → `UserDetails` dialog with full profile and story list
   - CSV export of all users

### Admin Access Control

```typescript
// AdminRoute.tsx checks three things:
1. supabase.rpc('has_role', { _user_id: userId, _role: 'admin' })
2. Fallback: check if email === 'ADMIN_EMAIL_HERE'
3. Check app_metadata.is_super_admin === true
```

---

## 20. Data Flow Diagrams

### Story Generation (Complete)

```
[User] → StoryPromptForm
  │
  ├─ contentFilter.checkForBannedWords(prompt) → Block if inappropriate
  │
  ├─ StoryGenerator.handleGenerateStory(prompt)
  │   ├─ If authenticated: check profiles.story_credits > 0
  │   ├─ If anonymous: check anonymous story count < 1
  │   └─ If no credits: show SubscriptionTiersModal → EXIT
  │
  ├─ useStoryGeneration.generateStory(prompt)
  │   │
  │   ├─ supabase.functions.invoke('generate-story', { prompt })
  │   │   └─ [Edge Function] → Google Gemini API → structured JSON
  │   │
  │   ├─ parseStoryResponse() → extract title, content, synopsis, tags, image_prompts
  │   │
  │   ├─ Determine image count (1/2/3 based on subscription)
  │   │
  │   ├─ ImageGenerationService.generateImage(imagePrompt) × N
  │   │   └─ supabase.functions.invoke('generate-image', { prompt })
  │   │       └─ [Edge Function] → Google Gemini Image API → image URL
  │   │
  │   ├─ supabase.from('stories').insert({...}) → Save to database
  │   │
  │   ├─ sendStoryEmail(storyId, userId, email) → Email to user
  │   │
  │   └─ navigate(`/story/${slug}/${id}`) → Show the story
  │
  └─ [Story page renders with StoryContentWrapper]
```

### Authentication + Story Attribution

```
[Anonymous user] → Creates story with anonymous_user_id
       │
       ▼
  localStorage.setItem('pendingStoryAttribution', storyId)
       │
  [User clicks "Register"]
       │
       ▼
  OAuth flow → /auth/callback
       │
       ▼
  AuthCallback:
    1. supabase.from('stories').update({ user_id, anonymous_user_id: null })
    2. localStorage.removeItem('pendingStoryAttribution')
    3. Check profile → navigate to /profile or /
```

### Payment Processing

```
[User] → SubscriptionTiersModal → Select plan
       │
  ┌────┴────────────┐
  │                  │
  Stripe             MercadoPago
  │                  │
  create-stripe-     create-payment
  payment            │
  │                  │
  Redirect to        Redirect to
  checkout           checkout
  │                  │
  Payment            Payment
  completed          completed
  │                  │
  stripe-webhook     payment-webhook
  │                  │
  ├─ Verify          ├─ Verify
  ├─ add_story_      ├─ add_story_
  │  credits RPC     │  credits RPC
  ├─ processed_      ├─ processed_
  │  payments        │  payments
  └─ Send email      └─ Send email
       │                  │
       ▼                  ▼
  /payment/success → Toast "Credits added!"
```

---

## 21. Security - Row Level Security (RLS)

PostgreSQL RLS policies ensure data access is controlled at the database level, even if the API is misused.

### Key Policies

#### Stories Table

```sql
-- Anyone can read published stories
CREATE POLICY "Published stories are viewable by everyone"
  ON stories FOR SELECT
  USING (status = 'published');

-- Users can read their own stories (any status)
CREATE POLICY "Users can view their own stories"
  ON stories FOR SELECT
  USING (auth.uid() = user_id);

-- Anonymous users can view stories linked to their cookie session
CREATE POLICY "Anonymous users can view their stories"
  ON stories FOR SELECT
  USING (anonymous_user_id::text = current_setting('request.cookies')::json->>'anonymous-session-id');

-- Users can only insert stories they own
CREATE POLICY "Users can create stories"
  ON stories FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
```

#### Story Likes

```sql
-- Users can only like stories once (enforced by unique constraint)
-- Users can only delete their own likes
CREATE POLICY "Users can manage their own likes"
  ON story_likes FOR ALL
  USING (auth.uid() = user_id);
```

#### Profiles

```sql
-- Users can read any profile (for display names)
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

---

## 22. Key Design Decisions

### 1. No Traditional Backend Server

Instead of Express/NestJS/Django, the entire backend is built on **Supabase**:
- **PostgREST** auto-generates REST APIs from the database
- **Edge Functions** handle complex logic (AI, payments, emails)
- **RLS** provides authorization at the database level
- This eliminates server management, scaling concerns, and reduces code

### 2. Anonymous-First Experience

Users can generate a story **without registering**. This reduces friction:
- Cookie-based session tracking (`js-cookie`)
- Stories are re-attributed after registration
- Converts anonymous users to registered via a gentle RegistrationModal

### 3. Dual Payment Providers

**Stripe** (international) + **MercadoPago** (Latin America) maximizes payment conversion. The app targets Spanish-speaking markets (Argentina, etc.) where MercadoPago dominates.

### 4. AI-Generated Everything

Both **story text** and **illustrations** are AI-generated using Google Gemini:
- Story generation: structured JSON output with title, body, synopsis, tags, and image prompts
- Image generation: separate calls using the AI-generated image prompts
- Tiered image count incentivizes subscriptions

### 5. i18n with Spanish Primary

Despite supporting 3 languages, the app defaults to Spanish (`lng: 'es'`). All UI labels, toasts, and static text use i18next translations.

### 6. React Query for State Management

No Redux/Zustand. All server state is managed via **TanStack React Query**:
- 5-minute stale time for cached data
- Automatic background refetching
- Query invalidation after mutations (e.g., liking a story)
- Query keys used for granular cache control

### 7. WordPress Migration Support

The app includes dedicated edge functions (`import-wordpress-stories`, `import-wordpress-users`) indicating it was migrated from a WordPress site. The `wordpress_slug` and `wordpress_user_id` fields in the database maintain backwards compatibility for existing URLs.

### 8. Component Library: shadcn/ui

Instead of a heavy UI framework, the project uses **shadcn/ui** - a collection of copy-paste Radix UI components styled with Tailwind CSS. This gives full control over component styling while maintaining accessibility.

---

## Summary

Cuenti.to is a well-architected **serverless React application** that leverages Supabase as a complete backend platform. Its core value proposition is **AI-powered children's story generation** with illustrations, monetized through a credit-based subscription system. The architecture prioritizes developer experience (TypeScript end-to-end, auto-generated types), user experience (anonymous-first, multi-language), and business goals (dual payment providers, tiered features, AdSense).
