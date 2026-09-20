// API Configuration reading from environment variables
// (.env.local for development, .env.production for production)
const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001/api' : '');
const wsUrl = import.meta.env.VITE_WS_URL || apiUrl.replace(/\/api\/?$/, '');

export const apiConfig = {
  baseURL: apiUrl,
  wsURL: wsUrl,
};

export const getApiUrl = (endpoint: string) => {
  return `${apiConfig.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

export const getWsUrl = () => {
  return apiConfig.wsURL;
};
