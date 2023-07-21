import { Router } from "express";
import { validateActivationInfo, validateForgetPassInfo, validateResendTokenInfo, validateResetPassInfo, validateSignUp, validateSigninInfo, validateUpdatePublisherInfo, validateVerifyPassInfo } from "../validators/publisher.validators";
import { activateAccount, deletePublisher, forgetPass, getUserData, resendToken, resetPass, signin, signout, signup, updatePublisher, verifyPass } from "../controllers/publisher.controller";
import { verifyToken } from "../middleware/publisher.middleware";

const router = Router();

router.post("/signup", validateSignUp, signup);
router.post("/resend-token", validateResendTokenInfo, resendToken);
router.get("/verify",validateActivationInfo, activateAccount);
router.post("/signin", validateSigninInfo, signin);
router.get("/private-info", verifyToken, getUserData);
router.post("/reset-pass", [verifyToken, validateResetPassInfo], resetPass);
router.get("/signout", verifyToken, signout);
router.post("/forgot-pass", validateForgetPassInfo, forgetPass);
router.post("/verify-forgot", validateVerifyPassInfo, verifyPass);
router.put("/update", [verifyToken, validateUpdatePublisherInfo], updatePublisher);
router.delete("/delete", verifyToken, deletePublisher);


export default router;