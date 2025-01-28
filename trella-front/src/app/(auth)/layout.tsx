import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import { getCookie } from "@/actions/handleCookie";
import { Usuario } from "@/api/models/Usuario";
import { redirect } from "next/navigation";
import Appbar from "@/components/Appbar";
import { jwtDecode } from "jwt-decode"

export default async function LayoutAuth({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const token = await getCookie("accessToken");

    if (!token) {
        redirect("/");
    }

    const decode = jwtDecode(token.value);

    return (
        <ReactQueryProvider>
            <AuthProvider user={decode as Usuario} token={token.value}>
                <SidebarProvider className="flex md:flex-row flex-col">
                    <Appbar />
                    <SidebarInset>
                        <header className="flex h-12 shrink-0 items-center gap-2 border-b">
                            <div className="flex items-center gap-2 px-3 font-semibold">
                                <SidebarTrigger />
                                <Separator orientation="vertical" className="mr-2 h-4" />
                                Trella
                            </div>
                        </header>
                        <main className="w-full overflow-hidden">
                            {children}
                        </main>
                    </SidebarInset>
                </SidebarProvider >
            </AuthProvider>
        </ReactQueryProvider>
    );
}
