import API from "../api/axios";

export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  const res = await API.post("/api/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data.imageUrl; // ✅ direct URL
};
