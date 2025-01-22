import { Application, Request, Response } from "express";
import logRoutes from "../middlewares/LogRoutesMiddleware";
import auth from "./authRouter";
import usuarios from "./usuarioRouter";

const routes = (app: Application): void => {
    if (process.env.DEBUGLOG === "true") {
        app.use(logRoutes);
    }

    app.route("/").get((req: Request, res: Response): void => {
        res.status(200).redirect("/docs");
    });

    app.use(auth, usuarios);
};

export default routes;
