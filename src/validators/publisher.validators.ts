import { RequestHandler } from "express";
import Joi from "joi"
import { Publisher } from "../models/Publisher";

export const validateSignUp: RequestHandler = async (req, res, next) => {
    try {
        const signUpSchema = Joi.object({
            firstName: Joi.string()
                .pattern(/^[a-zA-Z ]+$/)
                .required(),

            lastName: Joi.string()
                .pattern(/^[a-zA-Z ]+$/),

            email: Joi.string()
                .email()
                .required(),

            password: Joi.string()
                .min(8)
                .max(20)
                .required(),

            phone: Joi.string()
        })

        const value = await signUpSchema.validateAsync(req.body);
        const { email, phone } = value;
        const existingUser = await Publisher.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists!",
                data: [],
            });
        }
        if(phone) {
            const checkPhone = await Publisher.findOne({ where: { phone } });
            if (checkPhone) {
                return res.status(404).json({
                    success: false,
                    message: "User with this Phone number already Exist!",
                    data: [],
                });
            }
        }

        next();

    } catch (error: any) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: [],
        });
    }
}