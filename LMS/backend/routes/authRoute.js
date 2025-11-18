import express from "express"
import {login, logOut, resetPassword, sendOtp, signUp, verifyOtp, googleAuth, linkGoogle } from "../controllers/authController.js"
import isAuth from "../middlewares/isAuth.js"

const authRouter = express.Router()

authRouter.post("/signup",signUp)

authRouter.post("/login",login)
authRouter.get("/logout",logOut)
authRouter.post("/sendotp",sendOtp)
authRouter.post("/verifyotp",verifyOtp)
authRouter.post("/resetpassword",resetPassword)
authRouter.post("/google", googleAuth)
authRouter.post("/google/link", isAuth, linkGoogle)


export default authRouter