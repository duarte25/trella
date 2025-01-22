"use client";

import { getCookie } from "@/actions/handleCookie";
import { Usuario } from "@/api/models/Usuario";
import { fetchApi } from "@/api/services/fetchApi";
import React, { createContext, useEffect, useState } from "react";

type Props = {
  // user: Usuario | null;
  // token: string | undefined;
  // isAuthenticated: boolean;
  children: React.ReactNode;
};

type ContextType = {
  user: Usuario | null;
  token: string | undefined;
  isAuthenticated: boolean;
  setToken: React.Dispatch<React.SetStateAction<string | undefined>>;
  setUser: React.Dispatch<React.SetStateAction<Usuario | null>>;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  clearStates: () => void;
};

export const AuthContext = createContext<ContextType | null>(null);

export function AuthProvider({ children }: Props) {
  const [tokenState, setTokenState] = useState<string | undefined>(undefined);
  const [userState, setUserState] = useState<Usuario | null>({} as Usuario);
  const [isAuthenticatedState, setIsAuthenticated] = useState<boolean>(false);

  async function clearStates(): Promise<void> {
    setIsAuthenticated(false);
    setTokenState(undefined);
    setUserState(null);
  }

  async function getUser() {
    if (tokenState) {
      const response = await fetchApi<null, Usuario>({ route: "/session", method: "GET", token: tokenState });

      if (response.error) {
        console.log("Erro ao tentar buscar os dados do usuário logado!");
      } else {
        setUserState(response.data);
        setIsAuthenticated(true);
      }
    }
  }

  async function getToken() {
    const token = await getCookie("accessToken");
    console.log("Rodou", token?.value);

    setTokenState(token?.value);
  }

  useEffect(() => {
    getUser();
  }, [tokenState]);

  useEffect(() => {
    getToken();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token: tokenState,
        user: userState,
        isAuthenticated: isAuthenticatedState,
        setToken: setTokenState,
        setUser: setUserState,
        setIsAuthenticated: setIsAuthenticated,
        clearStates: clearStates,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
