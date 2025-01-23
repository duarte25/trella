"use client";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { handleErrorMessage } from "@/errors/handleErrorMessage";
import ButtonLoading from "@/components/ButtonLoading";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthContext } from "@/contexts/AuthContext";
import { AuthSchemas } from "@/schemas/AuthSchemas";
import { fetchApi } from "@/api/services/fetchApi";
import { Usuario } from "@/api/models/Usuario";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import z from "zod";

export default function RegisterPage() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("AuthContext must be used within an AuthProvider");
    }

    const router = useRouter();

    const schema = AuthSchemas.register;

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            nome: "",
            cpf: "",
            email: "",
            senha: "",
        },
    });

    async function register(data: z.infer<typeof schema>) {
        const response = await fetchApi<typeof data, Usuario>({ route: "/auth/register", method: "POST", data: data });

        if (response.error) {
            handleErrorMessage<typeof data>({ errors: response.errors, form: form });
        } else {
            router.replace("/login");
        }
    }

    return (
        <div className="h-screen w-screen">
            <main className="flex h-full w-full bg-gradient-to-r  from-gray-400 via-blue-600 to-blue-900 lg:flex-row lg:bg-white lg:from-white lg:to-white">
                <section className="hidden w-full items-center justify-center bg-gradient-to-r from-gray-400 via-blue-600 to-blue-900 lg:flex lg:max-w-[70vw]">
                    <div className="flex flex-col items-center gap-10">
                        <CardTitle className="text-slate-200 text-5xl">
                            Trella.com
                        </CardTitle>
                        <Image src="/register_illustration.svg" alt="teste" width={400} height={400} />
                    </div>
                </section>

                <section className="flex h-full w-full flex-col items-center justify-center">
                    <div className="flex flex-col items-center gap-2 lg:hidden">
                        <h1 className="text-3xl text-white">Seja bem-vindo!</h1>
                    </div>
                    <Card className="m-8 w-full max-w-[400px]">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(register)}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        Cadastre-se
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <fieldset className="space-y-4">
                                        <FormField
                                            name="nome"
                                            control={form.control}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel htmlFor="nome">Nome</FormLabel>
                                                    <FormControl>
                                                        <Input type="nome" id="npme" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            name="cpf"
                                            control={form.control}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel htmlFor="cpf">CPF</FormLabel>
                                                    <FormControl>
                                                        <Input type="cpf" id="cpf" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            name="email"
                                            control={form.control}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel htmlFor="email">Email</FormLabel>
                                                    <FormControl>
                                                        <Input type="email" id="email" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            name="senha"
                                            control={form.control}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel htmlFor="senha">Senha</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" id="senha" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div>
                                            <span className="text-sm">
                                                <Link className="underline" href="/login">
                                                    Já tem uma conta?
                                                </Link>
                                            </span>
                                        </div>
                                    </fieldset>
                                </CardContent>
                                <CardFooter className="w-full">
                                    <ButtonLoading type="submit" isLoading={form.formState.isSubmitting} className="w-full">
                                        Registrar
                                    </ButtonLoading>
                                </CardFooter>
                            </form>
                        </Form>
                    </Card>
                </section>
            </main>
        </div>
    );
}
