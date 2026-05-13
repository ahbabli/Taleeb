import axios from "axios";

const host = window.location.hostname;
const protocol = window.location.protocol;

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || `${protocol}//${host}:8000/api`;

export const STORAGE_BASE_URL =
  import.meta.env.VITE_STORAGE_BASE_URL || `${protocol}//${host}:8000/storage`;

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers.Accept = "application/json";

  return config;
});

export default api;
