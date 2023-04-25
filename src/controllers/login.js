import db from "../database/database.conection.js"
import bcrypt from "bcrypt"
import { v4 } from "uuid"
import{ loginSchema, cadastroSchema} from "../schemas/login.schema.js"

export async function cadastro(req, res) {

    const { name, email, password } = req.body
    const validation = cadastroSchema.validate({ name, email, password }, { abortEarly: false })
    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message)
        return res.status(422).send(errors)
    }
    try {
        const isConflict = await db.collection("cadastro").findOne({ email })
        if (isConflict) return res.status(409).send("Esse email já está cadastrado! Use outro email!")
        const cryptPassword = bcrypt.hashSync(password, 10)
        await db.collection("cadastro").insertOne({ name, email, password: cryptPassword })
        res.sendStatus(201)
    } catch (err) {
        res.status(500).send(err.message)
    }
}

export async function login (req, res){
    const { email, password } = req.body
    const validation = loginSchema.validate({ email, password }, { abortEarly: false })
    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message)
        return res.status(422).send(errors)
    }
    const token = v4()
    try {
        const existEmail = await db.collection("cadastro").findOne({ email })

        if (!existEmail) return res.status(404).send("Email incorreto!")
        const myPassword = bcrypt.compareSync(password, existEmail.password)

        if (!myPassword) return res.status(401).send("Senha incorreta!")

        await db.collection("sessoes").insertOne({ token, userId: existEmail._id })
        res.status(200).send(token)
    } catch (err) {
        res.status(500).send(err.message)
    }
}