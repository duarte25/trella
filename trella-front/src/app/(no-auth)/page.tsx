"use client";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { handleErrorMessage } from "@/errors/handleErrorMessage";
import { createSession } from "@/actions/session";
import { LoginResponse } from "@/api/responses/LoginResponse";
import { AuthSchemas } from "@/schemas/AuthSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/api/services/fetchApi";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import ButtonLoading from "@/components/ButtonLoading";
import Image from "next/image";
import Link from "next/link";
import z from "zod";

export default function LoginPage() {
    const router = useRouter();

    const schema = AuthSchemas.login;

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            email: "",
            senha: "",
        },
    });

    async function login(data: z.infer<typeof schema>) {
        const response = await fetchApi<typeof data, LoginResponse>({ route: "/auth/login", method: "POST", data: data });

        if (response.error) {
            handleErrorMessage<typeof data>({ errors: response.errors, form: form });
        } else {
            await createSession(response.data.token);

            router.replace("/");
        }
    }

    return (
        <div className="h-screen w-screen">
            <main className="flex h-full w-full bg-gradient-to-r  from-gray-400 via-blue-600 to-blue-900 lg:flex-row lg:bg-white lg:from-white lg:to-white">
                <section className="hidden w-full items-center justify-center bg-gradient-to-r from-gray-400 via-blue-600 to-blue-900 lg:flex lg:max-w-[70vw]">
                    <div className="flex flex-col items-center gap-20">
                        <CardTitle className="text-slate-200 text-5xl">
                            Trella.com
                        </CardTitle>
                        <Image src="/login_illustration.svg" alt="teste" width={400} height={400} />
                    </div>
                </section>

                <section className="flex h-full w-full flex-col items-center justify-center">
                    <div className="flex flex-col items-center gap-2 lg:hidden">
                        <h1 className="text-3xl text-white">Seja bem-vindo!</h1>
                    </div>
                    <Card className="m-8 w-full max-w-[400px]">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(login)}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        Login
                                    </CardTitle>
                                    <CardDescription>
                                        <b>Bem-vindo! Digite seus dados para continuar.</b>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <fieldset className="space-y-4">
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
                                                Não tem uma conta?{" "}
                                                <Link className="underline" href="/register">
                                                    Cadastre-se
                                                </Link>
                                            </span>
                                        </div>
                                    </fieldset>
                                </CardContent>
                                <CardFooter className="w-full">
                                    <ButtonLoading type="submit" isLoading={form.formState.isSubmitting} className="w-full">
                                        Entrar
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
