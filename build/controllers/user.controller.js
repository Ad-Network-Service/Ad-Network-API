"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAccountType = exports.signin = exports.activateAccount = exports.resendToken = exports.signup = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const auth_helper_1 = require("../helpers/auth.helper");
const User_1 = require("../models/User");
const Advertiser_1 = require("../models/Advertiser");
const Publisher_1 = require("../models/Publisher");
const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS, MAIL_ACC, FRONTEND_BASE_URL } = process.env;
const JWTKEY = process.env.JWTKEY || "MYNAME-IS-HELLOWORLD";
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const sPass = yield (0, auth_helper_1.securePass)(password);
        const token = jsonwebtoken_1.default.sign({ email }, JWTKEY, {
            expiresIn: "2h",
        });
        const newUser = new User_1.User({
            email,
            password: sPass,
            token
        });
        const user = yield newUser.save();
        if (user) {
            const isMailSent = yield sendVerifyMail(email, token);
            if (isMailSent) {
                res.setHeader("Token", token); //TODO: can be removed only for testing in postman
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
            });
        }
        else {
            return res.status(400).json({
                success: false,
                message: "Your registration has been failed!",
                data: [],
            });
        }
    }
    catch (error) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: [],
        });
    }
});
exports.signup = signup;
const resendToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user } = req.body;
        const token = jsonwebtoken_1.default.sign({ email: user.email }, JWTKEY, {
            expiresIn: "2h",
        });
        yield User_1.User.update({
            token
        }, {
            where: { id: user.id }
        });
        const isMailSent = yield sendVerifyMail(user.email, token);
        if (isMailSent) {
            res.setHeader("Token", token); //TODO: can be removed only for testing in postman
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
        });
    }
    catch (error) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: [],
        });
    }
});
exports.resendToken = resendToken;
const activateAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const email = (_a = req.body.decodedToken) === null || _a === void 0 ? void 0 : _a.email;
        const updatedInfo = yield User_1.User.update({
            isVerified: 1,
            token: ""
        }, {
            where: { email }
        });
        if (updatedInfo) {
            const user = yield User_1.User.findOne({ where: { email } });
            const token = jsonwebtoken_1.default.sign({ id: user === null || user === void 0 ? void 0 : user.id, createdAt: user === null || user === void 0 ? void 0 : user.createdAt }, JWTKEY, {
                expiresIn: 86400 /*==== Expires in 24 hrs ====*/,
            });
            yield User_1.User.update({ signedToken: token }, { where: { email: user === null || user === void 0 ? void 0 : user.email } });
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
    }
    catch (error) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: [],
        });
    }
});
exports.activateAccount = activateAccount;
const signin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user } = req.body;
        const token = jsonwebtoken_1.default.sign({ id: user.id, createdAt: user.createdAt }, JWTKEY, {
            expiresIn: 86400 /*==== Expires in 24 hrs ====*/,
        });
        yield User_1.User.update({ signedToken: token }, { where: { email: user.email } });
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
    }
    catch (error) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: [],
        });
    }
});
exports.signin = signin;
const setAccountType = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstName, lastName, phone, type, user, companySite, companyCategory, country, username } = req.body;
        if (type == 'advertiser') {
            yield User_1.User.update({
                firstName, lastName, phone, type
            }, {
                where: { id: user === null || user === void 0 ? void 0 : user.id }
            });
            const newAdvertiser = new Advertiser_1.Advertiser({
                userId: user.id,
                website: companySite,
                category: companyCategory,
                country
            });
            const advertiser = yield newAdvertiser.save();
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
            }
            else {
                return res.status(400).json({
                    success: false,
                    message: "Your registration has been failed!",
                    data: [],
                });
            }
        }
        else if (type == 'publisher') {
            yield User_1.User.update({
                firstName, lastName, type
            }, {
                where: { id: user === null || user === void 0 ? void 0 : user.id }
            });
            const newPublisher = new Publisher_1.Publisher({
                userId: user.id,
                username
            });
            const publisher = yield newPublisher.save();
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
            }
            else {
                return res.status(400).json({
                    success: false,
                    message: "Your registration has been failed!",
                    data: [],
                });
            }
        }
    }
    catch (error) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: [],
        });
    }
});
exports.setAccountType = setAccountType;
const sendVerifyMail = (email, token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let transport = nodemailer_1.default.createTransport({
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
            }
            else {
                console.log(`Email has been Sent :- `, mailed.response);
            }
        });
        return true;
    }
    catch (error) {
        console.log(error.message);
        return false;
    }
});
