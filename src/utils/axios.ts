import axios from 'axios';
// config
import { HOST_API_KEY } from 'config';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: HOST_API_KEY });

// Automatically attach x-admin-password to every request if stored in session
axiosInstance.interceptors.request.use((config) => {
    const adminPassword = sessionStorage.getItem('adminPanelPassword');
    if (adminPassword) {
        config.headers['x-admin-password'] = adminPassword;
    }
    return config;
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;

export const ASSETS = (name: string) => (name ? `${HOST_API_KEY}/${name}` : '');
