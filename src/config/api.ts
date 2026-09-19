// API Configuration for different environments
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:3001/api',
    wsURL: 'http://localhost:3001',
  },
  production: {
    baseURL: import.meta.env.VITE_API_URL || 'https://smtrack-backend.onrender.com/api',
    wsURL: import.meta.env.VITE_WS_URL || 'https://smtrack-backend.onrender.com',
  },
} as const;

const getEnv = () => {
  return import.meta.env.MODE || 'development';
};

export const apiConfig = API_CONFIG[getEnv() as keyof typeof API_CONFIG];

export const getApiUrl = (endpoint: string) => {
  return `${apiConfig.baseURL}${endpoint}`;
};

export const getWsUrl = () => {
  return apiConfig.wsURL;
};
