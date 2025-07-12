import axios from "axios";
import { API_BASE_URL } from "./constants";
import { setLoading } from "./loading";
import { showToastError } from "../custom_component/toast";

const Http = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-type': 'application/json',
        'Accept': 'application/json',
    }
})
let requestCount = 0;
Http.interceptors.request.use(async (config) => {

    requestCount++;
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config;
}, (err) => Promise.reject(err));

Http.interceptors.response.use((response): any => {
    requestCount--;
    
    if (requestCount === 0) setLoading(false);
    
    return response;
}, (error) => {
    requestCount--;
    if (requestCount === 0) setLoading(false);
    console.error('AXIOS ERROR:', error);
    
    if (error.response?.status >= 500 || !error.response) {
        showToastError(error.message || 'Network error occurred');
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.pathname = '/login';
    }
    return Promise.reject(error.response?.data || error);
});

export default Http;