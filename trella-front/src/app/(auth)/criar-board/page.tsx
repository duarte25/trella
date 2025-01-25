"use client";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import UsuarioOptions from "@/components/ComboboxOptions/usuarioOptions";
import { handleErrorMessage } from "@/errors/handleErrorMessage";
import { BoardResponse } from "@/api/responses/BoardResponse";
import ButtonLoading from "@/components/ButtonLoading";
import { BoardSchemas } from "@/schemas/BoardSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthContext } from "@/contexts/AuthContext";
import ComboboxAPI from "@/components/ComboboxAPI";
import { fetchApi } from "@/api/services/fetchApi";
import ButtonLink from "@/components/ButtonLink";
import { Usuario } from "@/api/models/Usuario";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useContext } from "react";
import { z } from "zod";

const convertToUser = (id: string): Usuario => {
    return {
      id,
      nome: `Nome do Usuário ${id}`,
      email: `usuario${id}@exemplo.com`,
      cpf: `CPF-${id}`
    };
  };

export default function CriarBoard() {
    const router = useRouter();
    const { token } = useContext(AuthContext);

    const schema = BoardSchemas.criar;

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        values: {
            nome: "",
            usuarios: []
        }
    });

    async function cadastrarBoard(data: z.infer<typeof schema>) {
        const response = await fetchApi<typeof data, BoardResponse>({ route: "/boards", method: "POST", data: data, token: token });

        if (response.error) {
            handleErrorMessage<typeof data>({ errors: response.errors, form: form });
        } else {
            router.replace("/");
        }
    };

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(cadastrarBoard)}>
                    <FormField
                        control={form.control}
                        name="nome"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel htmlFor="nome">Nome *</FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        id="nome"
                                        data-test="inputNomeUsuario"
                                        placeholder="Nome"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage data-test="nomeUsuarioValidacao" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="usuarios"
                        render={({ field }) => (
                            <FormItem data-test="combobox-usuarios" className="md:col-span-2">
                                <FormLabel htmlFor="usuarios">Usuarios *</FormLabel>
                                <FormControl>
                                    <ComboboxAPI
                                        route={"/auth/profile"}
                                        multipleOption={true}
                                        placeholderInputSearch={"Busque por nome ou cpf"}
                                        placeholderUnselected={"Selecione o motorista"}
                                        querysPrimary={{ nome: "input" }}
                                        querysSecondary={{ cpf: "input" }}
                                        selecionado={field.value.map(convertToUser)}
                                        setSelecionado={(value: Usuario | Usuario[] | undefined) => {
                                            const ids = Array.isArray(value) 
                                              ? value.map(user => user.id)
                                              : value 
                                                ? [value.id]
                                                : []; // Se for undefined, retorna um array vazio
                                          
                                            field.onChange(ids); 
                                          }}
                                        selectedField={(selecionado: Usuario) => selecionado?.nome}
                                        renderOption={(dados: Usuario) => <UsuarioOptions dados={dados} />}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div>
                        <ButtonLink href={`/home`} size="lg" variant="outline" data-test="button-voltar">Voltar</ButtonLink>
                        <ButtonLoading isLoading={form.formState.isSubmitting} data-test="button-editar">Salvar</ButtonLoading>
                    </div>

                </form>
            </Form>
        </div>
    );
}