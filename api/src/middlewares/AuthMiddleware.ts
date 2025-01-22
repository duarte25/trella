import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import messages from "../utils/mensagens";

interface DecodedToken {
    id: string;
    nome: string;
    email: string;
    user: string;
}

declare global {
    namespace Express {
        interface Request {
            decodedToken?: DecodedToken;
        }
    }
}

export const AuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        let token = req.headers.authorization;

        if (!token) {
            return res.status(498).json({
                data: [],
                error: true,
                code: 498,
                message: messages.httpCodes[498],
                errors: [messages.auth.invalidToken]
            });
        }

        [, token] = token.split(" ");

        if (process.env.JWT_SECRET) {
            req.decodedToken = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;
        }

        return next();
    } catch (err) {
        return res.status(498).json({
            data: [],
            error: true,
            code: 498,
            message: messages.httpCodes[498],
            errors: [messages.auth.invalidToken]
        });
    }
};
