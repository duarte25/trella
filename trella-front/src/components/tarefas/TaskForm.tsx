import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TarefaSchemas } from "@/schemas/TarefaSchemas";
import { Calendar } from "@/components/ui/calendar";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import * as z from "zod";
import { useState } from "react";

const schema = TarefaSchemas.criar;

type FormTaskProps = {
  onSubmit: (values: z.infer<typeof schema>) => void;
};

export default function FormTask({ onSubmit }: FormTaskProps) {
  const [open, setOpen] = useState(false); // Estado para controlar a abertura/fechamento do diálogo

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      titulo: "",
      descricao: "",
      responsavel: "",
      data_inicial: new Date(),
      data_final: new Date(),
    },
  });

  const handleSubmit = async (values: z.infer<typeof schema>) => {
    await onSubmit(values); // Executa a função de submit passada via props
    setOpen(false); // Fecha o diálogo após o envio
    form.reset(); // Limpa os campos do formulário
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      form.reset(); // Limpa os campos do formulário quando o diálogo é fechado
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
  );
}