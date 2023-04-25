import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import router from "../src/routes/index.routes.js"

const app = express()

app.use(cors())
app.use(express.json())
dotenv.config()

app.use(router)
app.listen(process.env.PORT, ()=> console.log(`Aplicação rodando na porta ${process.env.PORT}`))