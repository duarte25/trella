export interface ApiError {
    message: string;
  }
  
  export interface ApiResponse<T, isArray extends boolean = false> {
    code: number;
    error: boolean;
    errors: ApiError[] | [];
    message: string;
    data: isArray extends true ? T[] | [] : T;
  }
  
  export interface FetchApiProps<T> {
    route: string;
    method: "GET" | "POST" | "PUT" | "DELETE";
    data?: T | null;
    token?: string;
    nextOptions?: NextFetchRequestConfig;
  }
  