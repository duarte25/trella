"use client";

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronsUpDown, LogOut, User, Loader2, Presentation } from "lucide-react";
import { deleteCookie } from "@/actions/handleCookie";
import { AuthContext } from "@/contexts/AuthContext";
import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/api/services/fetchApi";
import { BoardResponse } from "@/api/responses/BoardResponse";
import { useQuery } from "@tanstack/react-query";

export default function Appbar() {
  const { user, token } = useContext(AuthContext);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // Aguarde 2 segundos
      setTimeout(async () => {
        // Após o tempo, remova o cookie e redirecione
        await deleteCookie("accessToken");
        setIsLoading(false);
        router.replace("/");
      }, 1000);
    } catch (error) {
      console.error("Error logging out:", error);
      setIsLoading(false);
    }
  };

  const { isMobile } = useSidebar();

  const { data, isLoading: isBoardLoading, error } = useQuery<BoardResponse>({
    queryKey: ["getBoards"],
    queryFn: async () => {
      const response = await fetchApi<undefined, BoardResponse>({
        route: "/boards",
        method: "GET",
        token: token,
        nextOptions: {},
      });

      if (response.error) {
        throw new Error(response.message);
      }

      console.log("Resposta da API:", response.data); // Log para inspecionar a estrutura
      return response.data; // Retornando o array esperado
    },
    retry: 2,
    refetchOnWindowFocus: false,
  });

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-[10]">
          <Loader2 className="h-16 w-16 animate-spin text-gray-500" />
        </div>
      )}

      <Sidebar collapsible="icon">
        <SidebarHeader >
          <SidebarMenu >
            <SidebarMenuItem >
              <SidebarMenuButton size="lg" asChild>
                <a href="/home">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Presentation className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">Trella</span>
                    <span className="text-sm">v1.0.0</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="w-full">Boards</button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg">
                      {
                        data?.data?.map((item) => (
                          <DropdownMenuItem key={item._id} onClick={handleLogout}>
                            <LogOut />
                            {item.nome}
                          </DropdownMenuItem>
                        ))
                      }
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <User />
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user.nome}</span>
                      <span className="truncate text-xs">{user.email}</span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <User />
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">{user.nome}</span>
                        <span className="truncate text-xs">{user.email}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
