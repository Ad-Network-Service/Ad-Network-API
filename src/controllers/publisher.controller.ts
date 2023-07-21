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