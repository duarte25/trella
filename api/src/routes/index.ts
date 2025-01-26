import logRoutes from "../middlewares/LogRoutesMiddleware";
import { Application, Request, Response } from "express";
import usuarios from "./usuarioRouter";
import boards from "./boardRouter";
import tarefas from "./tarefaRouter";
import auth from "./authRouter";

const routes = (app: Application): void => {
    if (process.env.DEBUGLOG === "true") {
        app.use(logRoutes);
    }

    app.route("/").get((req: Request, res: Response): void => {
        res.status(200).redirect("/docs");
    });

    app.use(
        auth,
        usuarios,
        boards,
        tarefas
    );
};

export default routes;
