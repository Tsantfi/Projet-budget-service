import axios from "axios";

// 1. Récupère dynamiquement l'URL Render en production, ou gère le proxy local
const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

const client = axios.create({
  baseURL: API_URL,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("haigana_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("haigana_token");
      localStorage.removeItem("haigana_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default client;
