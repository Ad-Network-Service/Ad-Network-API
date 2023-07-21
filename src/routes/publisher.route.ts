import { Router } from "express";
import { validateSignUp } from "../validators/publisher.validators";
import { signup } from "../controllers/publisher.controller";

const router = Router();

router.post("/signup", validateSignUp, signup);

export default router;