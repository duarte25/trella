import { TarefaResponse, TarefaResponseData } from '@/api/responses/TarefaResponse';
import { handleErrorMessages } from '@/errors/handleErrorMessage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AuthContext } from '@/contexts/AuthContext';
import { fetchApi } from '@/api/services/fetchApi';
import { DropResult } from '@hello-pangea/dnd';
import { Tarefa, TarefaResponsavel } from '@/api/models/Tarefa';
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
      const response = await fetchApi<null, TarefaResponseData>({
        route: `/tarefas?board_id=${id}`,
        method: "GET",
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
      }
      return response.data;
    }
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: Partial<TarefaResponsavel>) => {
      const response = await fetchApi<Partial<TarefaResponsavel>, TarefaResponse>({
        route: '/tarefas',
        method: 'POST',
        token: token,
        data: taskData,
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
      }

      return response;
    },
    onSuccess: async () => {
      // Faz um novo fetch para atualizar todas as tarefas após a edição
      const response = await fetchApi<null, TarefaResponseData>({
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
    mutationFn: async (taskData: Partial<Tarefa> & { _id: string }) => {
      const response = await fetchApi<Partial<TarefaResponsavel>, TarefaResponse>({
        route: `/tarefas/${taskData._id}`,
        method: 'PATCH',
        token: token,
        data: {
          titulo: taskData.titulo,
          descricao: taskData.descricao,
          responsavel: taskData.responsavel?._id,
          data_inicial: taskData.data_inicial,
          data_final: taskData.data_final,
        },
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
      }

      return response;
    },
    onSuccess: async () => {
      // Faz um novo fetch para atualizar todas as tarefas após a edição
      const response = await fetchApi<null, TarefaResponseData>({
        route: `/tarefas?board_id=${id}`,
        method: 'GET',
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
      }

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
    mutationFn: async (updatedTask: { _id: string; status: string }) => {
      const response = await fetchApi<{ status: string }, TarefaResponse>({
        route: `/tarefas/${updatedTask._id}`,
        method: "PATCH",
        token: token,
        data: { status: updatedTask.status },
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
      }

      return response;
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await fetchApi<null, TarefaResponse>({
        route: `/tarefas/${taskId}`,
        method: 'DELETE',
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
      }

      return response;
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
      responsavel: {
        _id: task.responsavel._id,
        nome: task.responsavel.nome,
        email: task.responsavel.email,
      },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  type TaskValues = {
    titulo: string;
    descricao: string;
    responsavel: string;
    data_inicial: Date;
    data_final: Date;
  };

  return {
    columns,
    isLoading,
    isError,
    error,
    onDragEnd,
    handleCreateTask: (values: TaskValues) => {
      createTaskMutation.mutate({
        board_id: id,
        status: "Open",
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