import { FieldValues, UseFormReturn } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import { ApiError } from "@/types/api";

type Props<T extends FieldValues> = {
  title?: string;
  form: UseFormReturn<T>;
  errors: ApiError<T>[];
};

export function handleErrorMessage<T extends FieldValues>({ errors, form, title }: Props<T>) {
  errors.forEach((error) => {
    if (form && error.path) {
      form.setError(error.path, { type: "custom", message: error.message });
    } else {
      toast({
        title: title ? title : undefined,
        variant: "destructive",
        description: error,
      });
    }
  });
}
