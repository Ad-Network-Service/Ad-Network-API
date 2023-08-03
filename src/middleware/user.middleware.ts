import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

const JWTKEY: string = process.env.JWTKEY || "MYNAME-IS-HELLOWORLD";

export const verifyToken: RequestHandler = async (req, res, next) => {
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
        jwt.verify(token, JWTKEY, async (err, decoded: any) => {
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
            const checkUser = await User.findOne({ where: { signedToken: token, id } });
            if (!checkUser) {
                return res.status(400).json({
                    sucess: false,
                    message: "Authentication Failed ",
                    data: [],
                });
            }
            req.body.user = checkUser;
            next();
        });

    } catch (error: any) {
        return res.status(500)
            .json({
                success: false, message: error.message, data: []
            });
    }
}