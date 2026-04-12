# Cuenti.to

**Generador de cuentos con inteligencia artificial.** Los usuarios escriben un prompt, la IA genera un cuento completo con ilustraciones. Más de 135,000 historias creadas.

**URL:** https://cuenti.to  
**Dominio legacy:** v1.cuenti.to (redirige automáticamente a cuenti.to)

---

## Stack técnico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui |
| Backend | Supabase (Postgres, Auth, Edge Functions, Storage) |
| Hosting | Cloudflare Pages (con SSR via Pages Functions) |
| AI (texto) | Google Gemini (via Supabase Edge Function) |
| AI (imágenes) | Gemini Free Tier (fallback: Azure DALL-E) |
| AI (audio) | TTS via Supabase Edge Function |
| Monetización | Google AdSense |
| Analytics | GA4 + PostHog + Cloudflare Analytics |
| Email | Dittofeed + Azure Communication Services (ACS) |
| i18n | i18next (es, en, pt, fr, de, it) |

## Estructura del proyecto

```
├── src/
│   ├── components/          # Componentes React
│   │   ├── ui/              # shadcn/ui components (no tocar)
│   │   ├── auth/            # Auth guards (ProtectedRoute, AdminRoute)
│   │   ├── nav/             # Navegación
│   │   ├── admin/           # Panel admin
│   │   ├── print/           # Libro impreso
│   │   ├── profile/         # Perfil de usuario
│   │   ├── newsletter/      # Captura de email
│   │   ├── feedback/        # Formulario de feedback
│   │   ├── subscription/    # Tiers de suscripción
│   │   ├── routing/         # AppRoutes.tsx
│   │   ├── Ad*.tsx          # Componentes de AdSense
│   │   ├── Story*.tsx       # Todo lo relacionado a cuentos
│   │   └── ...
│   ├── hooks/               # Custom hooks
│   ├── pages/               # Páginas (rutas)
│   ├── services/            # ImageGenerationService, RunwareService
│   ├── integrations/supabase/ # Cliente y tipos auto-generados
│   ├── types/               # TypeScript types
│   ├── utils/               # Utilidades (slugs, content filter, pricing)
│   ├── i18n/                # Traducciones (es, en, pt, fr, de, it)
│   ├── lib/                 # analytics.ts, utils.ts
│   └── styles/              # CSS adicional
├── functions/               # Cloudflare Pages Functions (SSR)
│   ├── _middleware.ts        # SSR router principal
│   ├── _ssr.ts              # Rendering de páginas para SEO
│   ├── api/                 # API endpoints
│   ├── sitemap*.ts          # Generadores de sitemaps dinámicos
│   └── sitemap-static.xml.ts
├── supabase/
│   ├── config.toml          # Configuración del proyecto
│   ├── functions/           # Edge Functions (Deno)
│   └── migrations/          # SQL migrations
├── public/                  # Assets estáticos
└── dist/                    # Build output (no commitear)
```

## Rutas

| Ruta | Página | SSR |
|------|--------|-----|
| `/` | Homepage/Landing | ✅ |
| `/story/new` | Generador de cuentos | ❌ |
| `/story/:title/:id` | Lectura de cuento | ✅ |
| `/:lang/story/:title/:id` | Cuento traducido (en/pt/fr/de/it) | ✅ |
| `/library` | Biblioteca pública | ❌ |
| `/tagged/:tag` | Cuentos por tag | ✅ |
| `/search` | Búsqueda | ❌ |
| `/liked` | Cuentos likeados | ❌ |
| `/autor/:userId` | Perfil de autor | ❌ |
| `/imprimir` | Landing libro impreso | ✅ |
| `/estamos-imprimiendo-tu-cuentito` | Post-pago (noindex) | ✅ |
| `/login` | Login/Register | ❌ |
| `/profile` | Perfil (auth required) | ❌ |
| `/dashboard` | Admin panel (admin only) | ❌ |
| `/contact` | Contacto | ❌ |
| `/terminos`, `/terms-of-service`, `/privacy-policy` | Legal | ❌ |

### Resolución de URLs legacy

El middleware (`functions/_middleware.ts`) maneja WordPress slugs legacy:
- `cuenti.to/el-lapiz-magico` → busca en `wordpress_slug` → 301 a `/story/el-lapiz-magico/{uuid}`
- `v1.cuenti.to/cualquier-cosa` → 301 a `cuenti.to/...`

## Base de datos (Supabase)

### Tablas principales

