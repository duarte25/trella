import { AuthProvider } from "@/contexts/AuthContext";
import { getCookie } from "@/actions/handleCookie";
import { redirect } from "next/navigation";
import { jwtDecode } from "jwt-decode"
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { Usuario } from "@/api/models/Usuario";

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
                <div className="w-full h-full flex flex-col gap-10">
                    <main className="w-full h-full px-32">{children}</main>
                </div>
            </AuthProvider>
        </ReactQueryProvider>
    );
}
