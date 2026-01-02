// Utility to get backend API base URL
export const API_BASE_URL = 'https://schedule-backend-1.onrender.com/api';

export function apiUrl(path) {
  if (API_BASE_URL.endsWith('/') && path.startsWith('/')) {
    return API_BASE_URL + path.slice(1);
  }
  if (!API_BASE_URL.endsWith('/') && !path.startsWith('/')) {
    return API_BASE_URL + '/' + path;
  }
  return API_BASE_URL + path;
}
