import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { securePass } from "../helpers/auth.helper";
import { User } from "../models/User";
import { Advertiser } from "../models/Advertiser";
import { Publisher } from "../models/Publisher";

const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS, MAIL_ACC, FRONTEND_BASE_URL } = process.env;
const JWTKEY: string = process.env.JWTKEY || "MYNAME-IS-HELLOWORLD";

export const signup: RequestHandler = async (req, res) => {
    try {
        const { email, password } = req.body;
        const sPass = await securePass(password);

        const token = jwt.sign({ email }, JWTKEY, {
            expiresIn: "2h",
        });
        const newUser = new User({
            email,
            password : sPass,
            token
        });
        const user = await newUser.save();
        if (user) {
            const isMailSent = await sendVerifyMail(email, token);

            if (isMailSent){
                res.setHeader("Token", token) //TODO: can be removed only for testing in postman
                return res.status(201).json({
                    success: true,
                    message: `Your Registraton has been successfull please verify your mail`,
                    data: [
                        {
                            Email: email
                        },
                    ],
                });
            }
            return res.status(400).json({
                success: false,
                message: "Some error occured. Please try again later.",
                data: []
            })
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
        const { user } = req.body;
        const token = jwt.sign({ email: user.email }, JWTKEY, {
            expiresIn: "2h",
        });
        await User.update(
            {
                token
            },
            {
                where: { id: user.id }
            },
        );
        const isMailSent = await sendVerifyMail(user.email, token);

        if (isMailSent) {
            res.setHeader("Token", token) //TODO: can be removed only for testing in postman
            return res.status(201).json({
                success: true,
                message: `Verification code sent succesfull, please verify your mail`,
                data: [
                    {
                        Email: user.email
                    },
                ],
            });
        }
        return res.status(400).json({
            success: false,
            message: "Some error occured. Please try again later.",
            data: []
        })

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
        const updatedInfo = await User.update(
            {
                isVerified: 1,
                token: ""
            },
            {
                where: { email }
            },
        );
        if (updatedInfo) {
            const user = await User.findOne({ where: { email } });
            const token = jwt.sign(
                { id: user?.id, createdAt: user?.createdAt },
                JWTKEY,
                {
                    expiresIn: 86400 /*==== Expires in 24 hrs ====*/,
                },
            );
            await User.update(
                { signedToken: token },
                { where: { email: user?.email } },
            );

            res.setHeader('Token', token);
            return res.status(201).json({
                success: true,
                message: `Hurray! Your Accound has been Verified!`,
                data: []
            });
        }
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
        const { user } = req.body;
        const token = jwt.sign(
            { id: user.id, createdAt: user.createdAt },
            JWTKEY,
            {
                expiresIn: 86400 /*==== Expires in 24 hrs ====*/,
            },
        );
        await User.update(
            { signedToken: token },
            { where: { email: user.email } },
        );

        res.setHeader('Token', token);

        return res.status(200).json({
            success: true,
            message: `Loggedin SuccessFully!`,
            data: [
                {
                    email: user.email
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

export const setAccountType: RequestHandler = async (req, res) => {
    try {
        const { firstName, lastName, phone, type, user, companySite, companyCategory, country, username } = req.body;
        if(type == 'advertiser') {
            await User.update(
                {
                    firstName, lastName, phone, type
                },
                {
                    where: { id: user?.id }
                }
            )

            const newAdvertiser = new Advertiser({
                userId: user.id,
                website: companySite,
                category: companyCategory,
                country
            });
            const advertiser = await newAdvertiser.save();
            if (advertiser) {
                return res.status(201).json({
                    success: true,
                    message: `You're now registered as an advertiser`,
                    data: [
                        {
                            Email: user.email
                        },
                    ],
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Your registration has been failed!",
                    data: [],
                });
            }
        }

        else if(type == 'publisher') {
            await User.update(
                {
                    firstName, lastName, type
                },
                {
                    where: { id: user?.id }
                }
            )

            const newPublisher = new Publisher({
                userId: user.id,
                username
            });
            const publisher = await newPublisher.save();
            if (publisher) {
                return res.status(201).json({
                    success: true,
                    message: `You're now registered as a publisher`,
                    data: [
                        {
                            Email: user.email
                        },
                    ],
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Your registration has been failed!",
                    data: [],
                });
            }
        }

    } catch (error: any) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: [],
        });
    }
};

const sendVerifyMail = async (email: string, token: string) => {
    try {
        let transport = nodemailer.createTransport({
            host: MAIL_HOST,
            port: Number(MAIL_PORT) | 0,
            auth: {
              user: MAIL_USER,
              pass: MAIL_PASS
            }
        });
        const mailOption = {
            from: MAIL_ACC,
            to: email,
            subject: "Confirm your sign-up with Partner Program ✔",
            html: `<!DOCTYPE html>
            <html>
            <head>
                <title>Account Verification</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: #f4f4f4;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #ffffff;
                        border-radius: 5px;
                        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                    }
                    h1 {
                        color: #333333;
                    }
                    p {
                        color: #555555;
                    }
                    a {
                        display: inline-block;
                        padding: 10px 20px;
                        background-color: #007bff;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 3px;
                    }
                    .footer {
                        margin-top: 20px;
                        text-align: center;
                        color: #999999;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Account Verification</h1>
                    <p>Dear User,</p>
                    <p>Thank you for creating an account with us. Please click the link below to verify your account:</p>
                    <p><a href="${FRONTEND_BASE_URL}verify?token=${token}">Verify Account</a></p>
                    <p>If the link above doesn't work, you can copy and paste the following URL into your browser:</p>
                    <p>${FRONTEND_BASE_URL}verify?token=${token}</p>
                    <p>This link will expire in 2 hours for security reasons.</p>
                    <p>If you did not create an account on our platform, please ignore this email.</p>
                </div>
                <div class="footer">
                    <p>Best regards,<br>Partner Program</p>
                </div>
            </body>
            </html>`,
        };
        transport.sendMail(mailOption, (err, mailed) => {
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