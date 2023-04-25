import { Router } from "express";
import { cadastro, login } from "../controllers/login.js";

const loginRouter = Router()

loginRouter.post("/cadastro", cadastro)

loginRouter.post("/", login)
export default loginRouter