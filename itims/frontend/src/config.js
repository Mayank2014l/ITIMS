export const isDemoMode =
  import.meta.env.VITE_DEMO_MODE === 'true' ||
  (typeof window !== 'undefined' && (
    window.location.hostname.endsWith('netlify.app') ||
    !import.meta.env.VITE_API_URL ||
    (import.meta.env.VITE_API_URL.includes('localhost') && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')
  ));
