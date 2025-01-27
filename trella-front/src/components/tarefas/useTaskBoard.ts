import { TarefaResponse, TarefaResponseData } from '@/api/responses/TarefaResponse';
import { handleErrorMessage } from '@/errors/handleErrorMessage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AuthContext } from '@/contexts/AuthContext';
import { fetchApi } from '@/api/services/fetchApi';
import { DropResult } from '@hello-pangea/dnd';
import { Tarefa } from '@/api/models/Tarefa';
import { useState, useEffect } from 'react';
import { useContext } from 'react';
import { format } from 'date-fns';

export type StatusColumns = {
  Open: Tarefa[];
  Fazendo: Tarefa[];
  Feito: Tarefa[];
  Closed: Tarefa[];
};

export const useTaskBoard = (id: string) => {
  const { token } = useContext(AuthContext);
  const [columns, setColumns] = useState<StatusColumns>({
    Open: [],
    Fazendo: [],
    Feito: [],
    Closed: [],
  });

  const { isLoading, isError, error, data } = useQuery<TarefaResponseData>({
    queryKey: ["GetTarefas", id],
    queryFn: async () => {
      const response = await fetchApi<null, TarefaResponse>({
        route: `/tarefas?board_id=${id}`,
        method: "GET",
        token: token,
      });

      if (response.error) {
        handleErrorMessage({ errors: response.errors, form: undefined });
      }

      return response.data;
    }
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
    onSuccess: async () => {
      // Faz um novo fetch para atualizar todas as tarefas após a edição
      const response = await fetchApi<null, TarefaResponse>({
        route: `/tarefas?board_id=${id}`,
        method: 'GET',
        token: token,
      });
      const newColumns: StatusColumns = {
        Open: [],
        Fazendo: [],
        Feito: [],
        Closed: [],
      };

      response.data.data.forEach((task: Tarefa) => {
        newColumns[task.status as keyof StatusColumns].push(task);
      });

      setColumns(newColumns);
    },
  });

  const mutationEditar = useMutation({
    mutationFn: (taskData: Partial<Tarefa> & { _id: string }) => {
      return fetchApi<Partial<Tarefa>, TarefaResponse>({
        route: `/tarefas/${taskData._id}`,
        method: 'PATCH',
        token: token,
        data: {
          titulo: taskData.titulo,
          descricao: taskData.descricao,
          responsavel: taskData.responsavel,
          data_inicial: taskData.data_inicial,
          data_final: taskData.data_final,
        },
      });
    },
    onSuccess: async () => {
      // Faz um novo fetch para atualizar todas as tarefas após a edição
      const response = await fetchApi<null, TarefaResponse>({
        route: `/tarefas?board_id=${id}`,
        method: 'GET',
        token: token,
      });
      const newColumns: StatusColumns = {
        Open: [],
        Fazendo: [],
        Feito: [],
        Closed: [],
      };

      response.data.data.forEach((task: Tarefa) => {
        newColumns[task.status as keyof StatusColumns].push(task);
      });

      setColumns(newColumns);
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

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => {
      return fetchApi<null, TarefaResponse>({
        route: `/tarefas/${taskId}`,
        method: 'DELETE',
        token: token,
      });
    },
    onSuccess: (_, taskId) => {
      const updatedColumns = { ...columns };
      Object.keys(updatedColumns).forEach((key) => {
        updatedColumns[key as keyof StatusColumns] = updatedColumns[key as keyof StatusColumns].filter(
          (task) => task._id !== taskId
        );
      });
      setColumns(updatedColumns);
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

    const startTasks = Array.from(startColumn);
    const finishTasks = Array.from(finishColumn);
    const [movedTask] = startTasks.splice(source.index, 1);
    const updatedTask = { _id: movedTask._id, status: destination.droppableId };
    finishTasks.splice(destination.index, 0, { ...movedTask, status: destination.droppableId });
    const newColumns = {
      ...columns,
      [source.droppableId]: startTasks,
      [destination.droppableId]: finishTasks,
    };
    setColumns(newColumns);
    mutation.mutate(updatedTask);
  };

  const handleEditTask = (task: Tarefa) => {
    mutationEditar.mutate({
      _id: task._id,
      titulo: task.titulo,
      descricao: task.descricao,
      responsavel: task.responsavel,
      data_inicial: format(task.data_inicial, "yyyy-MM-dd"),
      data_final: format(task.data_final, "yyyy-MM-dd"),
    });
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTaskMutation.mutate(taskId);
  };

  useEffect(() => {
    if (data) {
      const newColumns = { ...columns };
      data?.data?.forEach((task: Tarefa) => {
        newColumns[task.status as keyof StatusColumns].push(task);
      });
      setColumns(newColumns);
    }
  }, [data]);

  return {
    columns,
    isLoading,
    isError,
    error,
    onDragEnd,
    handleCreateTask: (values: unknown) => {
      createTaskMutation.mutate({
        board_id: id,
        status: 'Open',
        titulo: values.titulo,
        descricao: values.descricao,
        responsavel: values.responsavel,
        data_inicial: format(values.data_inicial, "yyyy-MM-dd"),
        data_final: format(values.data_final, "yyyy-MM-dd"),
      });
    },
    handleEditTask,
    handleDeleteTask,
  };
};