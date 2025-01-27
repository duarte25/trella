"use client"

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { TarefaResponse } from '@/api/responses/TarefaResponse';
import React, { useContext, useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AuthContext } from '@/contexts/AuthContext';
import { fetchApi } from '@/api/services/fetchApi';
import { Tarefa } from '@/api/models/Tarefa';
import FormTask from '@/components/TaskForm';
import { format } from "date-fns";

type InformacoesBoardProps = {
  params: Promise<{ id: string }>;
};

type StatusColumns = {
  Open: Tarefa[];
  Fazendo: Tarefa[];
  Feito: Tarefa[];
  Closed: Tarefa[];
};

const statusColumns: StatusColumns = {
  Open: [],
  Fazendo: [],
  Feito: [],
  Closed: [],
};

export default function InformacoesBoard({ params }: InformacoesBoardProps) {
  const { id } = React.use(params);
  const { token } = useContext(AuthContext);
  const [columns, setColumns] = useState<StatusColumns>(statusColumns);

  const { isLoading, isError, error, data } = useQuery<TarefaResponse>({
    queryKey: ["GetTarefas", id],
    queryFn: async () => {
      const response = await fetchApi<null, TarefaResponse>({
        route: `/tarefas?board_id=${id}`,
        method: "GET",
        token: token,
      });
      if (response.error) {
        throw new Error(response.message || "Erro ao carregar os dados da board");
      }
      return response.data;
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (taskData: Partial<Tarefa>) => {
      return fetchApi<Partial<Tarefa>, TarefaResponse>({
        route: '/tarefas',
        method: 'POST',
        token: token,
        data: taskData,
      });
    },
    onSuccess: (data) => {
      const updatedColumns = { ...columns };
      updatedColumns.Open.push(data.data);
      setColumns(updatedColumns);
    },
  });

  const mutation = useMutation({
    mutationFn: (updatedTask: { _id: string; status: string }) => {
      return fetchApi<{ status: string }, TarefaResponse>({
        route: `/tarefas/${updatedTask._id}`,
        method: "PATCH",
        token: token,
        data: { status: updatedTask.status },
      });
    },
  });

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    if (!destination) {
      return;
    }
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }
    const startColumn = columns[source.droppableId as keyof StatusColumns];
    const finishColumn = columns[destination.droppableId as keyof StatusColumns];
    if (startColumn === finishColumn) {
      const newTasks = Array.from(startColumn);
      const [movedTask] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, movedTask);
      const newColumns = {
        ...columns,
        [source.droppableId]: newTasks,
      };
      setColumns(newColumns);
      return;
    }
    // Movendo de uma coluna para outra
    const startTasks = Array.from(startColumn);
    const finishTasks = Array.from(finishColumn);
    const [movedTask] = startTasks.splice(source.index, 1);
    const updatedTask = { _id: movedTask._id, status: destination.droppableId }; // Atualizar o status da tarefa
    finishTasks.splice(destination.index, 0, { ...movedTask, status: destination.droppableId });
    const newColumns = {
      ...columns,
      [source.droppableId]: startTasks,
      [destination.droppableId]: finishTasks,
    };
    setColumns(newColumns);
    // Atualiza o status da tarefa no banco de dados
    mutation.mutate(updatedTask);
  };

  useEffect(() => {
    if (data) {
      // Reinicialize as colunas com base nos dados obtidos
      const newColumns = { ...statusColumns };
      data.data.forEach((task: Tarefa) => {
        newColumns[task.status as keyof StatusColumns].push(task);
      });
      setColumns(newColumns);
    }
  }, [data]);

  const handleCreateTask = async (values: z.infer<typeof formSchema>) => {
    createTaskMutation.mutate({
      board_id: id,
      status: 'Open',
      titulo: values.titulo,
      descricao: values.descricao,
      responsavel: values.responsavel,
      data_inicial: format(values.data_inicial, "yyyy-MM-dd"),
      data_final: format(values.data_final, "yyyy-MM-dd"),
    });
  };

  if (isLoading) {
    return <p>Carregando...</p>;
  }
  if (isError) {
    return <p>Erro: {error?.message || "Falha ao carregar os dados da board"}</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <FormTask onSubmit={handleCreateTask} />

      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {Object.entries(columns).map(([columnId, tasks]) => (
            <Droppable droppableId={columnId} key={columnId}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    width: '22%',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '5px',
                  }}
                >
                  <h2>{columnId}</h2>
                  {Array.isArray(tasks) && tasks.length > 0 ? (
                    tasks.map((task, index) => (
                      <Draggable key={`${task._id}-${index}`} draggableId={task._id} index={index}>
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
                            <h3>{task.titulo}</h3>
                            <p>{task.descricao}</p>
                            <p>Responsável: {task.responsavel.nome}</p>
                          </div>
                        )}
                      </Draggable>
                    ))
                  ) : (
                    <p>Nenhuma tarefa nesta coluna</p>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}