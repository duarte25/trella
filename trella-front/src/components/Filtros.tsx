"use client";

import React, { useTransition } from "react";
import { createURLSearch } from "@/utils/createURLSearch";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Form } from "./ui/form";
import ButtonLoading from "./ButtonLoading";
import { UseFormReturn } from "react-hook-form";

// Definindo os tipos para as props
interface FiltrosProps {
  route: string;
  form: UseFormReturn<unknown>; // UseFormReturn é o tipo do formulário do react-hook-form
  children: React.ReactNode; // Tipo para children
}

export default function Filtros({ route, form, children }: FiltrosProps) {
  const router = useRouter();
  const [isSearching, startSearching] = useTransition();

  // Função para filtrar os dados
  function filter(data: unknown) {
    startSearching(() => {
      const urlSearch = createURLSearch(route, { ...data, pagina: 1 });
      router.replace(urlSearch);
    });
  }

  return (
    <Form {...form} data-test="form-filtros">
      <form onSubmit={form.handleSubmit(filter)} data-test="form-submit">
        <section className="w-full p-4 shadow border rounded-md bg-blue-100/10">
          <div className="grid grid-cols-1 2xl:grid-cols-4 xl:grid-cols-3 md:grid-cols-2 gap-2 text-primaryDark">
            {children}
            <div className="grid items-end justify-self-end cold-end-auto md:col-end-3 xl:col-end-4 mt-2 2xl:col-end-5">
              <ButtonLoading
                isLoading={isSearching}
                variant="secondary"
                title={"Realizar busca"}
                data-test="botao-filtrar"
                size="default"
              >
                <Search className="mr-2 h-4 w-4" />
                Pesquisar
              </ButtonLoading>
            </div>
          </div>
        </section>
      </form>
    </Form>
  );
}