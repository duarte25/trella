"use client";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { BoardSchemas } from "@/schemas/BoardSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Definindo os tipos para as props
interface FormBuscarBoardsProps {
  route: string;
  querys: {
    nome?: string; // Nome é opcional
  };
}

export default function FormBuscarBoard({ querys }: FormBuscarBoardsProps) {
  // Definindo o tipo do schema
  const schema = BoardSchemas.filtrarBoards;

  // Tipando o formulário com o schema do Zod
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: querys.nome ?? "", // Valor padrão vazio se não houver query
    },
  });

  return (
      <FormField
        control={form.control}
        name="nome"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="nome" data-test="label-data-nome">Nome</FormLabel>
            <FormControl>
              <Input
                type="text" 
                id="nome"
                {...field}
                data-test="input-data-nome"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
  );
}