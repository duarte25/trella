import { ApiResponse, FetchApiProps } from "../../types/api";
import { createURLSearch } from "../../utils/createURLSearch";
import { getCookie } from "@/actions/handleCookie";

const getApiUrlEnv = () => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL;
  } else {
    return process.env.API_URL;
  }
};

export async function fetchApi<RequestData, ResponseData>({
  route,
  method,
  data,
  token,
  nextOptions,
}: FetchApiProps<RequestData>): Promise<ApiResponse<ResponseData>> {
  try {
    let bearerToken = token || undefined;

    if (!bearerToken && typeof window === "undefined") {
      const token = await getCookie("accessToken");

      bearerToken = token?.value;
    }

    let urlApi = getApiUrlEnv();

    let body: BodyInit | null = null;

    if (method === "GET" && data) {
      const urlSearch = createURLSearch({ route: route, data: { querys: data } });

      route = urlSearch;
      body = null;
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${bearerToken}`,
      accept: "application/json",
    };

    if (method !== "GET" && data) {
      if (data instanceof FormData) {
        headers["accept"] = "multipart/form-data";
        headers["bucket-name"] = process.env.NEXT_PUBLIC_MINIO_BUCKET || "biblioteca";
        urlApi = process.env.NEXT_PUBLIC_API_FILE_URL;
        body = data;
      } else {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify(data);
      }
    }

    const response = await fetch(`${urlApi}${route}`, {
      method: method,
      headers: headers,
      body: body,
      next: nextOptions,
    });

    const responseData: ApiResponse<ResponseData> = await response.json();

    return responseData;
  } catch (error) {

    let errorMessage = "A aplicação falhou ao tentar realizar a requisição para o servidor";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      data: [] as ResponseData,
      code: 500,
      error: true,
      message: "A aplicação falhou ao tentar realizar a requisição para o servidor",
      errors: [
        {
          message: errorMessage,
        },
      ],
    };
  }
}
