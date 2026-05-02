import { Router, type IRouter } from "express";
import healthRouter from "./health";
import clientsRouter from "./clients";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(clientsRouter);

export default router;
