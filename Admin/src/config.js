// Environment-aware configuration
export const getRouterBasename = () => {
  // In development (local), use "/" (matching vite.config.js base)
  // In production (deployment), use "/admin/" (for production server routing)
  const isDevelopment = import.meta.env.MODE === 'development';
  return isDevelopment ? '/' : '/admin/';
};

export const API_BASE_URL = import.meta.env.VITE_API_TARGET || 'http://localhost:7999';
