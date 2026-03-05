import axios from 'axios';

// 1. Create a custom Axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

// 2. REQUEST INTERCEPTOR: Automatically attach the token to every outgoing request
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

// 3. RESPONSE INTERCEPTOR: Catch 401 errors and attempt to refresh the token
api.interceptors.response.use(
    (response) => response, // If the response is successful, just return it normally
    async (error) => {
        const originalRequest = error.config;

        // If the error is 401 Unauthorized, and we haven't already tried to refresh the token...
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Mark this request so we don't get stuck in an infinite loop

            const refreshToken = localStorage.getItem('refresh_token');

            if (refreshToken) {
                try {
                    // Ask Django for a new access token using the refresh token
                    // Note: We use standard 'axios' here, NOT our 'api' instance, to avoid interceptor loops
                    const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
                        refresh: refreshToken,
                    });

                    // Save the shiny new access token!
                    localStorage.setItem('access_token', response.data.access);

                    // Update the failed request with the new token and retry it
                    originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                    return api(originalRequest);

                } catch (refreshError) {
                    // If the refresh token is ALSO expired, there is nothing we can do.
                    // Wipe the storage and force the user to log in again.
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }
        }

        // If it's not a 401, or there's no refresh token, just return the error
        return Promise.reject(error);
    }
);

export default api;