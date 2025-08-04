import express from "express";
import { signInValidation, userValidation } from "../middlewares/userValidation.middleware.js";
import { createAccount, forgotPassword, me, signIn, signOut } from "../controllers/auth.controller.js";
import { validateToken } from "../middlewares/auth.middleware.js";

const authRouter = express.Router();

authRouter
.post("/register", userValidation, createAccount)
.post("/login", signInValidation, signIn)
.post("/forgot-password", forgotPassword)

//after being logged in
.post("/logout", validateToken, signOut)
.get("/me", validateToken, me)

export default authRouter;