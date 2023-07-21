import { RequestHandler } from "express";
import Joi from "joi"
import { Publisher } from "../models/Publisher";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWTKEY: string = process.env.JWTKEY || "MYNAME-IS-HELLOWORLD";

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

export const validateResendTokenInfo: RequestHandler = async (req, res, next) => {
    try {
        const resendTokenSchema = Joi.object({
            email: Joi.string()
                .email()
                .required()
        })

        const value = await resendTokenSchema.validateAsync(req.body);
        const { email } = value;
        const publisher = await Publisher.findOne({ where: { email } });
        if (!publisher) {
            return res.status(400).json({
                success: false,
                message: "No account exists with this email",
                data: [],
            });
        }
        else if (publisher.isVerified == 1) {
            return res.status(400).json({
                success: false,
                message: "Your accound is already verified!",
                data: [],
            });
        }
        req.body.publisher = publisher;
        next();

    } catch (error: any) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: [],
        });
    }
};

export const validateActivationInfo: RequestHandler = async (req, res, next) => {
    try {
        const activationSchema = Joi.object({
            token: Joi.string()
                .required()
        })
        const value = await activationSchema.validateAsync(req.query);
        const verifyPublisher = await Publisher.findOne({ where: { token: value.token } });
        if (verifyPublisher?.token) {
            jwt.verify(verifyPublisher.token, JWTKEY, async (err, decodedToken: any) => {
                if (err) {
                    return res.status(400).json({
                        success: false,
                        message: err.message,
                        data: [],
                    });
                }

                req.body.decodedToken = decodedToken;
                req.body.publisher = verifyPublisher;
                next();
            });
        }
        else {
            return res.status(400).json({
                success: false,
                message: `Publisher not found`,
                data: []
            });
        }
    } catch (error: any) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: [],
        });
    }
};

export const validateSigninInfo: RequestHandler = async (req, res, next) => {
    try {
        const signinSchema = Joi.object({
            email: Joi.string()
                .email()
                .required(),

            password: Joi.string()
                .min(8)
                .max(30)
                .required()
        })
        const value = await signinSchema.validateAsync(req.body)
        const publisher = await Publisher.findOne({ where: { email: value.email } });
        if (publisher) {
            const passMatch = await bcrypt.compare(value.password, publisher.password);
            if (passMatch) {
                if (publisher.isVerified === 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Please verify your account!",
                        data: [],
                    });
                }
                req.body.publisher = publisher;
                next();
            } else {
                return res.status(404).json({
                    success: false,
                    message: "Email/Username or Password is incorrect!",
                    data: [],
                });
            }
        } else {
            return res.status(404).json({
                success: false,
                message: "Email/Username or Password is incorrect!",
                data: [],
            });
        }
    } catch (error: any) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: ["in validator"],
        });
    }
};

export const validateResetPassInfo: RequestHandler = async (req, res, next) => {
    try {
        const resetPassSchema = Joi.object({
            publisher: Joi.any()
                .required(),

            oldPassword: Joi.string()
                .min(8)
                .max(30)
                .required(),

            newPassword: Joi.string()
                .min(8)
                .max(30)
                .required(),
        })
        const value = await resetPassSchema.validateAsync(req.body);
        const passMatch = await bcrypt.compare(
            value.oldPassword,
            value.publisher.password,
        );
        if (!passMatch) {
            return res.status(404).json({
                success: false,
                message: " Sorry your Password is Incorrect! ",
                data: [],
            });
        }
        next();
    } catch (error: any) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: [],
        });
    }
};

export const validateForgetPassInfo: RequestHandler = async (req, res, next) => {
    try {
        const forgetPassSchema = Joi.object({
            email: Joi.string()
                .email()
                .required()
        })
        const value = await forgetPassSchema.validateAsync(req.body);
        const publisher = await Publisher.findOne({ where: { email: value.email } });
        if (!publisher) {
            return res.status(480).json({
                success: false,
                message: "Publisher with this email doesn't exist!",
                data: [],
            });
        }
        req.body.publisher = publisher;
        next();
    } catch (error: any) {
        console.log(error)
        return res.status(504).json({
            success: false,
            message: error.message,
            data: [],
        });
    }
};

export const validateVerifyPassInfo: RequestHandler = async (req, res, next) => {
    try {
        const verifyPassSchema = Joi.object({
            token: Joi.string()
                .required(),
            password: Joi.string()
                .min(8)
                .max(30)
                .required(),
        })
        const value = await verifyPassSchema.validateAsync(req.body);
        const publisher = await Publisher.findOne({ where: { token: value.token } });
        if (!publisher) {
            return res.status(400).json({
                success: false,
                message: "User Token is Incorrect Or Invalid! ",
                data: [],
            });
        }
        jwt.verify(publisher.token, JWTKEY, async (err, decodedToken) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message,
                    data: [],
                });
            }
            req.body.publisher = publisher;
            next();
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
            data: [],
        });
    }
};

export const validateUpdatePublisherInfo: RequestHandler = async (req, res, next) => {
    try {
        const updatePublisherSchema = Joi.object({
            publisher: Joi.any()
                .required(),

            firstName: Joi.string()
                .pattern(/^[a-zA-Z ]+$/),

            lastName: Joi.string()
                .pattern(/^[a-zA-Z ]+$/),

            email: Joi.string()
                .email()
        })

        const value = await updatePublisherSchema.validateAsync(req.body);
        const { email } = value;
        if (email) {
            const existingPublisher = await Publisher.findOne({ where: { email } });
            if (existingPublisher) {
                return res.status(400).json({
                    success: false,
                    message: "User with this email already exists!",
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
};