import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import UsuarioOptions from "../ComboboxOptions/usuarioOptions";
import { useState, useEffect, useContext } from "react";
import { TarefaSchemas } from "@/schemas/TarefaSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthContext } from "@/contexts/AuthContext";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { fetchApi } from "@/api/services/fetchApi";
import { Button } from "@/components/ui/button";
import { Usuario } from "@/api/models/Usuario";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import ComboboxAPI from "../ComboboxAPI";
import { format } from "date-fns";
import * as z from "zod";

const schema = TarefaSchemas.criar;

type FormTaskProps = {
  onSubmit: (values: z.infer<typeof schema>) => void;
  initialValues?: z.infer<typeof schema>;
};

export default function FormTask({ onSubmit, initialValues }: FormTaskProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: initialValues || {
      titulo: "",
      descricao: "",
      responsavel: "",
      data_inicial: new Date(),
      data_final: new Date(),
    },
  });

  useEffect(() => {
    if (initialValues) {
      form.reset(initialValues);
    }
  }, [initialValues, form]);
  const handleSubmit = async (values: z.infer<typeof schema>) => {
    onSubmit(values);
    setOpen(false);
    form.reset();
  };
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      form.reset();
    }
  };

  const { token } = useContext(AuthContext);

  // Estado para armazenar a lista de usuários buscados da API
  const [response, setResponse] = useState<Usuario[]>([]);

  // Função para buscar os usuários da API
  const buscarUsuarios = async () => {
    if (!token) return;

    const response = await fetchApi<undefined, { data: Usuario[] }>({
      route: "/auth/profile",
      method: "GET",
      token: token,
      nextOptions: {},
    });

    if (!response.error) {
      setResponse(response.data.data); 
    }
  };

  // Busca os usuários ao carregar o componente
  useEffect(() => {
    buscarUsuarios();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-1/12">{"+ Nova Tarefa"}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{"Criar Nova Tarefa"}</DialogTitle>
          <DialogDescription>
            {"Adicione uma nova tarefa para gerenciar seus projetos."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                <FormItem data-test="combobox-responsavel" className="md:col-span-2 text-black">
                  <FormLabel className="text-white" htmlFor="responsavel">Responsável</FormLabel>
                  <FormControl>
                    <ComboboxAPI
                      route={"/auth/profile"}
                      multipleOption={false}
                      placeholderInputSearch={"Busque por nome ou cpf"}
                      placeholderUnselected={"Selecione os usuários"}
                      selecionado={response.filter((user) => field.value === user.id)} // Filtra o usuário selecionado
                      setSelecionado={(value: Usuario | Usuario[] | undefined) => {
                        // Verifica se o valor é um único usuário e pega o ID
                        const id = value && !Array.isArray(value) ? value.id : undefined;
                        field.onChange(id); // Atualiza field.value com o ID
                      }}
                      selectedField={(selecionado: Usuario) => selecionado?.nome}
                      renderOption={(dados: Usuario) => <UsuarioOptions dados={dados} />}
                    />
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
  );
}