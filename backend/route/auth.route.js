import {Router} from "express";
import {login, signUp} from "../controllor/auth.controllor.js";

const authRouter = Router();

authRouter.post("/login", login)

authRouter.post("/signup", signUp)

export default authRouter;
