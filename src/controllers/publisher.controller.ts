import { RequestHandler } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { Publisher } from "../models/Publisher";

const { AUTHEMAIL, AUTHPASSWORD } = process.env;
const JWTKEY: string = process.env.JWTKEY || "MYNAME-IS-HELLOWORLD";

export const signup: RequestHandler = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password } = req.body;
        const sPass = await securePass(password);

        const token = jwt.sign({ email }, JWTKEY, {
            expiresIn: "2h",
        });
        const newPublisher = new Publisher({
            firstName,
            lastName,
            email,
            phone,
            password : sPass,
            token,
        });
        const publisher = await newPublisher.save();
        if (publisher) {
            // const isMailSent = await sendVerifyMail(firstName, email, token);

            // if (isMailSent)
                return res.status(201).json({
                    success: true,
                    message: `${publisher.firstName} your Registraton has been successfull please verify your mail`,
                    data: [
                        {
                            FirstName: publisher.firstName,
                            Email: publisher.email,
                            Token: token
                        },
                    ],
                });
            // return res.status(400).json({
            //     success: false,
            //     message: "Some error occured. Please try again later.",
            //     data: []
            // })
        } else {
            return res.status(400).json({
                success: false,
                message: "Your registration has been failed!",
                data: [],
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

export const resendToken: RequestHandler = async (req, res) => {
    try {
        const { publisher } = req.body;
        const token = jwt.sign({ username: publisher.username, email: publisher.email }, JWTKEY, {
            expiresIn: "2h",
        });
        await Publisher.update(
            {
                token
            },
            {
                where: { id: publisher.id }
            },
        );
        // const isMailSent = await sendVerifyMail(publisher.firstName, publisher.email, token);

        // if (isMailSent)
            return res.status(201).json({
                success: true,
                message: `${publisher.firstName} your Registraton has been successfull please verify your mail`,
                data: [
                    {
                        FirstName: publisher.firstName,
                        Email: publisher.email,
                        Token: token
                    },
                ],
            });
        // return res.status(400).json({
        //     success: false,
        //     message: "Some error occured. Please try again later.",
        //     data: []
        // })

    } catch (error: any) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: [],
        });
    }
};

export const activateAccount: RequestHandler = async (req: any, res) => {
    try {
        const email = req.body.decodedToken?.email;
        const updatedInfo = await Publisher.update(
            {
                isVerified: 1,
                token: ""
            },
            {
                where: { email }
            },
        );
        if (updatedInfo)
            return res.status(201).json({
                success: true,
                message: `Hurray! ${req.body.publisher.firstName} Your Accound has been Verified!`,
                data: []
            });
        return res.status(400).json({
            success: false,
            message: `Some error occured`,
            data: []
        });
    } catch (error: any) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: [],
        });
    }
};

export const signin: RequestHandler = async (req, res) => {
    try {
        const { publisher } = req.body;
        const token = jwt.sign(
            { id: publisher.id, createdAt: publisher.createdAt },
            JWTKEY,
            {
                expiresIn: 86400 /*==== Expires in 24 hrs ====*/,
            },
        );
        await Publisher.update(
            { signedToken: token },
            { where: { email: publisher.email } },
        );

        return res.status(200).json({
            success: true,
            message: ` ${publisher.firstName} Loggedin SuccessFully!`,
            data: [
                {
                    name: publisher.firstName,
                    email: publisher.email,
                    token
                },
            ],
        });
    } catch (error: any) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: [],
        });
    }
};

export const getUserData: RequestHandler = async (req, res) => {
    try {
        const { publisher } = req.body;
        const getPublisher = await Publisher.findAll({
            attributes: { exclude: ['id','token', 'isVerified', 'signedToken', 'password'] },
            where: { id: publisher.id }
        })
        return res.status(200).json({
            success: true,
            message: `Data of user fetched successfully`,
            data: [
                getPublisher
            ],
        });
    } catch (error: any) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: [],
        });
    }
}

export const resetPass: RequestHandler = async (req, res) => {
    try {
        const { publisher, newPassword } = req.body;
        const sPassword = await securePass(newPassword);
        await Publisher.update(
            { password: sPassword },
            { where: { email: publisher.email } },
        );
        return res.status(200).json({
            success: true,
            message: "Password Changed Succesfully!",
            data: []
        });
    } catch (error: any) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: [],
        });
    }
};

