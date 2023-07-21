import { Router } from "express";

import publisherRoute from './publisher.route'

const router = Router();

router.use('/publisher', publisherRoute)

export default router;