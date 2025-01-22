import express, { Request, Response, NextFunction } from "express";
import AuthController from "../controllers/AuthController";
import AuthValidate from "../middlewares/validation/authValidation";
import { wrapException } from "../utils/wrapException";

const router = express.Router();

router.post(
  "/auth/login",
  AuthValidate.loginValidate,
  wrapException(AuthController.logar)
);

export default router;
