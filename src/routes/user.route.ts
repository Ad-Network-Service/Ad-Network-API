import { Router } from "express";
import { validateActivationInfo, validateResendTokenInfo, validateSignUp, validateSigninInfo, validateTypeInfo } from "../validators/user.validators";
import { activateAccount, resendToken, setAccountType, signin, signup } from "../controllers/user.controller";
import { verifyToken } from "../middleware/user.middleware";

const router = Router();

router.post("/signup", validateSignUp, signup);
router.post("/resend-token", validateResendTokenInfo, resendToken);
router.get("/verify",validateActivationInfo, activateAccount);
router.post("/signin", validateSigninInfo, signin);
router.post("/type", [verifyToken, validateTypeInfo], setAccountType)
// router.get("/user-public", validatePublicPublisherInfo, getPublicPublisherData);
// router.get("/private-info", verifyToken, getUserData);
// router.post("/reset-pass", [verifyToken, validateResetPassInfo], resetPass);
// router.get("/signout", verifyToken, signout);
// router.post("/forgot-pass", validateForgetPassInfo, forgetPass);
// router.post("/verify-forgot", validateVerifyPassInfo, verifyPass);
// router.put("/update", [verifyToken, validateUpdatePublisherInfo], updatePublisher);
// router.delete("/delete", verifyToken, deletePublisher);


export default router;