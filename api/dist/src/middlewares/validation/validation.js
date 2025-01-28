import mongoose from "mongoose";
import messages from "../../utils/mensagens.js";
import { isCPF, isCNPJ, isCNH } from "validation-br";
// Acessar objeto com caminho "a.b.c"
const getValueByPath = (obj, path) => {
    if (!path.includes("."))
        return obj[path];
    let parts = path.split(".");
    let current = obj;
    for (let p of parts) {
        if (current === undefined || current === null || current[p] === undefined)
            return undefined;
        current = current[p];
    }
    return current;
};
const setValueByPath = (obj, path, value) => {
    if (!path.includes(".")) {
        obj[path] = value;
        return;
    }
    let parts = path.split(".");
    let lastPart = parts.pop();
    let current = obj;
    for (let p of parts) {
        if (current[p] === undefined || current[p] === null)
            current[p] = {};
        current = current[p];
    }
    current[lastPart] = value;
};
export class ValidationResult {
    path;
    body;
    error;
    constructor(path, body) {
        this.path = path;
        this.body = body;
        this.error = false;
    }
    hasError() {
        return this.error !== false;
    }
    getValue() {
        return getValueByPath(this.body, this.path);
    }
    setValue(newValue) {
        setValueByPath(this.body, this.path, newValue);
    }
    // toString
    toString() {
        return JSON.stringify({
            path: this.path,
            value: getValueByPath(this.body, this.path),
            error: this.error
        });
    }
}
export class Validator {
    validations;
    body;
    constructor(bodyObj) {
        if (bodyObj === undefined || typeof bodyObj !== "object" || bodyObj === null)
            throw new Error("O construtor de Validator deve receber um objeto body com os valores a serem validados!");
        this.validations = {};
        this.body = bodyObj;
    }
    async validate(path, ...funcoes) {
        let val = new ValidationResult(path, this.body);
        this.validations[path] = val;
        for (let funcao of funcoes) {
            let continuar = await funcao(val.getValue(), val);
            if (continuar !== true) {
                val.error = continuar;
                return this;
            }
        }
        return this;
    }
    anyErrors() {
        return Object.keys(this.validations).some((path) => !this.isValid(path));
    }
    getErrors() {
        const errosFiltrados = Object.keys(this.validations).filter((path) => !this.isValid(path));
        return errosFiltrados.length > 0 ? errosFiltrados.map((path) => this.validations[path].error) : [];
    }
    getSanitizedBody() {
        let sanitizedBody = {};
        Object.keys(this.validations).forEach((path) => {
            let value = this.validations[path].getValue();
            if (value !== undefined) {
                setValueByPath(sanitizedBody, path, value);
            }
        });
        return sanitizedBody;
    }
    getValue(path) {
        if (this.validations[path] === undefined)
            return undefined;
        return this.validations[path].getValue();
    }
    isValid(path) {
        return path in this.validations && this.validations[path]?.error === false;
    }
}
export class ValidationFuncs {
    // ---------------------------------------------------
    // Funções de sanitização
    // ---------------------------------------------------
    static optional = (opcoes = {}) => async (value) => {
        if (value === undefined) {
            return false;
        }
        else {
            return true;
        }
    };
    static trim = (opcoes = { allowEmpty: false }) => async (value, val) => {
        if (typeof value?.trim !== "function")
            return opcoes.message || messages.validationGeneric.invalid(val.path).message;
        value = value.trim();
        val.setValue(value);
        if (!opcoes.allowEmpty && !value) {
            return opcoes.message || messages.validationGeneric.fieldIsRequired(val.path).message;
        }
        return true;
    };
    static toLowerCase = (opcoes = {}) => async (value, val) => {
        if (typeof value?.toLowerCase !== "function") {
            return opcoes.message || messages.validationGeneric.invalid(val.path).message;
        }
        val.setValue(value.toLowerCase());
        return true;
    };
    static toUpperCase = (opcoes = {}) => async (value, val) => {
        if (typeof value?.toUpperCase !== "function") {
            return opcoes.message || messages.validationGeneric.invalid(val.path).message;
        }
        val.setValue(value.toUpperCase());
        return true;
    };
    static toFloat = (opcoes = {}) => async (value, val) => {
        value = parseFloat(value);
        if (isNaN(value)) {
            return opcoes.message || messages.validationGeneric.invalid(val.path).message;
        }
        val.setValue(value);
        return true;
    };
    static toInt = (opcoes = {}) => async (value, val) => {
        value = parseInt(value);
        if (isNaN(value)) {
            return opcoes.message || messages.validationGeneric.invalid(val.path).message;
        }
        val.setValue(value);
        return true;
    };
    static toBoolean = (opcoes = {}) => async (value, val) => {
        val.setValue(value == true ? true : false);
        return true;
    };
    static enum(opcoes) {
        return async (value, context) => {
            if (!Array.isArray(opcoes.values) || opcoes.values.length === 0) {
                throw new Error("A função de validação enum deve receber um array values");
            }
            if (!opcoes.values.includes(value)) {
                return opcoes.message || `O valor do campo ${context.path} deve ser um dos seguintes: ${opcoes.values.join(', ')}`;
            }
            return true;
        };
    }
    static toMongooseObj = (opcoes) => async (value, val) => {
        const path = val.path;
        // Verifica se o model foi passado corretamente
        if (!opcoes.model) {
            throw new Error("A função de validação deve receber o Model para pesquisa!");
        }
        // Define a query de pesquisa
        let query = opcoes.query || { [path]: value };
        // Se a opção `ignoreSelf` for verdadeira, ignoramos o próprio documento
        if (opcoes.ignoreSelf && val.parent?._id) {
            query._id = { $ne: val.parent._id };
        }
        // Realiza a consulta no banco de dados
        const resultado = await opcoes.model.findOne(query);
        // Caso o resultado não seja encontrado, retornamos uma mensagem de erro
        if (!resultado) {
            return opcoes.message || `O valor '${value}' não foi encontrado para o campo '${path}'.`;
        }
        // Se o resultado for encontrado, definimos o valor no contexto de validação
        val.setValue(resultado);
        // Retorna verdadeiro indicando que a validação foi bem-sucedida
        return true;
    };
    static toDateTime = (opcoes = { defaultTimezoneLocal: true }) => async (value, val) => {
        let dateString;
        if (/^\d\d\d\d\-\d\d\-\d\dT\d\d\:\d\d(\:\d\d(\.\d+)?)?([+-]\d\d\:\d\d|Z)?$/.test(value)) {
            if (!opcoes.defaultTimezoneLocal && !value.endsWith("Z") && !(/^.*[+-]\d\d\:\d\d$/.test(value))) {
                dateString = value + "Z";
            }
            dateString = value;
        }
        else {
            return opcoes.message || messages.customValidation.invalidDate;
        }
        let timestamp = Date.parse(dateString);
        if (isNaN(timestamp)) {
            return opcoes.message || messages.customValidation.invalidDate;
        }
        val.setValue(new Date(timestamp));
        return true;
    };
    static toUTCDate = (opcoes = {}) => async (value, val) => {
        let dateString;
        if (/^\d\d\d\d\-\d\d\-\d\d$/.test(value)) {
            dateString = value + "T04:00:00Z";
        }
        else if (/^\d\d\d\d\-\d\d$/.test(value)) {
            dateString = value + "-01T04:00:00Z";
        }
        else {
            return opcoes.message || messages.customValidation.invalidDate;
        }
        let timestamp = Date.parse(dateString);
        if (isNaN(timestamp)) {
            return opcoes.message || messages.customValidation.invalidDate;
        }
        val.setValue(new Date(timestamp));
        return true;
    };
    static required = (opcoes = {}) => async (value, val) => {
        if (value === undefined) {
            return opcoes.message || messages.validationGeneric.fieldIsRequired(val.path).message;
        }
        return true;
    };
    static validateLength = (opcoes = { min: 0, max: 255 }) => async (value, val) => {
        if (value === undefined)
            return true;
        let valueLength = value?.length;
        // Check if the length is within the min/max range
        if ((opcoes.min && valueLength < opcoes.min) || (opcoes.max && valueLength > opcoes.max)) {
            return opcoes.message || messages.validationGeneric.invalidInputFormatForField?.(val.path).message || "Invalid length";
        }
        return true;
    };
    static exists = (opcoes) => async (value, val) => {
        const path = val.path;
        if (!opcoes.model) {
            throw new Error("A função de validação exists deve receber o Model que irá pesquisar!");
        }
        // Configura a query com base no caminho e no valor
        let query = opcoes.query || { [path]: value };
        // Ignorar o próprio documento com base no _id ou userId, caso seja aplicável
        if (opcoes.ignoreSelf) {
            const ignoreId = val.parent?._id || opcoes.userId; // Use o _id do pai ou o userId fornecido
            if (ignoreId) {
                query._id = { $ne: ignoreId };
            }
        }
        // Realiza a consulta no banco de dados
        const resultado = await opcoes.model.findOne(query);
        // Se não encontrou um resultado, retorna uma mensagem de erro
        if (!resultado) {
            return opcoes.message || `O valor para ${path} não foi encontrado no banco de dados.`;
        }
        // Se encontrou, retorna verdadeiro (validação passa)
        return true;
    };
    static unique = (opcoes) => async (value, val) => {
        const path = val.path;
        if (!opcoes.model) {
            throw new Error("A função de validação única deve receber o Model para pesquisa!");
        }
        // Configura a query com base no caminho e no valor
        let query = opcoes.query || { [path]: value };
        // Ignorar o próprio documento com base no _id ou userId
        if (opcoes.ignoreSelf) {
            const ignoreId = val.parent?._id || opcoes.userId; // Use o _id do pai ou o userId fornecido
            if (ignoreId) {
                query._id = { $ne: ignoreId };
            }
        }
        // Realiza a consulta no banco de dados
        const resultado = await opcoes.model.findOne(query);
        // Se encontrou um resultado, retorna a mensagem de erro
        if (resultado) {
            return opcoes.message || `O valor para ${path} já está em uso.`;
        }
        // Se não encontrou, retorna verdadeiro (validação passa)
        return true;
    };
    static mongooseID = (opcoes = {}) => {
        return async (value, val) => {
            // Pega o valor de valorMongo, se ele existir, ou usa o value
            const valorMongo = opcoes.valorMongo !== undefined ? opcoes.valorMongo : value;
            // Validação única de ObjectId
            if (!mongoose.Types.ObjectId.isValid(valorMongo)) {
                return opcoes.message || `O valor no campo ${val.path} não é um ObjectId válido.`;
            }
            return true;
        };
    };
    static CPF = (opcoes = {}) => async (value, val) => {
        if (!isCPF(value)) {
            return opcoes.message || messages.validationGeneric.invalid(val.path).message;
        }
        return true;
    };
    static CNPJ = (opcoes = {}) => async (value, val) => {
        if (!isCNPJ(value)) {
            return opcoes.message || messages.validationGeneric.invalid(val.path).message;
        }
        return true;
    };
    static CNH = (opcoes = {}) => async (value, val) => {
        if (!isCNH(value)) {
            return opcoes.message || messages.validationGeneric.invalid(val.path).message;
        }
        return true;
    };
    static email(opcoes = {}) {
        return ValidationFuncs.regex({
            regex: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
            message: opcoes.message || "O formato do email é inválido."
        });
    }
    static passwordComplexity(opcoes = {}) {
        return ValidationFuncs.regex({
            regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            message: opcoes.message || "A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, uma minúscula, um número e um caractere especial."
        });
    }
    static regex = (opcoes = { regex: /./ }) => async (value, val) => {
        if (opcoes.regex === undefined) {
            throw new Error("A função de validação regex deve receber um objeto com a propriedade regex");
        }
        if (!opcoes.regex.test(value)) {
            return opcoes.message || `Formato inválido para o campo ${val.path}`;
        }
        else {
            return true;
        }
    };
    // ---------------------------------------------------
    // Funções de validação
    // ---------------------------------------------------
    static isNumber = (opcoes = {}) => async (value, val) => {
        if (typeof value !== "number") {
            return opcoes.message || messages.validationGeneric.invalid(val.path).message;
        }
        return true;
    };
    static isDate = (opcoes = {}) => async (value, val) => {
        if (!(value instanceof Date)) {
            return opcoes.message || messages.validationGeneric.invalid(val.path).message;
        }
        return true;
    };
}
export default new ValidationFuncs();
