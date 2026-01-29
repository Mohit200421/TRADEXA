import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000", // ✅ FIXED (no /api)
  withCredentials: true,            // ✅ required for auth cookies
});

export default API;
