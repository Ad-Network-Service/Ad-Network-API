import { Router } from "express";

import userRouter from "./user.route"

const router = Router();

router.get("/", (req, res) => {
	res.status(200).send("Api is working");
});

router.use("/user", userRouter)

export default router;