/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_ADMIN_EMAIL: string;
  readonly VITE_ADSENSE_CLIENT_ID?: string;
  readonly VITE_GTM_ID?: string;
  readonly VITE_FB_APP_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
