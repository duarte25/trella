import mongoose, { Document } from "mongoose";
import messages from "../../utils/mensagens.js";
import { isCPF, isCNPJ, isCNH } from "validation-br";

// Acessar objeto com caminho "a.b.c"
const getValueByPath = (obj: any, path: string): any => {
    if (!path.includes("."))
        return obj[path];

    let parts = path.split(".");
    let current = obj;
    for (let p of parts) {
        if (current === undefined || current === null || current[p] === undefined) return undefined;
        current = current[p];
    }
    return current;
};

const setValueByPath = (obj: any, path: string, value: any): void => {
    if (!path.includes(".")) {
        obj[path] = value;
        return;
    }

    let parts = path.split(".");
    let lastPart = parts.pop();
    let current = obj;
    for (let p of parts) {
        if (current[p] === undefined || current[p] === null) current[p] = {};
        current = current[p];
    }
    current[lastPart!] = value;
};

export class ValidationResult {
    path: string;
    body: any;
    error: boolean;

    constructor(path: string, body: any) {
        this.path = path;
        this.body = body;
        this.error = false;
    }

    hasError(): boolean {
        return this.error !== false;
    }

    getValue(): any {
        return getValueByPath(this.body, this.path);
    }

    setValue(newValue: any): void {
        setValueByPath(this.body, this.path, newValue);
    }

    // toString
    toString(): string {
        return JSON.stringify({
            path: this.path,
            value: getValueByPath(this.body, this.path),
            error: this.error
        });
    }
}

interface ValidationOptions {
    message?: string;
}

/**
 * A classe Validator é usada para validar os campos de um objeto. 
 * Exemplo de uso:
 * 
 * let val = new Validator(req.body);
 * await val.validate("nome", v.required(), v.trim(), v.length({ min: 4, max: 200 }));
 * await val.validate("cpf", v.required(), v.CPF(), v.unique({ model: Motorista, query: { cpf: req.body.cpf } }));
 * await val.validate("data_admissao", v.required(), v.toUTCDate(), v.max({ max: new Date() }));
 * 
 * if (val.anyErrors()) return sendError(res, 422, val.getErrors());
 * 
 * req.body = val.getSanitizedBody();
 */
export class Validator {
    validations: { [key: string]: ValidationResult };
    body: any;

    constructor(bodyObj: any) {
        if (bodyObj === undefined || typeof bodyObj !== "object" || bodyObj === null)
            throw new Error("O construtor de Validator deve receber um objeto body com os valores a serem validados!");

        this.validations = {};
        this.body = bodyObj;
    }

    async validate(path: string, ...funcoes: any[]): Promise<Validator> {
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

    anyErrors(): boolean {
        return Object.keys(this.validations).some((path) => !this.isValid(path));
    }

    getErrors(): any[] {
        const errosFiltrados = Object.keys(this.validations).filter((path) => !this.isValid(path));
        return errosFiltrados.length > 0 ? errosFiltrados.map((path) => this.validations[path].error) : [];
    }

    getSanitizedBody(): any {
        let sanitizedBody: any = {};
        Object.keys(this.validations).forEach((path) => {
            let value = this.validations[path].getValue();
            if (value !== undefined) {
                setValueByPath(sanitizedBody, path, value);
            }
        });
        return sanitizedBody;
    }

    getValue(path: string): any {
        if (this.validations[path] === undefined) return undefined;
        return this.validations[path].getValue();
    }

    isValid(path: string): boolean {
        return path in this.validations && this.validations[path]?.error === false;
    }
}

export class ValidationFuncs {
    // ---------------------------------------------------
    // Funções de sanitização
    // ---------------------------------------------------

    static trim = (opcoes: { allowEmpty?: boolean, message?: string } = { allowEmpty: false }): any => async (value: any, val: ValidationResult): Promise<boolean | string> => {
        if (typeof value?.trim !== "function") return opcoes.message || messages.validationGeneric.invalid(val.path).message;

        value = value.trim();
        val.setValue(value);

        if (!opcoes.allowEmpty && !value) {
            return opcoes.message || messages.validationGeneric.fieldIsRequired(val.path).message;
        }

        return true;
    };

    static toLowerCase = (opcoes: ValidationOptions = {}): any => async (value: any, val: ValidationResult): Promise<boolean | string> => {
        if (typeof value?.toLowerCase !== "function") {
            return opcoes.message || messages.validationGeneric.invalid(val.path).message;
        }

        val.setValue(value.toLowerCase());
        return true;
    };

    static toUpperCase = (opcoes: ValidationOptions = {}): any => async (value: any, val: ValidationResult): Promise<boolean | string> => {
        if (typeof value?.toUpperCase !== "function") {
            return opcoes.message || messages.validationGeneric.invalid(val.path).message;
        }

        val.setValue(value.toUpperCase());
        return true;
    };

    static toFloat = (opcoes: ValidationOptions = {}): any => async (value: any, val: ValidationResult): Promise<boolean | string> => {
        value = parseFloat(value);

        if (isNaN(value)) {
            return opcoes.message || messages.validationGeneric.invalid(val.path).message;
        }

        val.setValue(value);
        return true;
    };

    static toInt = (opcoes: ValidationOptions = {}): any => async (value: any, val: ValidationResult): Promise<boolean | string> => {
        value = parseInt(value);

        if (isNaN(value)) {
            return opcoes.message || messages.validationGeneric.invalid(val.path).message;
        }

        val.setValue(value);
        return true;
    };

