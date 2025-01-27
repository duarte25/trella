"use client";

import { useTaskBoard } from '@/components/tarefas/useTaskBoard';
import { TaskBoard } from '@/components/tarefas/TaskBoard';
import FormTask from '@/components/tarefas/FormTask';
import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

type InformacoesBoardProps = {
  params: Promise<{ id: string }>;
};

export default function InformacoesBoard({ params }: InformacoesBoardProps) {
  const { id } = React.use(params);
  const { columns, isLoading, isError, error, onDragEnd, handleCreateTask, handleEditTask, handleDeleteTask } = useTaskBoard(id);

  // Verifica se há um erro e converte a mensagem de erro para uma string
  useEffect(() => {
    if (isError && error) {
      // Se error for uma instância de Error, usa a propriedade message
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(errorMessage);
    }
  }, [isError, error]);


  return (
    <div className="flex flex-col gap-5 px-2">
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-[10]">
          <Loader2 className="h-16 w-16 animate-spin text-gray-500" />
        </div>
      )}
      <FormTask onSubmit={handleCreateTask} />
      <TaskBoard
        columns={columns}
        onDragEnd={onDragEnd}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}