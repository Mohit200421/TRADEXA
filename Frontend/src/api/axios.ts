import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://tradexa-backend.onrender.com/api", // ✅ MUST include /api
  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================
   AUTH INTERCEPTOR
========================= */
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;
