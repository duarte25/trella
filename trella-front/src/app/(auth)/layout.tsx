import { AuthProvider } from "@/contexts/AuthContext";
import { getCookie } from "@/actions/handleCookie";
import { redirect } from "next/navigation";
import { jwtDecode } from "jwt-decode"
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { Usuario } from "@/api/models/Usuario";
import Appbar from "@/components/Appbar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

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
                <SidebarProvider>
                    <Appbar />
                    <SidebarInset className="flex flex-col">
                        <header className="flex h-12 shrink-0 items-center gap-2 border-b">
                            <div className="flex items-center gap-2 px-3 font-semibold">
                                <SidebarTrigger />
                                <Separator orientation="vertical" className="mr-2 h-4" />
                                Trella
                            </div>
                        </header>
                        <main className="w-full overflow-hidden p-5">
                            {children}
                        </main>
                    </SidebarInset>
                </SidebarProvider >
            </AuthProvider>
        </ReactQueryProvider>
    );
}
