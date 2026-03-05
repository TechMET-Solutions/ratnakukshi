import axios from 'axios';

const api = axios.create({
    baseURL: 'https://karyakarta.ratnakukshi.org//api', // Replace with your backend URL
    withCredentials: true, // Required for sending/receiving cookies
});

// Add a request interceptor to include the token in the header
api.interceptors.request.use(
    (config) => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                const token = userData?.token;
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
        } catch (error) {
            console.error("Error in axios interceptor:", error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle unauthorized/forbidden errors (session expired)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            // 401: Unauthorized (token invalid/expired)
            // 403: Forbidden (token missing/invalid)
            if (error.response.status === 401 || error.response.status === 403) {
                // Only redirect if we are not already on the login page
                if (!window.location.pathname.includes('/login')) {
                    localStorage.removeItem('user');
                    // We use window.location.replace to prevent back button loops
                    window.location.replace('/login?expired=true');
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
