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
import { useContext, useEffect, useState } from "react";
import { z } from "zod";

export default function CriarBoard() {
    const router = useRouter();
    const { token } = useContext(AuthContext);

    const schema = BoardSchemas.criar;

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            nome: "",
            usuarios: [] // Inicializa como um array vazio de IDs
        }
    });

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
            setResponse(response.data.data); // Atualiza o estado com os usuários buscados
        }
    };

    // Busca os usuários ao carregar o componente
    useEffect(() => {
        buscarUsuarios();
    }, [token]);

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
                                        placeholderUnselected={"Selecione os usuários"}
                                        selecionado={response.filter((user) => field.value.includes(user.id))} // Filtra os usuários selecionados
                                        setSelecionado={(value: Usuario | Usuario[] | undefined) => {
                                            // Transforma os objetos Usuario em IDs
                                            const ids = Array.isArray(value) 
                                                ? value.map((user) => user.id) 
                                                : value 
                                                    ? [value.id] 
                                                    : [];
                                            field.onChange(ids); // Atualiza field.value com os IDs
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