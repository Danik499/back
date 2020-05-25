import { Router } from "express";
import studRouter from "./asap";

const apiRouter = new Router();

apiRouter.use("/", studRouter);

export default apiRouter;