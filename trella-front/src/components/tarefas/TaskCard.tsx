import { DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenu } from '../ui/dropdown-menu';
import { Draggable } from '@hello-pangea/dnd';
import { MoreHorizontal } from 'lucide-react';
import { Tarefa } from '@/api/models/Tarefa';
import React, { useState } from 'react';
import FormEditar from './FormEditar';

type TaskCardProps = {
  task: Tarefa;
  index: number;
  onEdit: (task: Tarefa) => void;
  onDelete: (taskId: string) => void;
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, index, onEdit, onDelete }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const handleEdit = (updatedTask: Tarefa) => {
    onEdit(updatedTask);
    setIsEditDialogOpen(false);
  };

  // Ajusta o objeto da tarefa para enviar o objeto completo do responsável
  const initialValues = {
    ...task,
    responsavel: task.responsavel._id,
    data_inicial: new Date(task.data_inicial),
    data_final: new Date(task.data_final),
  };

  function formatDateToMonthYear(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' };
    return date.toLocaleDateString('pt-BR', options).replace(/ de /g, '/').replace(/\.$/, '');
  }

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="border border-gray-500 rounded-lg p-2 mx-4 bg-zinc-700 shadow-md"
          style={{
            ...provided.draggableProps.style,
          }}
        >
          <div className="flex flex-row items-center gap-2">

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded hover:bg-gray-200 focus:outline-none">
                  <MoreHorizontal className="w-5 h-5 text-gray-100" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start">
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(task._id)}>
                  <span className="cursor-pointer text-red-500">Deletar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <p className="text-sm text-gray-100">{task.responsavel.nome}</p>
          </div>
          <h3 className="text-base font-semibold text-white">{task.titulo}</h3>
          <p className="text-sm text-gray-200">{task.descricao}</p>
          <div>
            <div className="text-sm text-gray-200 flex flex-row gap-4">
              <h2>{formatDateToMonthYear(new Date(task.data_inicial))}</h2>
              <h2>{formatDateToMonthYear(new Date(task.data_final))}</h2>
            </div>
          </div>
          <FormEditar
            onSubmit={(values) => {
              // Cria um objeto completo da tarefa com todas as propriedades obrigatórias
              const updatedTask: Tarefa = {
                ...task, 
                ...values,
                responsavel: {
                  _id: values.responsavel,
                  nome: task.responsavel.nome,
                  email: task.responsavel.email || "",
                },
                data_inicial: values.data_inicial.toISOString(), 
                data_final: values.data_final.toISOString(), 
              };
              handleEdit(updatedTask);
            }}
            initialValues={initialValues}
            isEdit={true}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
          />
        </div>
      )}
    </Draggable>
  );
};