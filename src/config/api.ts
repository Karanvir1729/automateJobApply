// API configuration for different environments
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://your-railway-app.railway.app' // You'll replace this with your Railway URL
  : 'http://localhost:3001';

export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};