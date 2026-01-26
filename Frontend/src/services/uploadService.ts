import API from "../api/axios";

export const uploadImage = (file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  return API.post("/api/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
