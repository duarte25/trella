import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BoardResponseData } from "@/api/responses/BoardResponse";
import { handleErrorMessages } from "@/errors/handleErrorMessage";
import { AuthContext } from "@/contexts/AuthContext";
import { Eye, MoreHorizontal } from "lucide-react";
import { fetchApi } from "@/api/services/fetchApi";
import { useContext, useState } from "react";
import { Board } from "@/api/models/Board";
import IconLink from "../IconLink";

interface DataTableBoardsProps {
  dados: BoardResponseData;
  onUpdate: () => void;
}

export default function DataTableBoards({ dados, onUpdate }: DataTableBoardsProps) {
  const [open, setOpen] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<Board | null>(null);
  const { token } = useContext(AuthContext);

  const handleDelete = async () => {
    if (!boardToDelete) return;

    try {
      const response = await fetchApi({
        route: `/boards/${boardToDelete._id}`,
        method: "DELETE",
        token: token,
      });

      if (response.error) {
        const errorMessages = response.errors.map((error) => {
          // Verifica se o erro é um objeto ApiError ou uma string
          if (typeof error === "string") {
            return error;
          } else {
            return error.message;
          }
        });

        // Passa o array de strings para handleErrorMessages
        handleErrorMessages(errorMessages);
      } else {

        onUpdate();
      }

    } catch (error) {
      console.error("Error deleting board:", error);
    } finally {
      setOpen(false);
    }
  };

  const handleOpenDeleteDialog = (board: Board) => {
    setBoardToDelete(board);
    setOpen(true);
  };

  return (
    <div>
      <Table data-test="tabela-boards">
        <TableHeader>
          <TableRow>
            <TableHead data-test="coluna-nome">Nome</TableHead>
            <TableHead data-test="coluna-responsavel">Responsável</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dados?.data?.map((board: Board) => (
            <TableRow key={board?._id} data-test={`linha-board-${board?._id}`}>
              <TableCell data-test="celula-nome">{board?.nome}</TableCell>
              <TableCell data-test="celula-responsavel">{board?.responsavel?.nome}</TableCell>
              <TableCell data-test="celula-acoes" className="flex items-center space-x-2">
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger>
                      <IconLink data-test="link-informacoes" href={`/informacoes-board/${board?._id}`}>
                        <Eye className="w-4 h-4" />
                      </IconLink>
                    </TooltipTrigger>
                    <TooltipContent>Informações</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 rounded hover:bg-gray-200 focus:outline-none">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" align="start">
                    {/* <DropdownMenuItem onClick={() => console.log(`Edit Project ${board?._id}`)}>
                      Editar Board
                    </DropdownMenuItem> */}
                    <DropdownMenuItem>
                      <span className="cursor-pointer text-red-500" onClick={() => handleOpenDeleteDialog(board)}>
                        Deletar Board
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Você realmente deseja deletar este board? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Sim, deletar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}