"use client";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import UsuarioOptions from "@/components/ComboboxOptions/usuarioOptions";
import { handleErrorMessage } from "@/errors/handleErrorMessage";
import { BoardResponse } from "@/api/responses/BoardResponse";
import { useContext, useEffect, useState } from "react";
import ButtonLoading from "@/components/ButtonLoading";
import { BoardSchemas } from "@/schemas/BoardSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthContext } from "@/contexts/AuthContext";
import ComboboxAPI from "@/components/ComboboxAPI";
import { fetchApi } from "@/api/services/fetchApi";
import { Usuario } from "@/api/models/Usuario";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Image from "next/image";
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
        <div className="h-screen">
            <main className="flex h-full w-full bg-gradient-to-r  from-gray-400 lg:flex-row lg:bg-white lg:from-white lg:to-white">
                <section className="hidden w-full items-center justify-center bg-gradient-to-r from-gray-400 via-blue-600 to-blue-900 lg:flex lg:max-w-[70vw]">
                    <div className="flex flex-col items-center gap-20">
                        <Image src="/scrum_board1.svg" alt="teste" width={500} height={500} />
                    </div>
                </section>

                <section className="flex h-full w-full flex-col items-center justify-center bg-blue-900">
                    {/* <div className="flex flex-col items-center gap-2 lg:hidden">
                        <h1 className="text-3xl text-white">Seja bem-vindo!</h1>
                    </div> */}
                    <Card className="p-8 w-9/12 h-1/2 bg-primary text-white flex justify-center items-center">
                        <Form {...form}>
                            <form className="w-4/5 flex flex-col gap-4" onSubmit={form.handleSubmit(cadastrarBoard)}>
                                <CardHeader className="flex">
                                    <CardTitle>
                                        Criar Brand
                                    </CardTitle>
                                    <CardDescription className="text-gray-200">
                                        <b>Crie sua ideia e faça suas tarefas utilizando nosso sistema.</b>
                                    </CardDescription>
                                </CardHeader>
                                <FormField
                                    control={form.control}
                                    name="nome"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel htmlFor="nome">Nome da Board *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="placeholder:text-white"
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
                                        <FormItem data-test="combobox-usuarios" className="md:col-span-2 text-black">
                                            <FormLabel className="text-white" htmlFor="usuarios">Usuarios *</FormLabel>
                                            <FormControl >
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

                                <div className="flex justify-center">
                                    {/* <ButtonLink href={`/home`} size="lg" variant="outline" data-test="button-voltar">Voltar</ButtonLink> */}
                                    <ButtonLoading className="bg-gray-200 text-black w-2/5" isLoading={form.formState.isSubmitting} data-test="button-editar">Salvar</ButtonLoading>
                                </div>
                            </form>
                        </Form>
                    </Card>
                </section>
            </main>
        </div>
    );
}