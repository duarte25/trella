"use client";

import { getCookie } from "@/actions/handleCookie";
import { Usuario } from "@/api/models/Usuario";
import React, { createContext, useEffect, useState } from "react";

// Função para verificar se o token expirou
const isTokenExpired = (token: string) => {
  try {
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000; // Tempo atual em segundos
    return decodedToken.exp < currentTime;
  } catch (error) {
    return true; // Se falhar na decodificação, consideramos o token expirado
  }
};

type Props = {
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
  const [userState, setUserState] = useState<Usuario | null>(null);
  const [isAuthenticatedState, setIsAuthenticated] = useState<boolean>(false);

  async function clearStates(): Promise<void> {
    setIsAuthenticated(false);
    setTokenState(undefined);
    setUserState(null);
  }

  // Função para extrair as informações do usuário do token
  function extractUserFromToken(token: string) {
    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decodifica o token JWT
      return decodedToken.user || null; // Retorna o usuário, se existir
    } catch (error) {
      return null; // Se não conseguir decodificar, retorna null
    }
  }

  // Função para obter o token e verificar a validade
  async function getToken() {
    const token = await getCookie("accessToken");
    if (token?.value) {
      setTokenState(token.value);

      // Verifica se o token está expirado
      if (isTokenExpired(token.value)) {
        clearStates(); // Se o token expirou, limpa o estado e desloga o usuário
        return;
      }

      // Se o token é válido, extrai os dados do usuário do token
      const user = extractUserFromToken(token.value);
      if (user) {
        setUserState(user);
        setIsAuthenticated(true);
      } else {
        clearStates(); // Se não for possível extrair o usuário, limpa o estado
      }
    } else {
      clearStates(); // Se não houver token, limpa o estado
    }
  }

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