export const forgetPass: RequestHandler = async (req, res) => {
    try {
        const { email, publisher } = req.body;
        const token = jwt.sign({ email }, JWTKEY, {
            expiresIn: "1h",
        });
        await Publisher.update(
            { token },
            { where: { email } },
        );
        // const isMailSent = await sendResetPassMail(publisher.firstName, publisher.email, token);

        // if (isMailSent)
            return res.status(200).json({
                success: true,
                message: "Please check your mail for reset your password!",
                data: [
                    {
                        Token: token
                    }
                ]
            });
        // return res.status(400).json({
        //     success: false,
        //     message: "Some error occured. Please try again later.",
        //     data: []
        // })
    } catch (error: any) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: [],
        });
    }
};

export const signout: RequestHandler = async (req, res) => {
    try {
        await Publisher.update(
            { signedToken: "" },
            { where: { id: req.body.publisher.id } },
        );

        return res.status(200).json({
            success: true,
            message: "Publisher SuccessFully Logout",
            data: []
        });
    } catch (error: any) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: [],
        });
    }
};

export const verifyPass: RequestHandler = async (req, res) => {
    try {
        const { publisher, password } = req.body;

        jwt.verify(publisher.token, JWTKEY, async (err: any, decodedToken: any) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message,
                    data: [],
                });
            }
            const forgetSecPass = await securePass(password);
            await Publisher.update(
                { password: forgetSecPass, token: "" },
                {
                    where: { id: publisher.id }
                },
            );
            return res.status(201).json({
                success: true,
                msg: "Hurray! Your Password has been Changed",
                data: [],
            });
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
            data: [],
        });
    }
};

export const updatePublisher: RequestHandler = async (req, res) => {
    try {
        const { firstName, lastName, email, publisher } = req.body;

        await Publisher.update(
            {
                firstName, lastName, email
            },
            {
                where: { id: publisher?.id }
            }
        )

        return res.status(200).json({
            success: true,
            message: "Publisher data updated successfully",
            data: [],
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
            data: [],
        });
    }
}

export const deletePublisher: RequestHandler = async (req, res) => {
    try {
        const { publisher } = req.body;

        await Publisher.destroy(
            {
                where: { id: publisher.id }
            }
        )

        return res.status(200).json({
            success: true,
            message: "Publisher deleted successfully",
            data: [],
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
            data: [],
        });
    }
}

const securePass = async (password: string) => {
    try {
        const hashPass: string = await bcrypt.hash(password.toString(), 10);

        return hashPass;
    } catch (error: any) {
        console.log(error.message);
    }
};

const sendVerifyMail = async (name: string, email: string, token: string) => {
    try {
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: AUTHEMAIL,
                pass: AUTHPASSWORD,
            },
        });
        console.log({
            host: "smtppro.zoho.com",
            port: 465,
            secure: true,
            auth: {
                user: AUTHEMAIL,
                pass: AUTHPASSWORD,
            },
        })
        const mailOption = {
            from: AUTHEMAIL,
            to: email,
            subject: "For Verification Mail ✔",
            html: `<p>Hello ${name} ,
				Here is your token ${token}.</p>`,
        };
        transporter.sendMail(mailOption, (err, mailed) => {
            if (err) {
                console.log(err.message);
                return false;
            } else {
                console.log(`Email has been Sent :- `, mailed.response);
                return true;
            }
        });
    } catch (error: any) {
        console.log(error.message);
        return false;
    }
};
const sendResetPassMail = async (name: string, email: string, token: string) => {
    try {
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: AUTHEMAIL,
                pass: AUTHPASSWORD,
            },
        });

        const mailOption = {
            from: AUTHEMAIL,
            to: email,
            subject: "For Reset Password ✔",
            html: `<p>Hello ${name} ,
                Here is your token ${token}.</p>`,
        };
        transporter.sendMail(mailOption, (err, mailed) => {
            if (err) {
                console.log(err.message);
                return false;
            } else {
                console.log(`Email has been Sent :- `, mailed.response);
            }
        });
        return true;
    } catch (error: any) {
        console.log(error.message);
        return false;
    }
};