import jwt from "jsonwebtoken";
import messages from "../utils/mensagens";
export const AuthMiddleware = async (req, res, next) => {
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
            req.decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        }
        return next();
    }
    catch (err) {
        return res.status(498).json({
            data: [],
            error: true,
            code: 498,
            message: messages.httpCodes[498],
            errors: [messages.auth.invalidToken]
        });
    }
};
