import { FieldValues, UseFormReturn } from "react-hook-form";
import { toast } from "@/hooks/use-toast";

// Interface para representar a resposta de erro da API
interface ApiErrorResponse {
  data: unknown[];
  error: boolean;
  code: number;
  message: string;
  errors: string[]; // Lista de mensagens de erro
}

type Props<T extends FieldValues> = {
  title?: string;
  form: UseFormReturn<T>;
  apiResponse: ApiErrorResponse; // Passando a resposta completa da API
};

export function handleErrorMessage<T extends FieldValues>({ apiResponse, form, title }: Props<T>) {
  const { errors: apiErrors } = apiResponse;

  if (apiErrors && apiErrors.length > 0) {
    apiErrors.forEach((errorMessage) => {
      // Exibindo um toast para cada mensagem de erro
      toast({
        title: title ? title : undefined,
        variant: "destructive",
        description: errorMessage,
      });
    });

    // Adicionando um erro genérico ao campo 'root' do formulário
    if (form) {
      form.setError('root', { type: 'custom', message: 'Existem erros no formulário.' });
    }
  } else {
    // Caso não haja mensagens específicas, exibir uma notificação geral
    toast({
      title: title ? title : undefined,
      variant: "destructive",
      description: apiResponse.message || "Ocorreu um erro inesperado.",
    });
  }
}