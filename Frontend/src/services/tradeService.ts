import API from "../api/axios";

export const createTrade = (data: any) => API.post("/api/trades", data);

export const getTrades = () => API.get("/api/trades");

export const deleteTrade = (id: string) => API.delete(`/api/trades/${id}`);

export const getTradeById = (id: string) => API.get(`/api/trades/${id}`);

export const getAnalyticsSummary = () => API.get("/api/trades/analytics/summary");

export const getEquityCurve = () => API.get("/api/trades/analytics/equity-curve");

export const getMonthlyAnalytics = () => API.get("/api/trades/analytics/monthly");


export const getAdvancedAnalytics = () => API.get("/api/trades/analytics/advanced");
