import { BoardResponseData } from "@/api/responses/BoardResponse";
import PaginationComponent from "./PaginationComponent";
import RefreshTableButton from "./RefreshTableButton";
import { fetchApi } from "@/api/services/fetchApi";
import { useQuery } from "@tanstack/react-query";
import React from "react";


interface GetTableDataProps {
  TableComponent: React.ComponentType<{ dados: BoardResponseData }>;
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
  const { data, isLoading, isError } = useQuery<BoardResponseData>({
    queryKey: ["getTableData", querys],
    queryFn: async () => {
      if (!token) {
        throw new Error("Token is missing");
      }
      const response = await fetchApi<undefined, BoardResponseData>({
        route: route,
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
        <TableComponent dados={data || { data: [], error: true, totalPaginas: 0, pagina: 0 }} />
      </div>
      {data.totalPaginas > 1 && (
        <PaginationComponent
          route={route}
          currentPage={data.pagina}
          totalPages={data.totalPaginas}
          querys={querys}
          data-test="pagination-component"
        />
      )}
    </>
  );
};
