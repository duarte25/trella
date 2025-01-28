import { toast } from "react-toastify";

/**
 * Exibe uma lista de erros como toasts.
 * @param errors Um array de strings contendo as mensagens de erro.
 * @param options Opções adicionais para o toast (opcional).
 */
export function handleErrorMessages(errors: string[]) {
  console.log("ERRORS", errors);
  // Verifica se errors é um array de strings
  if (!Array.isArray(errors)) {
      console.error("Erro: O parâmetro 'errors' deve ser um array.");
      return;
  }

  errors.forEach((error) => {
      toast.error(error, {
          position: "top-right",
          autoClose: 5000, // Fecha automaticamente após 5 segundos
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
      });
  });
}
