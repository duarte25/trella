"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BoardResponseData } from "@/api/responses/BoardResponse";
import { Board } from "@/api/models/Board";
import { Eye } from "lucide-react";
import IconLink from "../IconLink";

interface DataTableBoardsProps {
  dados: BoardResponseData;
}

export default function DataTableBoards({ dados }: DataTableBoardsProps) {

  console.log("DADOsssS", dados)
  return (
    <Table data-test="tabela-boards">
      <TableHeader>
        <TableRow>
          <TableHead data-test="coluna-nome">Nome</TableHead>
          <TableHead data-test="coluna-responsavel">Responsavel</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {dados?.data?.map((board: Board) => (
          <TableRow
            key={board?._id}
            data-test={`linha-board-${board?._id}`}
          >
            <TableCell data-test="celula-nome">{board?.nome}</TableCell>
            <TableCell data-test="celula-responsavel">{board?.responsavel}</TableCell>
            <TableCell data-test="celula-acoes">
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger>
                    <IconLink data-test="link-informacoes" href={`/boards/${board?._id}/informacoes`}>
                      <Eye />
                    </IconLink>
                  </TooltipTrigger>
                  <TooltipContent>
                    Informações
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}