"use client"

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { TarefaResponse } from '@/api/responses/TarefaResponse';
import React, { useContext, useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AuthContext } from '@/contexts/AuthContext';
import { fetchApi } from '@/api/services/fetchApi';
import { Tarefa } from '@/api/models/Tarefa';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import * as z from "zod";

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

const formSchema = z.object({
  titulo: z.string().min(1, "O título é obrigatório"),
  descricao: z.string().min(1, "A descrição é obrigatória"),
  responsavel: z.string().min(1, "O responsável é obrigatório"),
  data_inicial: z.date({ required_error: "Data inicial é obrigatória" }),
  data_final: z.date({ required_error: "Data final é obrigatória" }),
});

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
      form.reset();
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
    // onSuccess: () => {
    //   // Atualiza o cache ou refetch dos dados
    //   // queryClient.invalidateQueries({ queryKey: ['GetBoard', id] });
    // },
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: "",
      descricao: "",
      responsavel: "",
      data_inicial: new Date(),
      data_final: new Date(),
    },
  });

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
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-1/12">+ Nova Tarefa</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Criar Nova Tarefa</DialogTitle>
            <DialogDescription>
              Adicione uma nova tarefa para gerenciar seus projetos.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateTask)} className="space-y-6">
              <FormField
                control={form.control}
                name="titulo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Título da tarefa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descrição da tarefa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="responsavel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsável</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do responsável" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="data_inicial"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data Inicial</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Input
                            placeholder="Selecione uma data"
                            {...field}
                            value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                            readOnly
                          />
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white border rounded-md shadow-lg">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="data_final"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data Final</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Input
                            placeholder="Selecione uma data"
                            {...field}
                            value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                            readOnly
                          />
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white border rounded-md shadow-lg">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

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