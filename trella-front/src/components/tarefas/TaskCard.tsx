import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Tarefa } from '@/api/models/Tarefa';
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenu } from '../ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
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
  };

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            marginBottom: '10px',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            backgroundColor: '#f9f9f9',
            ...provided.draggableProps.style,
          }}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded hover:bg-gray-200 focus:outline-none">
                <MoreHorizontal className="w-4 h-4" />
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
          <p>Responsável: {task.responsavel.nome}</p>
          <h3>{task.titulo}</h3>
          <p>{task.descricao}</p>
          <FormEditar
            onSubmit={(values) => handleEdit({ ...values, _id: task._id })}
            initialValues={initialValues} // Passa os valores iniciais ajustados
            isEdit={true}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
          />
        </div>
      )}
    </Draggable>
  );
};