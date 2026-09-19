// Central API base URL
// - In development: 'http://localhost:5000' (local Flask server)
// - In production (Vercel): '' empty string so /api/* uses same-domain routing
export const API_BASE: string = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';
