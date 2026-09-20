import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = sessionStorage.getItem("token");
    const storedUser = sessionStorage.getItem("user");
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, tokenValue) => {
    sessionStorage.setItem("token", tokenValue);
    sessionStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setToken(tokenValue);
  };

  // Merges profile changes (name/email/phone) into the stored session user
  // after a successful self-service profile update.
  const updateUser = (partialUser) => {
    setUser((prev) => {
      const next = { ...prev, ...partialUser };
      sessionStorage.setItem("user", JSON.stringify(next));
      return next;
    });
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
