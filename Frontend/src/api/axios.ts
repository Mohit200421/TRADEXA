import axios from "axios";

const token = localStorage.getItem("token");

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://tradefx-8njj.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }), // ✅ KEY FIX
  },
});

/* =========================
   REQUEST INTERCEPTOR
========================= */
API.interceptors.request.use(
  (config) => {
    const freshToken = localStorage.getItem("token");
    if (freshToken) {
      config.headers.Authorization = `Bearer ${freshToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
