import db from "../database/database.conection.js"
import dayjs from "dayjs"
import transationSchema from "../schemas/transação.schema.js"

export async function transacao (req, res){
    const { value, description } = req.body
    const { type } = req.params
    const validation = transationSchema.validate({ value, description }, { abortEarly: false })
    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message)
        return res.status(422).send(errors)
    }
    
    if (type !== "entrada" && type !== "saida") return res.sendStatus(422)

    try {
        const sessao = res.locals.sessao
        db.collection("transacao").insertOne({ value: Number(value), description, type, user: sessao.userId, date: (Date.now() - 36000000) })
        console.log(sessao.userId)
        res.sendStatus(201)
    } catch (err) {
        res.status(500).send(err.message)
    }
}

export async function dados (req, res){
    
    try {
        const sessao = res.locals.sessao
        const user = await db.collection("cadastro").findOne({ _id: sessao.userId })
        const list = await db.collection("transacao").find({ user: sessao.userId }).toArray()
        list.sort((a, b) => a.date - b.date)
        list.map((e) => e.date = dayjs(e.date).format("DD/MM"))
        res.status(200).send({ username: user.name, operations: list })
    } catch (err) {
        res.status(500).send(err.message)
    }
}