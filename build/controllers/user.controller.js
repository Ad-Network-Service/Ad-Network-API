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
const auth_helper_1 = require("../helpers/auth.helper");
const User_1 = require("../models/User");
const Advertiser_1 = require("../models/Advertiser");
const Publisher_1 = require("../models/Publisher");
const JWTKEY = process.env.JWTKEY || "MYNAME-IS-HELLOWORLD";
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstName, lastName, email, phone, type, password } = req.body;
        const sPass = yield (0, auth_helper_1.securePass)(password);
        const token = jsonwebtoken_1.default.sign({ email }, JWTKEY, {
            expiresIn: "2h",
        });
        const newUser = new User_1.User({
            firstName,
            lastName,
            email,
            phone,
            type,
            password: sPass,
            token
        });
        const user = yield newUser.save();
        if (user) {
            // const isMailSent = await sendVerifyMail(firstName, email, token);
            // if (isMailSent)
            res.setHeader("Token", token);
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
        // const isMailSent = await sendVerifyMail(publisher.firstName, publisher.email, token);
        // if (isMailSent)
        res.setHeader("Token", token);
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