    static toBoolean = (opcoes: {} = {}): any => async (value: any, val: ValidationResult): Promise<boolean> => {
        val.setValue(value == true ? true : false);
        return true;
    };

    static toMongooseObj = (opcoes: { model: mongoose.Model<any>; query?: object; message?: string }):
        any => async (value: any, val: ValidationResult): Promise<boolean | string> => {
            const path = val.path;

            if (!opcoes.model) throw new Error("A função de validação existe deve receber o Model que irá pesquisar!");

            let resultado = await opcoes.model.findOne(opcoes.query || { [path]: value });
            if (!resultado) {
                return opcoes.message || messages.validationGeneric.notFound(path).message;
            }

            val.setValue(resultado);
            return true;
        };


    static toDateTime = (opcoes: { defaultTimezoneLocal?: boolean, message?: string } = { defaultTimezoneLocal: true }): any => async (value: any, val: ValidationResult): Promise<boolean | string> => {
        let dateString;

        if (/^\d\d\d\d\-\d\d\-\d\dT\d\d\:\d\d(\:\d\d(\.\d+)?)?([+-]\d\d\:\d\d|Z)?$/.test(value)) {
            if (!opcoes.defaultTimezoneLocal && !value.endsWith("Z") && !(/^.*[+-]\d\d\:\d\d$/.test(value))) {
                dateString = value + "Z";
            }
            dateString = value;
        } else {
            return opcoes.message || messages.customValidation.invalidDate;
        }

        let timestamp = Date.parse(dateString);
        if (isNaN(timestamp)) {
            return opcoes.message || messages.customValidation.invalidDate;
        }

        val.setValue(new Date(timestamp));
        return true;
    };

    static toUTCDate = (opcoes: ValidationOptions = {}): any => async (value: any, val: ValidationResult): Promise<boolean | string> => {
        let dateString;
        if (/^\d\d\d\d\-\d\d\-\d\d$/.test(value)) {
            dateString = value + "T04:00:00Z";
        } else if (/^\d\d\d\d\-\d\d$/.test(value)) {
            dateString = value + "-01T04:00:00Z";
        } else {
            return opcoes.message || messages.customValidation.invalidDate;
        }

        let timestamp = Date.parse(dateString);

        if (isNaN(timestamp)) {
            return opcoes.message || messages.customValidation.invalidDate;
        }

        val.setValue(new Date(timestamp));
        return true;
    };

    static required = (opcoes: { message?: string } = {}): any => async (value: any, val: ValidationResult): Promise<boolean | string> => {
        if (value === undefined) {
            return opcoes.message || messages.validationGeneric.fieldIsRequired(val.path).message;
        }
        return true;
    };

    static validateLength = (opcoes: { min?: number, max?: number, message?: string } = { min: 0, max: 255 }): any => async (value: any, val: ValidationResult): Promise<boolean | string> => {
        if (value === undefined) return true;
    
        let valueLength = value?.length;
    
        // Check if the length is within the min/max range
        if ((opcoes.min && valueLength < opcoes.min) || (opcoes.max && valueLength > opcoes.max)) {
            return opcoes.message || messages.validationGeneric.invalidInputFormatForField?.(val.path).message || "Invalid length"; 
        }
    
        return true;
    };
    
    static unique = (opcoes: { model: mongoose.Model<any>, query: object, message?: string }): any => async (value: any, val: ValidationResult): Promise<boolean | string> => {
        const path = val.path;
    
        if (opcoes.model === undefined || opcoes.query === undefined) throw new Error("The 'model' and 'query' parameters are required for the unique function!");
    
        let count = await opcoes.model.countDocuments(opcoes.query);
    
        if (count > 0) {
            // Use an existing message or provide an inline message if not defined in messages
            return opcoes.message || messages.validationGeneric.invalidInputFormatForField?.(path).message || `The value for the field ${path} already exists.`;
        }
    
        return true;
    };
    

    static CPF = (opcoes: { message?: string } = {}): any => async (value: any, val: ValidationResult): Promise<boolean | string> => {
        if (!isCPF(value)) {
            return opcoes.message || messages.validationGeneric.invalid(val.path).message;
        }

        return true;
    };

    static CNPJ = (opcoes: { message?: string } = {}): any => async (value: any, val: ValidationResult): Promise<boolean | string> => {
        if (!isCNPJ(value)) {
            return opcoes.message || messages.validationGeneric.invalid(val.path).message;
        }

        return true;
    };

    static CNH = (opcoes: { message?: string } = {}): any => async (value: any, val: ValidationResult): Promise<boolean | string> => {
        if (!isCNH(value)) {
            return opcoes.message || messages.validationGeneric.invalid(val.path).message;
        }

        return true;
    };

    // ---------------------------------------------------
    // Funções de validação
    // ---------------------------------------------------

    static isNumber = (opcoes: { message?: string } = {}): any => async (value: any, val: ValidationResult): Promise<boolean | string> => {
        if (typeof value !== "number") {
            return opcoes.message || messages.validationGeneric.invalid(val.path).message;
        }

        return true;
    };

    static isDate = (opcoes: { message?: string } = {}): any => async (value: any, val: ValidationResult): Promise<boolean | string> => {
        if (!(value instanceof Date)) {
            return opcoes.message || messages.validationGeneric.invalid(val.path).message;
        }

        return true;
    };
}

export default new ValidationFuncs();