| Tabla | Descripción |
|-------|------------|
| `stories` | Cuentos generados (135k+). Campos: id, title, body, prompt, synopsis, tags, image_url, final_image_url, wordpress_slug, cuentito_uid, author_name, created_at |
| `profiles` | Perfiles de usuario (nombre, avatar, rol docente, géneros preferidos) |
| `anonymous_users` | Sesiones anónimas con contador de historias |
| `story_likes` | Likes de usuarios a cuentos |
| `story_audio` | Audio TTS generado para cuentos |
| `story_flags` | Reportes de contenido inapropiado |
| `feedback` | Feedback con ratings (cuento + ilustración) |
| `newsletter_subscriptions` | Suscripciones al newsletter (email + captcha) |
| `subscription_plans` | Planes de suscripción |
| `user_subscriptions` | Suscripciones activas de usuarios |
| `user_roles` | Roles (admin) |
| `processed_payments` | Pagos procesados |
| `image_generation_logs` | Log de generaciones de imágenes |
| `whatsapp_messages` | Mensajes de WhatsApp (webhook) |

### Storage buckets

- `cuentito` → imágenes de cuentos, logos, assets
  - Path: `images/{uuid}.png` (generadas) o `images/{cuentito_uid}-0.jpg` (WordPress legacy)

### Edge Functions (Supabase)

| Función | Descripción |
|---------|------------|
| `generate-story` | Genera cuento con Gemini. Input: prompt + opciones (género, personaje, etc.) |
| `generate-image` | Genera ilustración con Gemini (free tier) o Azure DALL-E (fallback). Soporta usuarios anónimos |
| `generate-speech` | TTS para cuentos |
| `fetch-stories` | Obtiene historias con paginación |
| `get-story` | Obtiene un cuento por ID |
| `get-library-stories` | Historias para la biblioteca pública |
| `get-top-stories` | Top cuentos |
| `get-top-countries` / `get-top-countries-last-week` | Métricas geográficas |
| `get-user-stories` | Cuentos de un usuario |
| `get-user-credits` | Créditos disponibles del usuario |
| `get-user-info` / `get-all-users` | Info de usuarios (admin) |
| `check-is-admin` | Verifica rol admin |
| `create-payment` / `create-stripe-payment` | Creación de pagos |
| `payment-webhook` / `stripe-webhook` | Webhooks de pago |
| `translate-story` | Traduce cuentos a otros idiomas |
| `send-email-story` | Envía cuento por email |
| `send-contact-email` | Email de contacto |
| `send-feedback-email` / `send-feedback-notification` | Notificaciones de feedback |
| `send-newsletter-notification` | Notificación de nueva suscripción |
| `send-story-notification` | Notificación de nuevo cuento |
| `send-subscription-email` | Email de suscripción |
| `batch-import-stories` / `import-wordpress-stories` / `import-wordpress-users` | Importación de datos legacy |
| `update-sitemap` | Actualización de sitemap |
| `whatsapp-webhook` | Webhook de WhatsApp |

## SSR (Server-Side Rendering)

El SSR se implementa en Cloudflare Pages Functions, NO es un framework SSR. Es un middleware que:

1. Intercepta requests en `_middleware.ts`
2. Para rutas de cuentos, fetch el contenido desde Supabase REST API
3. Inyecta HTML renderizado + meta tags + JSON-LD en el shell del SPA (`index.html`)
4. El SPA hidrata normalmente en el cliente

### Qué se renderiza server-side:
- Meta tags (og:title, og:description, og:image, twitter:card)
- Schema.org JSON-LD (Article, BreadcrumbList, WebApplication, Product)
- Hreflang tags (para 6 idiomas)
- Preview del contenido (primeros ~800 chars)
- Canonical URLs

### Sitemaps dinámicos

Los sitemaps se generan dinámicamente desde Supabase:
- `sitemap_index.xml` → índice de todos los sitemaps
- `sitemap-stories-[page].xml` → ~50K URLs por página
- `sitemap-translations-[lang]-[page].xml` → URLs de traducciones
- `sitemap-static.xml` → páginas estáticas

**Total:** ~205K+ URLs indexables.

## Monetización (AdSense)

**Publisher ID:** `YOUR_ADSENSE_PUB_ID`

### Ad Units

| Nombre | Slot ID | Tipo | Ubicación |
|--------|---------|------|-----------|
| story-in-article | `8883654037` | In-article | Dentro del cuento (25%, 50%, 75%) |
| story-display-responsive | `7570572368` | Display responsive | Library, TaggedStories, default |
| story-end-multiplex | `3112452609` | Multiplex | Final del cuento |
| loading-page-story-generation | `3179149216` | Display | Pantalla de carga mientras genera |

