import { createContext, useContext, useEffect, useState } from "react";
import { getMyProfile } from "../api/profileApi";

const ProfileContext = createContext(null);

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const data = await getMyProfile();
      setProfile(data);
    } catch (error) {
      // Profile not created yet → allowed
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        setProfile,
        loading,
        reloadProfile: loadProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within ProfileProvider");
  }
  return context;
};
