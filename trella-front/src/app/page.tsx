"use client";

import { AuthContext } from "@/contexts/AuthContext";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const authContext = useContext(AuthContext);
  const router = useRouter();

  // Estado para controlar se a autenticação está sendo verificada
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authContext?.isAuthenticated === undefined) {
      // Se ainda não foi verificado, espera
      return;
    }

    if (authContext?.isAuthenticated === false) {
      // Se não estiver autenticado, redireciona para o login
      router.push("/login");
    } else {
      // Quando a autenticação é verificada e o usuário está autenticado, define como não carregando
      setIsLoading(false);
    }
  }, [authContext?.isAuthenticated, router]);

  if (isLoading) {
    // Exibe um loader enquanto verifica a autenticação
    return <p>Carregando...</p>;
  }

  if (!authContext?.isAuthenticated) {
    // Caso não esteja autenticado, redireciona para o login
    return <p>Redirecionando para o login...</p>;
  }

  return (
    <div>
      {/* Conteúdo da sua página */}
      <h1>Bem-vindo à página inicial!</h1>
    </div>
  );
}
