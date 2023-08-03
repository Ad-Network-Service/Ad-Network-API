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
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const JWTKEY = process.env.JWTKEY || "MYNAME-IS-HELLOWORLD";
const verifyToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const header = req.header("Authorization");
        if (header === undefined) {
            return res.status(400).json({
                sucess: false,
                message: "Unauthorized Request!",
                data: [],
            });
        }
        const token = header.replace("Bearer ", "");
        jsonwebtoken_1.default.verify(token, JWTKEY, (err, decoded) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                return res.status(400).json({
                    sucess: false,
                    message: err.message,
                    data: [],
                });
            }
            const id = decoded.id;
            if (!id) {
                return res.status(400).json({
                    sucess: false,
                    message: "Authentication Failed ",
                    data: [],
                });
            }
            const checkUser = yield User_1.User.findOne({ where: { signedToken: token, id } });
            if (!checkUser) {
                return res.status(400).json({
                    sucess: false,
                    message: "Authentication Failed ",
                    data: [],
                });
            }
            req.body.user = checkUser;
            next();
        }));
    }
    catch (error) {
        return res.status(500)
            .json({
            success: false, message: error.message, data: []
        });
    }
});
exports.verifyToken = verifyToken;
