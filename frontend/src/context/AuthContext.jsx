import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import client from "../api/client";
import {
  startSessionTimer,
  stopSessionTimer,
} from "../auth/sessionManager";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("haigana_user");

    return stored ? JSON.parse(stored) : null;
  });

  // DÉCONNEXION AUTOMATIQUE

  useEffect(() => {
    const token = localStorage.getItem("haigana_token");

    if (token) {
      startSessionTimer(() => {
        localStorage.removeItem("haigana_token");
        localStorage.removeItem("haigana_user");
        setUser(null);

        window.location.href = "/login?session=expired";
      });
    }

    return () => {
      stopSessionTimer();
    };
  }, []);

  // LOGIN
  
  async function login(immatricule, motPasse) {
    const { data } = await client.post("/auth/login", {
      immatricule,
      motPasse,
    });

    localStorage.setItem("haigana_token", data.token);

    const userData = {
      immatricule: data.immatricule,
      nom: data.nom,
      prenom: data.prenom,
      role: data.role,
    };

    localStorage.setItem(
      "haigana_user",
      JSON.stringify(userData)
    );

    setUser(userData);

    // Démarre le timer avec le nouveau JWT

    startSessionTimer(() => {
      localStorage.removeItem("haigana_token");
      localStorage.removeItem("haigana_user");
      setUser(null);

      window.location.href = "/login?session=expired";
    });

    return userData;
  }

  // LOGOUT MANUEL

  function logout() {
    stopSessionTimer();

    localStorage.removeItem("haigana_token");
    localStorage.removeItem("haigana_user");

    setUser(null);
  }

  // MISE À JOUR DE SESSION

  function updateSession({
    token,
    immatricule,
    nom,
    prenom,
    role,
  }) {
    localStorage.setItem("haigana_token", token);

    const userData = {
      immatricule,
      nom,
      prenom,
      role,
    };

    localStorage.setItem(
      "haigana_user",
      JSON.stringify(userData)
    );

    setUser(userData);

    // Redémarre le timer avec le nouveau token
    startSessionTimer(() => {
      localStorage.removeItem("haigana_token");
      localStorage.removeItem("haigana_user");
      setUser(null);

      window.location.href = "/login?session=expired";
    });
  }

  // VÉRIFICATION DU ROLE
  function hasRole(...roles) {
    return user && roles.includes(user.role);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateSession,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}