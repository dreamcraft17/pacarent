/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Origin API produksi, tanpa trailing slash. Kosong = path relatif /api (proxy dev atau rewrite). */
  readonly VITE_API_BASE?: string;
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
