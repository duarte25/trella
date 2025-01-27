"use client"

import DataTableBoards from "@/components/boards/DataTableBoards";
import { BoardSchemas } from "@/schemas/BoardSchemas";
import GetTableData from "@/components/GetTableData";
import { AuthContext } from "@/contexts/AuthContext";
import { useContext } from "react";

export default function Home() {

  const { token } = useContext(AuthContext);

  return (
    <div className="px-2">
      <GetTableData
        TableComponent={DataTableBoards}
        querys={{ page: 1, limit: 10 }}
        fetchTag={"getBoards"}
        route={"/boards"}
        schema={BoardSchemas.filtrarBoards}
        token={token}
      />
    </div>
  );
}