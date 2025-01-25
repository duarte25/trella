"use client"

// app/page.tsx (Server Component)
import DataTableBoards from "@/components/boards/DataTableBoards";
import { BoardSchemas } from "@/schemas/BoardSchemas";
import GetTableData from "@/components/GetTableData";
import { AuthContext } from "@/contexts/AuthContext";
import { useContext } from "react";

export default function Home() {

  const { token } = useContext(AuthContext);

  return (
    <div>
      <GetTableData
        route={"/boards"}
        routePagination={"/boards"}
        schema={BoardSchemas.filtrarBoards}
        TableComponent={DataTableBoards}
        querys={{ page: 1, limit: 10 }}
        fetchTag={"getRastreadores"}
        token={token}
      />
    </div>
  );
}