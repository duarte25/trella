"use client";

import React from 'react';
import { useTaskBoard } from '@/components/tarefas/useTaskBoard';
import { TaskBoard } from '@/components/tarefas/TaskBoard';
import FormTask from '@/components/tarefas/TaskForm';

type InformacoesBoardProps = {
  params: Promise<{ id: string }>;
};

export default function InformacoesBoard({ params }: InformacoesBoardProps) {
  const { id } = React.use(params);
  const { columns, isLoading, isError, error, onDragEnd, handleCreateTask, handleEditTask, handleDeleteTask} = useTaskBoard(id);
  if (isLoading) {
    return <p>Carregando...</p>;
  }
  if (isError) {
    return <p>Erro: {error?.message || "Falha ao carregar os dados da board"}</p>;
  }

  return (
    <div className="flex flex-col gap-5">
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