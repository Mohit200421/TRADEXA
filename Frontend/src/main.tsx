import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import "./styles/datepicker.css";

import { AuthProvider } from "./contexts/AuthContext";
import { ProfileProvider } from "./contexts/ProfileContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <ProfileProvider>
        <App />
      </ProfileProvider>
    </AuthProvider>
  </StrictMode>
);
