import cors from "cors";
import express from "express";
import db from "./config/db_config";
import routes from "./routes/index";
const app = express();
// Conectar ao banco de dados
db.conectarBanco();
// Middleware e rotas
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
routes(app);
export default app;
