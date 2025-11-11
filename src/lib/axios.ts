import axios from "axios";
import { useAuthStore } from "@/store/auth";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://simrs.idxpert.id",
  headers: { "Content-Type": "application/json", "Accept": "application/json" },
  withCredentials: true,
});

 const publicApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://simrs.idxpert.id",
  headers: { Accept: "application/json" },
});

// attach token automatically
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
