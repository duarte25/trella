declare module 'faker-br' {
    export const br: {
        cpf: () => string;
        cnpj: () => string;
        rg: () => string;
        nome: () => string;
        cidade: () => string;
        // Adicione mais métodos aqui conforme necessário
    };

    export const name: {
        firstName: () => string;
        lastName: () => string;
        // Adicione mais métodos aqui conforme necessário
    };

    export const internet: {
        email: () => string;
        // Adicione mais métodos aqui conforme necessário
    };
}
