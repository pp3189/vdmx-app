/// <reference types="vite/client" />
// API URL configuration - defaults to localhost in development if not set
export const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.PROD
    ? 'https://vdmx-app-production.up.railway.app'
    : 'http://localhost:3001'
);
