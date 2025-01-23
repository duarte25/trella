"use client";

import { Usuario } from "@/api/models/Usuario";
import React, { createContext, useState } from "react";

type Props = {
  children: React.ReactNode;
  user: Usuario;
  token: string;
};

type ContextType = {
  user: Usuario;
  token: string ;
};

export const AuthContext = createContext<ContextType>({
  user: {} as Usuario,
  token: "",
});

export function AuthProvider({ children, token, user }: Props) {
  const [tokenState] = useState<string>(token || "");
  const [userState] = useState<Usuario>(user || ({} as Usuario));

  return (
    <AuthContext.Provider
      value={{
        token: tokenState,
        user: userState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
