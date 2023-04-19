import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import Joi from "joi"
import { MongoClient, ObjectId } from "mongodb"
import bcrypt from "bcrypt"
import { v4 } from "uuid"

const app = express()

app.use(cors())
app.use(express.json())
dotenv.config()

const cadastroSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(3).required()
})

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
})

const transationSchema = Joi.object({
    value: Joi.number().precision(2).required().min(0),
    description: Joi.string().required()
})

let db
const mongoClient = new MongoClient(process.env.DATABASE_URL)
mongoClient.connect()
    .then(() => db = mongoClient.db())
    .catch((err) => console.log(err.message))

app.post("/cadastro", async(req, res)=>{
    const{name, email, password} = req.body
    const validation = cadastroSchema.validate({name, email, password}, {abortEarly:false})
    if(validation.error){
        const errors = validation.error.details.map((detail) => detail.message)
        return res.status(422).send(errors)
    }
    try{
        const isConflict = await db.collection("cadastro").findOne({email})
        if(isConflict) return res.status(409).send("Esse email já está cadastrado! Use outro email!")
        const cryptPassword = bcrypt.hashSync(password, 10)
        await db.collection("cadastro").insertOne({name, email, password:cryptPassword})
        console.log({email, name, cryptPassword})
        res.sendStatus(201)
    } catch(err){
        res.status(500).send(err.message)
    }
})

app.post("/", async(req, res)=>{
    const {email, password} = req.body
    const validation = loginSchema.validate({email, password}, {abortEarly: false})
    if(validation.error){
        const errors = validation.error.details.map((detail) => detail.message)
        return res.status(422).send(errors)
    }
    const token = v4()
    try{
        const existEmail = await db.collection("cadastro").findOne({email})

        if(!existEmail) return res.status(404).send("Email incorreto!")
        const myPassword = bcrypt.compareSync(password, existEmail.password)

        if(!myPassword)return res.status(401).send("Senha incorreta!")

        await db.collection("sessoes").insertOne({token, userId:existEmail._id})
        res.status(200).send(token)
    } catch(err){
        res.status(500).send(err.message)
    }
})

app.post("/nova-transacao/:type", async(req, res)=>{
    const {value, description} = req.body
    const {type} = req.params
    const {authorization} = req.headers
    const token = authorization?.replace('Bearer ', '')
    if(!token) return res.sendStatus(401)
    const validation = transationSchema.validate({value, description}, {abortEarly:false})
    if(validation.error){
        const errors = validation.error.details.map((detail)=>detail.message)
        return res.status(422).send(errors)
    }
    if(type!=="entrada"&&type!=="saida")return res.sendStatus(422)

    try{
        const authorize = await db.collection("sessoes").findOne({token})
        if(!authorize) return res.status(401).send("Usuário não encontrado!")
        db.collection("transacao").insertOne({value, description, type, user:authorize.userId})
        console.log(authorize.userId)
        res.sendStatus(201)
    } catch(err){
        res.status(500).send(err.message)
    }
})

app.get("/home", async(req, res)=>{
    const {authorization} = req.headers
    const token = authorization?.replace("Bearer ", "") 
    if(!token) return res.sendStatus(401)
})









const PORT = 5000
app.listen(PORT, ()=> console.log(`Aplicação rodando na porta ${PORT}`))