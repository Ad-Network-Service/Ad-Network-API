import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { securePass } from "../helpers/auth.helper";
import { User } from "../models/User";
import { Advertiser } from "../models/Advertiser";
import { Publisher } from "../models/Publisher";
const JWTKEY: string = process.env.JWTKEY || "MYNAME-IS-HELLOWORLD";

export const signup: RequestHandler = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, type, password } = req.body;
        const sPass = await securePass(password);

        const token = jwt.sign({ email }, JWTKEY, {
            expiresIn: "2h",
        });
        const newUser = new User({
            firstName,
            lastName,
            email,
            phone,
            type,
            password : sPass,
            token
        });
        const user = await newUser.save();
        if (user) {
            // const isMailSent = await sendVerifyMail(firstName, email, token);

            // if (isMailSent)
            res.setHeader("Token", token)
            return res.status(201).json({
                success: true,
                message: `Your Registraton has been successfull please verify your mail`,
                data: [
                    {
                        Email: user.email
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
        // const isMailSent = await sendVerifyMail(publisher.firstName, publisher.email, token);

        // if (isMailSent)
        res.setHeader("Token", token)
        return res.status(201).json({
            success: true,
            message: `Verification code sent succesfull, please verify your mail`,
            data: [
                {
                    Email: user.email
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
        const updatedInfo = await User.update(
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
                message: `Hurray! Your Accound has been Verified!`,
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