### Componentes de ads

| Componente | Descripción |
|-----------|------------|
| `AdSenseScript.tsx` | Carga el script de AdSense globalmente |
| `AdSlot.tsx` | Ad genérico con lazy loading (IntersectionObserver, 200px rootMargin) |
| `MultiplexAd.tsx` | Grid de ads al final del cuento |
| `AnchorAd.tsx` | Ad tipo anchor/banner |
| `LoadingAd.tsx` | Ad durante la generación del cuento |

### Lógica de ocultamiento de ads

- **Usuarios pagos:** `useIsPayingUser()` hook → no muestra ads
- **`?noads` query param:** `useNoAds()` hook → oculta ads (tool interno, no documentar públicamente)
- **Auto-ads:** Habilitados en Google AdSense (3/3 formatos in-page, 3/3 superpuestos)

### In-story ad placement

En `StoryContentBody.tsx`, los ads se insertan en posiciones ~25%, ~50%, ~75% del contenido, entre párrafos. Solo se insertan si hay suficientes párrafos.

## Autenticación

- **Provider:** Supabase Auth (email/password + OAuth)
- **Admin check:** Tabla `user_roles` con `role = 'admin'`
- **Admin route guard:** `AdminRoute.tsx` — importante: siempre chequear `if (authLoading) return null` antes de verificar `user` (bug fix documentado)
- **Usuarios anónimos:** Pueden generar cuentos sin registro. Se trackean en `anonymous_users` con `session_id`

## Internacionalización (i18n)

- Framework: i18next + react-i18next + browser language detector
- Idiomas: es (default), en, pt, fr, de, it
- Archivos: `src/i18n/translations/{lang}.ts`
- Las traducciones de cuentos se almacenan en tabla `story_translations`
- URLs: `/{lang}/story/{slug}/{id}` (ej: `/en/story/the-magic-pencil/{uuid}`)

## Libro impreso (Print Book)

Feature para convertir cuentos en libros físicos:
- **Landing:** `/imprimir`
- **Specs:** 15×20cm, 16 páginas, softcover, full color, 6 ilustraciones AI
- **Ilustraciones:** Generadas con Gemini free tier via Edge Function `generate-image`
- **Pago:** Mercado Pago (link directo)
- **Return URL:** `/estamos-imprimiendo-tu-cuentito`
- **PDF:** Generado con Puppeteer (scripts en servidor, no en el frontend)
- **Componentes:** `PrintBook.tsx`, `PrintingStatus.tsx`, `PrintBookBanner.tsx`, `PrintStoryButton.tsx`, `BookPreview.tsx`, `PrintableStoryPDF.tsx`
- **Tracking:** GA4 events con prefijo `print_book_` (ver `lib/analytics.ts`)

## Analytics

### GA4
- **Property ID:** 522445132
- **Measurement ID:** `G-WSLWF5HLCK`
- **Tracking:** Via GTM dataLayer (ver `lib/analytics.ts`)
- **Eventos custom:** `print_book_*` para el libro impreso

### PostHog
- **Project:** 302935
- **Features:** Session recording, autocapture, heatmaps, web vitals

### Cloudflare Analytics
- Server-side, automático. Nota: ~95% del tráfico que reporta son crawlers indexando sitemaps.

## Email marketing

### Dittofeed
- **URL dashboard:** https://email.cuenti.to
- **VM:** Azure VM (email.cuenti.to)
- **Stack:** Postgres + ClickHouse + Temporal + Dittofeed Lite (Docker)
- **Estado:** El compute engine tiene bugs severos (ClickHouse→Postgres sync no funciona). Los broadcasts V2 no funcionan.
- **Workaround actual:** Exportar emails de ClickHouse y enviar directamente via ACS REST API con scripts Python throttleados.

### Azure Communication Services (ACS)
- **Recurso:** `cuentito-comms` (Azure)
- **Dominio verificado:** cuenti.to (DKIM + SPF ✅)
- **From:** `donotreply@cuenti.to`
- **Rate limits default:** 30 emails/min, 100 emails/hora
- **Importante:** Cuenti.to usa EXCLUSIVAMENTE ACS para email. NO usar Resend ni otro provider.

