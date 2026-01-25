import API from "../api/axios";

export const createTrade = (data: any) => API.post("/api/trades", data);

export const getTrades = () => API.get("/api/trades");

export const deleteTrade = (id: string) => API.delete(`/api/trades/${id}`);
