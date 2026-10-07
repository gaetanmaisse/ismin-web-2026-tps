/// <reference types="vite/client" />

/** Given. The variables of `.env` that the browser can read: only those that start with VITE_. */
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}
