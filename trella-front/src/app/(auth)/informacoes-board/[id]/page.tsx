"use client"

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { TarefaResponse } from '@/api/responses/TarefaResponse';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AuthContext } from '@/contexts/AuthContext';
import React, { useContext, useState, useEffect } from 'react';
import { fetchApi } from '@/api/services/fetchApi';
import { Tarefa } from '@/api/models/Tarefa';

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
    queryKey: ["GetBoard", id],
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
    onSuccess: (data) => {
      // Reinicialize as colunas apenas quando os dados são carregados com sucesso
      const newColumns = { ...statusColumns };
      data.data.forEach((task: Tarefa) => {
        newColumns[task.status as keyof StatusColumns].push(task);
      });
      setColumns(newColumns);
    },
  });

  const mutation = useMutation({
    mutationFn: (updatedTask: Tarefa) => {
      return fetchApi<Tarefa, TarefaResponse>({
        route: `/tarefas/${updatedTask._id}`,
        method: "PUT",
        token: token,
        body: updatedTask,
      });
    },
    onSuccess: () => {
      // Atualiza o cache ou refetch dos dados
      // queryClient.invalidateQueries({ queryKey: ['GetBoard', id] });
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

    const start = columns[source.droppableId as keyof StatusColumns];
    const finish = columns[destination.droppableId as keyof StatusColumns];

    if (start === finish) {
      const newTaskIds = Array.from(start);
      const [removed] = newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, removed);

      const newColumn = {
        ...start,
        tasks: newTaskIds,
      };

      setColumns({
        ...columns,
        [source.droppableId]: newColumn,
      });
      return;
    }

    // Movendo de uma coluna para outra
    const startTasks = Array.from(start);
    const finishTasks = Array.from(finish);
    const [movedTask] = startTasks.splice(source.index, 1);
    movedTask.status = destination.droppableId as any; // Atualizar o status da tarefa
    finishTasks.splice(destination.index, 0, movedTask);

    const newStartColumn = {
      ...start,
      tasks: startTasks,
    };
    const newFinishColumn = {
      ...finish,
      tasks: finishTasks,
    };

    setColumns({
      ...columns,
      [source.droppableId]: newStartColumn,
      [destination.droppableId]: newFinishColumn,
    });

    // Atualiza o status da tarefa no banco de dados
    mutation.mutate(movedTask);
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

  if (isLoading) {
    return <p>Carregando...</p>;
  }
  if (isError) {
    return <p>Erro: {error?.message || "Falha ao carregar os dados da board"}</p>;
  }

  return (
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
                {tasks.map((task, index) => (
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
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}