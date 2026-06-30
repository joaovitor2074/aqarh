import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { clearSession, getStoredToken, isTokenUsable } from "../utils/auth";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = getStoredToken();
  const authenticated = isTokenUsable(token);

  useEffect(() => {
    if (!authenticated && token) {
      clearSession();
    }
  }, [authenticated, token]);

  if (!authenticated) {
    return (
      <Navigate
        to={token ? "/login?session=expired" : "/login"}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
}
