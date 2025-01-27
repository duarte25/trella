import { FieldValues, UseFormReturn } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import { ApiError } from "@/types/api";

type Props<T extends FieldValues> = {
  title?: string;
  form?: UseFormReturn<T>;
  errors: ApiError[];
};

export function handleErrorMessage<T extends FieldValues>({ errors, form, title }: Props<T>) {
  errors.forEach((error) => {
    if (typeof error === 'string') {
      // Se o erro for uma string simples
      toast({
        title: title ? title : undefined,
        variant: "destructive",
        description: error,
      });
    } else if (typeof error === 'object' && error.path && form) {
      // Se o erro for um objeto com path e form estiver disponível
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      form.setError(error.path as any, { type: "custom", message: error.message });
    } else if (typeof error === 'object' && error.message) {
      // Se o erro for um objeto sem path, apenas exibe a mensagem
      toast({
        title: title ? title : undefined,
        variant: "destructive",
        description: error.message,
      });
    }
  });
}