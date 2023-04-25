import { Router} from "express";
import { dados, transacao } from "../controllers/transação.js";
import autenticacao from "../middlewares/auth.middleware.js";

const transacaoRouter = Router()

transacaoRouter.use(autenticacao)

transacaoRouter.post("/nova-transacao/:type", transacao)

transacaoRouter.get("/home", dados)

export default transacaoRouter