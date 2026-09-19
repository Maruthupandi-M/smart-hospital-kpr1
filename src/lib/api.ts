// Hardcoded to guarantee Vercel deployment points to Render
export const API_BASE: string = import.meta.env.PROD 
    ? 'https://smart-hospital-kpr1.onrender.com' 
    : 'http://localhost:5000';
