"use client";

import { BoardResponseData } from "@/api/responses/BoardResponse";
import PaginationComponent from "./PaginationComponent";
import RefreshTableButton from "./RefreshTableButton";
import { fetchApi } from "@/api/services/fetchApi";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";

interface GetTableDataProps {
  TableComponent: React.ComponentType<{ dados: BoardResponseData; onUpdate: () => void }>;
  querys: Record<string, string | number>;
  fetchTag: string;
  schema?: unknown;
  route: string;
  token: string | null;
}

export default function GetTableDataComponent({
  TableComponent,
  querys,
  fetchTag,
  route,
  token,
}: GetTableDataProps) {
  const [currentPage, setCurrentPage] = useState(1); 

  // Atualiza os parâmetros com a página atual
  const updatedQuerys = {
    ...querys,
    pagina: currentPage, // Usa o estado interno da página
  };

  const { data, isLoading, isError, refetch } = useQuery<BoardResponseData>({
    queryKey: ["getTableData", updatedQuerys],
    queryFn: async () => {
      if (!token) {
        throw new Error("Token is missing");
      }

      // Adiciona os parâmetros à URL da requisição
      const queryString = new URLSearchParams(updatedQuerys as unknown as Record<string, string>).toString();
      const apiUrl = `${route}?${queryString}`;

      const response = await fetchApi<undefined, BoardResponseData>({
        route: apiUrl,
        method: "GET",
        token: token,
        nextOptions: {},
      });

      if (response.error) {
        throw new Error(response.errors ? JSON.stringify(response.errors) : "Unknown error");
      }
      return response.data;
    },
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const handleUpdate = () => {
    refetch(); // Refaz a solicitação GET para atualizar os dados
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading data</div>;
  }

  // Verifica se data não é undefined
  if (!data) {
    return <div>No data available</div>;
  }

  return (
    <>
      <div className="w-full">
        <div className="flex justify-between items-center">
          {data.resultados !== undefined && (
            <span data-test="total-documentos">Total: {data.resultados}</span>
          )}
          <RefreshTableButton tag={fetchTag} />
        </div>
        <TableComponent dados={data || { data: [], error: true, totalPaginas: 0, pagina: 0 }} onUpdate={handleUpdate} />
      </div>
      {data.totalPaginas > 1 && (
        <PaginationComponent
          currentPage={currentPage} // Passa o estado interno da página
          totalPages={data.totalPaginas}
          onPageChange={(page) => setCurrentPage(page)} // Atualiza o estado interno
        />
      )}
    </>
  );
}