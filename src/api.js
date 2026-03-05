import axios from 'axios';

/**
 * Axios instance configured with base URL and interceptors for authentication.
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

/**
 * Request interceptor to attach the JWT access token to every outgoing request.
 */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * Response interceptor to handle token expiration.
 * If a 401 error is received, it attempts to refresh the access token using the refresh token.
 */
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refresh_token');

            if (refreshToken) {
                try {
                    const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
                        refresh: refreshToken,
                    });

                    localStorage.setItem('access_token', response.data.access);

                    originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                    return api(originalRequest);

                } catch (refreshError) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;