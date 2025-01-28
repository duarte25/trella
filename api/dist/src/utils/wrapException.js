import { sendError } from "./mensagens";
// Definição do erro personalizado da API
export class APIError extends Error {
    code;
    errors;
    constructor(errors, code = 400, options) {
        super(errors ? errors[0]?.message : "Erro com código " + code, options);
        this.code = errors?.[0]?.code || code;
        this.errors = errors;
    }
}
// Função para envolver a execução de funções assíncronas com tratamento de exceções
export const wrapException = (fn) => {
    return async (req, res, next) => {
        // Medir o tempo de execução
        let tempoInicio;
        if (process.env.DEBUGLOG === "true") {
            tempoInicio = performance.now();
        }
        try {
            return await fn(req, res, next);
        }
        catch (err) {
            if (err instanceof APIError) {
                // Erro retornado da API personalizada
                return sendError(res, err.code, err.errors || err.message);
            }
            else if (err.name === "ValidationError") {
                // Erros de validação do mongoose
                let errors = [{ message: "Erros no model do Mongoose" }];
                Object.keys(err.errors).forEach((key) => {
                    errors.push({
                        message: err.errors[key].message,
                        // path: key
                    });
                });
                return sendError(res, 400, errors);
            }
            else {
                // Erro desconhecido
                console.error(err);
                return sendError(res, 500, [{ message: err.message || "" + err }]);
            }
        }
        finally {
            // Medir o tempo de execução
            if (process.env.DEBUGLOG === "true" && tempoInicio) {
                const millis = parseInt((performance.now() - tempoInicio).toString());
                console.log(millis + " ms");
            }
        }
    };
};
