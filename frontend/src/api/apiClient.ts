import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL,
});

// Automatically add the auth token to every request if available
apiClient.interceptors.request.use((config) => {
  const authStorage = localStorage.getItem('joyida-auth');
  if (authStorage) {
    try {
      const { state } = JSON.parse(authStorage);
      if (state.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    } catch (e) {
      console.error('Error parsing auth storage', e);
    }
  }
  return config;
});

export default apiClient;
