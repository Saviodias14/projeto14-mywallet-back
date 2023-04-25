import { Router } from "express";
import loginRouter from "./login.routes.js";
import transacaoRouter from "./transação.routes.js";
const router = Router()

router.use(loginRouter)
router.use(transacaoRouter)

export default router