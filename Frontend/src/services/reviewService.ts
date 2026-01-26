import API from "../api/axios";

export const saveReview = (data: any) => API.post("/api/reviews", data);

export const getReviews = (type?: string) =>
  API.get("/api/reviews", { params: { type } });

export const getReviewDates = (type?: string) =>
  API.get("/api/reviews/dates", { params: { type } });
