interface CustomLabels {
    totalDocs: string;
    docs: string;
    limit: string;
    page: string;
    totalPages: string;
    pagingCounter: boolean;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: boolean;
    nextPage: boolean;
}

const myCustomLabels: CustomLabels = {
    totalDocs: "resultados",
    docs: "data",
    limit: "limite",
    page: "pagina",
    totalPages: "totalPaginas",
    pagingCounter: false,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: false,
    nextPage: false
};

interface PaginateOptions {
    page: number;
    limit: number;
    customLabels: CustomLabels;
}

export const paginateOptions: PaginateOptions = {
    page: 1,
    limit: 10,
    customLabels: myCustomLabels
};
