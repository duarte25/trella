"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useContext, useEffect, useState, useTransition } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { AuthContext } from "@/contexts/AuthContext";
import { fetchApi } from "@/api/services/fetchApi";
import { Usuario } from "@/api/models/Usuario";
import SpinnerLoading from "./SpinnerLoading";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface ComboboxAPIProps {
  route: string;
  selecionado: Usuario | Usuario[] | undefined;
  setSelecionado: (value: Usuario | Usuario[] | undefined) => void;
  placeholderInputSearch: string;
  placeholderUnselected: string;
  multipleOption?: boolean;
}

export default function ComboboxAPI({
  route,
  selecionado,
  setSelecionado,
  placeholderInputSearch,
  placeholderUnselected,
  multipleOption = false,
}: ComboboxAPIProps) {
  const authContext = useContext(AuthContext);
  const token = authContext?.token;

  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState<Usuario[]>([]);
  const [isPendingApiCall, startTransitionApiCall] = useTransition();
  const [inputValue, setInputValue] = useState<string>("");

  const getApi = () => {
    if (!token) {
      console.error("Token is not available");
      return;
    }

    startTransitionApiCall(async () => {
      const response = await fetchApi<undefined, { data: Usuario[] }>({
        route: `${route}?nome=${inputValue}`, // Busca por nome
        method: "GET",
        token: token, // Ensure token is a string
        nextOptions: {},
      });

      if (!response.error) {
        setResponse(response.data.data);
      }
    });
  };

  const selectOption = (option: Usuario) => {
    if (multipleOption) {
      setSelecionado([...(selecionado as Usuario[]), option]);
    } else {
      setSelecionado(option);
      setOpen(false);
    }
  };

  const removeOption = (option: Usuario) => {
    if (multipleOption) {
      setSelecionado(
        (selecionado as Usuario[]).filter((item) => item.cpf !== option.cpf)
      );
    } else {
      setSelecionado(undefined);
      setOpen(false);
    }
  };

  const removeOptions = () => {
    setSelecionado(multipleOption ? [] : undefined);
  };

  const findOption = (dados: Usuario): boolean => {
    if (multipleOption) {
      return (selecionado as Usuario[]).some((item) => item.cpf === dados.cpf);
    }
    return (selecionado as Usuario)?.cpf === dados.cpf;
  };

  useEffect(() => {
    const timeout = setTimeout(() => getApi(), 500);
    return () => clearTimeout(timeout);
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="flex w-full p-1 px-3 min-h-9 h-auto justify-between"
        >
          {Array.isArray(selecionado) && selecionado.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selecionado.map((item) => (
                <div
                  key={item.cpf}
                  className="flex items-center pl-2 pr-5 py-1 bg-slate-200 rounded"
                >
                  <span className="font-semibold text-sm">{item.nome}</span>
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label="Remover opção"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeOption(item);
                    }}
                  >
                    <X className="hover:text-white" />
                  </span>
                </div>
              ))}
            </div>
          ) : selecionado && !Array.isArray(selecionado) ? ( 
            <span>{selecionado.nome}</span>
          ) : (
            <>
              <span>{placeholderUnselected}</span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </>
          )}
          {selecionado && (
            <span
              role="button"
              tabIndex={0}
              aria-label={Array.isArray(selecionado) ? "Remover tudo" : "Remover"}
              onClick={(e) => {
                e.stopPropagation();
                removeOptions();
              }}
            >
              <X className="hover:text-white" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <div className="flex items-center gap-1 py-2 px-2 border-b border-zinc-300">
            <Search className="w-[16px] text-zinc-400" />
            <input
              type="text"
              className="w-full focus:outline-none text-sm p-1"
              placeholder={placeholderInputSearch}
              onChange={(e) => setInputValue(e.target.value)}
              autoFocus
              autoComplete="off"
            />
          </div>
          {!isPendingApiCall && response.length === 0 && (
            <CommandEmpty>Nenhum resultado encontrado!</CommandEmpty>
          )}
          <CommandList>
            <CommandGroup>
              {!isPendingApiCall &&
                response.map((dados, index) => (
                  <CommandItem
                    key={dados.cpf ?? index}
                    value={dados.cpf}
                    onSelect={() =>
                      findOption(dados) ? removeOption(dados) : selectOption(dados)
                    }
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        findOption(dados) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {dados.nome} - {dados.cpf}
                  </CommandItem>
                ))}
              {isPendingApiCall && (
                <CommandItem>
                  <SpinnerLoading />
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}