import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import { store } from '@/redux/store';
import { logoutUser } from '@/redux/authSlice';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!BASE_URL) {
  console.warn('[axios] NEXT_PUBLIC_API_BASE_URL is not defined. Check your .env.local file.');
}

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// ─── Request Interceptor ────────────────────────────────────────────────────
// Attaches the Bearer access token to every outgoing request.
axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ───────────────────────────────────────────────────
// On 401: attempt a silent token refresh. If successful, retry the original
// request. If the refresh also fails, clear credentials and redirect to login.

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: unknown) => void }> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = Cookies.get('refresh_token');

      // No refresh token — force logout immediately
      if (!refreshToken) {
        store.dispatch(logoutUser());
        if (typeof window !== 'undefined') window.location.href = '/';
        return Promise.reject(error);
      }

      // If a refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt silent token refresh
        const formData = new FormData();
        formData.append('refresh_token', refreshToken);
        const { data } = await axios.post('/auth/refresh', formData, { baseURL: BASE_URL });

        const newAccessToken: string = data.access_token || data.data?.access_token;
        const newRefreshToken: string = data.refresh_token || data.data?.refresh_token;

        if (!newAccessToken) {
          throw new Error('Refresh token yielded no access token');
        }

        Cookies.set('access_token', newAccessToken, { expires: 1 });
        if (newRefreshToken) {
          Cookies.set('refresh_token', newRefreshToken, { expires: 30 });
        }

        axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed — clear all credentials and redirect to login
        processQueue(refreshError as AxiosError, null);
        store.dispatch(logoutUser());
        if (typeof window !== 'undefined') window.location.href = '/';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

     return Promise.reject(error);
  }
);

export default axiosInstance;
