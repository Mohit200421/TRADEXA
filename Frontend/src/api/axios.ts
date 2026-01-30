import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:5000"
      : import.meta.env.VITE_API_URL,
  withCredentials: true, // 🔐 cookies (auth)
});

export default API;
