import API from "./axios"; // your existing axios instance

// Get logged-in user's profile
export const getMyProfile = async () => {
  const { data } = await API.get("/profile/me");
  return data;
};

// Create profile (one-time)
export const createProfile = async (profileData) => {
  const { data } = await API.post("/profile", profileData);
  return data;
};

// Update profile
export const updateProfile = async (profileData) => {
  const { data } = await API.put("/profile", profileData);
  return data;
};

// Upload avatar
export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);

  const { data } = await API.put("/profile/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};