### Segmentos de usuarios
- **Profesores total:** ~9,922
- **Profesores Argentina:** ~796
- **Profesores LATAM (sin Argentina):** ~9,126
- Los datos están en ClickHouse (Dittofeed). La tabla principal es `computed_property_assignments_v2`.

## SEO

### Estado de indexación
- **Total stories:** 135,939
- **Páginas con impresiones en Google:** ~14,276 (~10.5% indexado)
- **Oportunidad:** 90% de stories aún no indexadas

### Schema markup
- `Article` + `BreadcrumbList` en páginas de cuentos
- `WebApplication` en homepage
- `Product` en landing de libro impreso

### Sitemaps
- Generados dinámicamente desde Supabase
- ~205K URLs totales
- `sitemap_index.xml` → entry point

### Hreflang
- Todas las páginas de cuentos tienen hreflang para 6 idiomas + x-default

### Redirects
- WordPress slugs legacy → 301 a URLs canónicas
- v1.cuenti.to → 301 a cuenti.to

## Content filtering

- `utils/bannedWords.ts` — Lista de palabras prohibidas
- `utils/contentFilter.ts` — Filtro de contenido aplicado a prompts
- `hooks/usePromptValidation.ts` — Validación client-side
- Edge Function `generate-story` también valida server-side

## Deploy

**Manual. No hay CI/CD.**

```bash
cd ~/clawd/cuentito-adsense-fix
npm run build
npx wrangler pages deploy dist --project-name cuentito
```

### Proyecto Cloudflare Pages
- **Nombre:** `cuentito`
- **URL:** cuenti.to (custom domain)
- **Compatibility date:** 2024-09-23

### Notas de deploy
- El build genera un SPA en `dist/`
- Cloudflare Pages Functions (`functions/`) se despliegan automáticamente con el deploy
- Las Supabase Edge Functions se despliegan por separado via Supabase CLI o dashboard (proyecto manejado por Lovable)
- **⚠️ El proyecto Supabase es propiedad de Lovable.** No se puede acceder al dashboard directamente. Los cambios a Edge Functions se hacen via código.

## Desarrollo local

```bash
npm install
npm run dev        # Inicia Vite dev server en :8080
npm run build      # Build de producción
npm run preview    # Preview del build
```

### Variables de entorno
No hay `.env` — las credenciales de Supabase están hardcodeadas en `src/integrations/supabase/client.ts` (anon key, no es secret). Esto es intencional y estándar en Supabase.

## Proyecto originado en Lovable

Este proyecto fue creado con [Lovable](https://lovable.dev) (antes GPT Engineer). Algunas implicaciones:
- El proyecto Supabase (`YOUR_SUPABASE_PROJECT_ID`) está vinculado a una cuenta Lovable
- Los tipos de Supabase (`integrations/supabase/types.ts`) son auto-generados
- Hay un `lovable-tagger` en devDependencies (plugin de Vite para development)
- El vite config incluye `componentTagger()` en modo development

## Errores conocidos y lecciones

1. **Image generation para anónimos:** El SDK de Supabase envía el anon key automáticamente. NO agregar headers `Authorization` custom — rompe el auth.

2. **Admin route race condition:** Siempre chequear `authLoading` antes de `user` en guards de autenticación.

3. **SPA routing en Cloudflare Pages:** El middleware maneja el fallback a `index.html` para todas las rutas no-estáticas.

4. **AdSense slots vacíos:** Cada `<ins>` de AdSense DEBE tener un `data-ad-slot` con ID real. Slots vacíos = ads que no pagan.

5. **Welcome email duplicado:** Hay un guard con tabla `sent_emails` + `ON CONFLICT DO NOTHING` para prevenir duplicados.

6. **Cloudflare Analytics ≠ tráfico real:** La mayoría del tráfico reportado por CF son bots de SEO.

7. **Dittofeed compute engine:** No confiar en que sincronice ClickHouse→Postgres. Exportar datos de ClickHouse directamente si se necesitan.

## Métricas clave (Feb 2026)

- **Stories:** 135,939
- **Revenue AdSense:** ~$120 USD/mes (baseline), objetivo $360/mes
- **GSC (28d):** 5.9K clicks, 140K impressions, CTR 4.2%, posición promedio 8.5
- **Top queries:** "cuenti.to", "el lápiz mágico de sofía", "cuento de la princesa sofia"
- **Usuarios newsletter:** ~9,922 (mayoritariamente docentes)
- **Idioma principal:** Español
- **Países top:** Argentina, México, Colombia, España

---

*Última actualización: Febrero 2026*
