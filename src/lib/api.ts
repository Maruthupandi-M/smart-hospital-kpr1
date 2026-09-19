// Central API base URL configuration
// Development (.env.local): VITE_API_URL=http://localhost:5000
// Production (Vercel env vars): VITE_API_URL=https://smart-hospital-backend.onrender.com
export const API_BASE: string = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';
