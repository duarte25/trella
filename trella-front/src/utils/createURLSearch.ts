// Função para criar link juntando a rota com as querys. ex: /reservas?motorista=id&veiculo=id&filtro=aberto;
// Data pode receber apenas o objeto com os valores chave e valor que seriam as querys, porem pode receber querys hiddenQuerys que seria as querys ocultas da URL e schema
// para fazer a validação do zod, ou seja só deixar filtrar na URL oque tiver no schema do zod.

import { ZodError, ZodSchema } from "zod";

interface QuerySchemaProps<T> {
  querys: Record<string, T>;
  hiddenQuerys?: Record<string, T>;
  schema?: ZodSchema<T>;
}

interface URLSearchProps<T> {
  route: string;
  data: QuerySchemaProps<T>;
}

export function createURLSearch<T>({ route, data }: URLSearchProps<T>): string {
  const searchParams = new URLSearchParams();

  const querys = data.querys;
  const hiddenQuerys = data.hiddenQuerys;
  const schema = data.schema;

  const addQuery = (key: string, value: unknown) => {
    // verificar se a query é vazia, undefined, null ou all, o all é porque o shadcnui não recebe string vazia nas options ai o all serve para dizer que seria todas as opções;
    if (value === undefined || value === "" || value === null || value === "all") {
      if (searchParams.has(key)) {
        searchParams.delete(key);
      }
      return;
    }

    if (schema) {
      try {
        schema.parse({ [key]: value });
        searchParams.set(key, value as string);
      } catch (error) {
        if (error instanceof ZodError) {
          throw new Error(`Query "${key}" não é válida de acordo com o schema: ${error.errors[0].message}`);
        }
      }
    } else {
      searchParams.set(key, value as string);
    }
  };

  for (const query in querys) {
    addQuery(query, querys[query]);
  }

  // Adicionar as querys ocultas;
  if (hiddenQuerys) {
    for (const query in hiddenQuerys) {
      addQuery(query, hiddenQuerys[query]);
    }
  }

  return `${route}?${searchParams.toString()}`;
}
