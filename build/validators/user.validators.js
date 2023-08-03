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
exports.validateTypeInfo = exports.validateSigninInfo = exports.validateActivationInfo = exports.validateResendTokenInfo = exports.validateSignUp = void 0;
const joi_1 = __importDefault(require("joi"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = require("../models/User");
const Publisher_1 = require("../models/Publisher");
const JWTKEY = process.env.JWTKEY || "MYNAME-IS-HELLOWORLD";
const validateSignUp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const signUpSchema = joi_1.default.object({
            email: joi_1.default.string()
                .email()
                .required(),
            password: joi_1.default.string()
                .min(8)
                .max(20)
                .required()
        });
        const value = yield signUpSchema.validateAsync(req.body);
        const { email } = value;
        const existingUser = yield User_1.User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists!",
                data: [],
            });
        }
        next();
    }
    catch (error) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: [],
        });
    }
});
exports.validateSignUp = validateSignUp;
const validateResendTokenInfo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resendTokenSchema = joi_1.default.object({
            email: joi_1.default.string()
                .email()
                .required()
        });
        const value = yield resendTokenSchema.validateAsync(req.body);
        const { email } = value;
        const user = yield User_1.User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "No account exists with this email",
                data: [],
            });
        }
        else if (user.isVerified == 1) {
            return res.status(400).json({
                success: false,
                message: "Your accound is already verified!",
                data: [],
            });
        }
        req.body.user = user;
        next();
    }
    catch (error) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: [],
        });
    }
});
exports.validateResendTokenInfo = validateResendTokenInfo;
const validateActivationInfo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const activationSchema = joi_1.default.object({
            token: joi_1.default.string()
                .required()
        });
        const value = yield activationSchema.validateAsync(req.query);
        const verifyUser = yield User_1.User.findOne({ where: { token: value.token } });
        if (verifyUser === null || verifyUser === void 0 ? void 0 : verifyUser.token) {
            jsonwebtoken_1.default.verify(verifyUser.token, JWTKEY, (err, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
                if (err) {
                    return res.status(400).json({
                        success: false,
                        message: err.message,
                        data: [],
                    });
                }
                req.body.decodedToken = decodedToken;
                req.body.user = verifyUser;
                next();
            }));
        }
        else {
            return res.status(400).json({
                success: false,
                message: `Publisher not found`,
                data: []
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
exports.validateActivationInfo = validateActivationInfo;
const validateSigninInfo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const signinSchema = joi_1.default.object({
            email: joi_1.default.string()
                .email()
                .required(),
            password: joi_1.default.string()
                .min(8)
                .max(30)
                .required()
        });
        const value = yield signinSchema.validateAsync(req.body);
        const user = yield User_1.User.findOne({ where: { email: value.email } });
        if (user) {
            const passMatch = yield bcrypt_1.default.compare(value.password, user.password);
            if (passMatch) {
                if (user.isVerified === 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Please verify your account!",
                        data: [],
                    });
                }
                req.body.user = user;
                next();
            }
            else {
                return res.status(404).json({
                    success: false,
                    message: "Email/Username or Password is incorrect!",
                    data: [],
                });
            }
        }
        else {
            return res.status(404).json({
                success: false,
                message: "Email/Username or Password is incorrect!",
                data: [],
            });
        }
    }
    catch (error) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: ["in validator"],
        });
    }
});
exports.validateSigninInfo = validateSigninInfo;
const validateTypeInfo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const typeSchema = joi_1.default.object({
            type: joi_1.default.string()
                .pattern(/^[a-z]+$/)
                .required(),
            firstName: joi_1.default.string()
                .pattern(/^[a-zA-Z ]+$/)
                .required(),
            lastName: joi_1.default.string()
                .pattern(/^[a-zA-Z ]+$/)
                .required(),
            username: joi_1.default.string()
                .alphanum()
                .min(5)
                .max(30),
            companySite: joi_1.default.string(),
            companyCategory: joi_1.default.string(),
            country: joi_1.default.string(),
            phone: joi_1.default.string(),
            user: joi_1.default.any()
        });
        const value = yield typeSchema.validateAsync(req.body);
        const { type, username, phone } = value;
        if (!['advertiser', 'publisher'].includes(type))
            return res.status(400).json({
                success: false,
                message: "This type of account doesn't exist as of now",
                data: []
            });
        if (username) {
            const checkUsername = yield Publisher_1.Publisher.findOne({ where: { username } });
            if (checkUsername) {
                return res.status(404).json({
                    success: false,
                    message: "User with this username already Exist!",
                    data: [],
                });
            }
        }
        if (phone) {
            const checkPhone = yield User_1.User.findOne({ where: { phone, isPhoneVerified: true } });
            if (checkPhone) {
                return res.status(404).json({
                    success: false,
                    message: "User with this phone number already Exist!",
                    data: [],
                });
            }
        }
        next();
    }
    catch (error) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: [],
        });
    }
});
exports.validateTypeInfo = validateTypeInfo;
