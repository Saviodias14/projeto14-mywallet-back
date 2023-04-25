import Joi from "joi";

const transationSchema = Joi.object({
    value: Joi.number().precision(2).required().min(0),
    description: Joi.string().required()
})

export default transationSchema