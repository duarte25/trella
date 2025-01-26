"use client";

import { fetchApi } from '@/api/services/fetchApi';
import { AuthContext } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import React, { useContext } from 'react';

type InformacoesBoardProps = {
  params: Promise<{ id: string }>;
};

interface BoardData {
  _id: string;
  board_id: string;
  status: string;
  titulo: string;
  descricao: string;
  responsavel: {
    _id: string;
    nome: string;
    email: string;
  };
  data_inicial: string;
  data_final: string;
  _version: number;
  createdAt: string;
  updatedAt: string;
  id: string;
}

interface ApiResponse {
  data: {
    data: BoardData[];
    resultados: number;
    limite: number;
    totalPaginas: number;
    pagina: number;
  };
  error: boolean;
  code: number;
  message: string;
  errors: any[];
}

export default function InformacoesBoard({ params }: InformacoesBoardProps) {
  const { id } = React.use(params);
  const { token } = useContext(AuthContext);

  const { data, isLoading, isError, error } = useQuery<ApiResponse>({
    queryKey: ["GetBoard", id],
    queryFn: async () => {
      const response = await fetchApi<null, ApiResponse>({
        route: `/tarefas?board_id=${id}`,
        method: "GET",
        token: token,
      });

      if (response.error) {
        throw new Error(response.message || "Erro ao carregar os dados da board");
      }

      return response;
    },
  });

  // Exibição de loading
  if (isLoading) {
    return <p>Carregando...</p>;
  }

  // Exibição de erro
  if (isError) {
    return <p>Erro: {error?.message || "Falha ao carregar os dados da board"}</p>;
  }

  console.log("Olha a data", data);

  // Exibição dos dados da board
  return (
    <div>
      <h1>Informações da Board</h1>
      <p>ID da Board: {id}</p>
      {data && data.data.data && data.data.data.length > 0 ? (
        data.data.data.map((board) => (
          <div key={board._id} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
            <h2>{board.titulo}</h2>
            <p>{board.descricao}</p>
            <p>Status: {board.status}</p>
            <p>Responsável: {board.responsavel.nome}</p>
            <p>Data Inicial: {new Date(board.data_inicial).toLocaleDateString()}</p>
            <p>Data Final: {new Date(board.data_final).toLocaleDateString()}</p>
          </div>
        ))
      ) : (
        <p>Nenhuma tarefa encontrada para esta board.</p>
      )}
    </div>
  );
}