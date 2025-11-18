import { genToken } from "../configs/token.js"
import validator from "validator"

import bcrypt from "bcryptjs"
import User from "../models/userModel.js"
import { OAuth2Client } from 'google-auth-library'

import sendMail from "../configs/Mail.js"


export const signUp=async (req,res)=>{
 
    try {

        let {name,email,password,role}= req.body
        let existUser= await User.findOne({email})
        if(existUser){
            return res.status(400).json({message:"email already exist"})
        }
        if(!validator.isEmail(email)){
            return res.status(400).json({message:"Please enter valid Email"})
        }
        if(password.length < 8){
            return res.status(400).json({message:"Please enter a Strong Password"})
        }
        
        let hashPassword = await bcrypt.hash(password,10)
        let user = await User.create({
            name ,
            email ,
            password:hashPassword ,
            role,
           
            })
        let token = await genToken(user._id)
        // Cookie settings: use secure cookies in production and adjust sameSite
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        }
        res.cookie("token", token, cookieOptions)
        return res.status(201).json(user)

    } catch (error) {
        console.log("signUp error")
        return res.status(500).json({message:`signUp Error ${error}`})
    }
}

export const login=async(req,res)=>{
    try {
        let {email,password}= req.body
        let user= await User.findOne({email})
        if(!user){
            return res.status(400).json({message:"user does not exist"})
        }
        let isMatch =await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(400).json({message:"incorrect Password"})
        }
        let token = await genToken(user._id)
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        }
        res.cookie("token", token, cookieOptions)
        return res.status(200).json(user)

    } catch (error) {
        console.log("login error")
        return res.status(500).json({message:`login Error ${error}`})
    }
}




export const logOut = async(req,res)=>{
    try {
    // Clear cookie; ensure flags match how cookie was set
    res.clearCookie("token", { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict' })
    return res.status(200).json({message:"logOut Successfully"})
    } catch (error) {
        return res.status(500).json({message:`logout Error ${error}`})
    }
}



export const sendOtp = async (req,res) => {
    try {
        const {email} = req.body
        const user = await User.findOne({email})
        if(!user){
            return res.status(404).json({message:"User not found"})
        }
        const otp = Math.floor(1000 + Math.random() * 9000).toString()

        user.resetOtp=otp,
        user.otpExpires=Date.now() + 5*60*1000,
        user.isOtpVerifed= false 

        await user.save()
        await sendMail(email,otp)
        return res.status(200).json({message:"Email Successfully send"})
    } catch (error) {

        return res.status(500).json({message:`send otp error ${error}`})
        
    }
}

export const verifyOtp = async (req,res) => {
    try {
        const {email,otp} = req.body
        const user = await User.findOne({email})
        if(!user || user.resetOtp!=otp || user.otpExpires<Date.now() ){
            return res.status(400).json({message:"Invalid OTP"})
        }
        user.isOtpVerifed=true
        user.resetOtp=undefined
        user.otpExpires=undefined
        await user.save()
        return res.status(200).json({message:"OTP varified "})


    } catch (error) {
         return res.status(500).json({message:`Varify otp error ${error}`})
    }
}

export const resetPassword = async (req,res) => {
    try {
        const {email ,password } =  req.body
         const user = await User.findOne({email})
        if(!user || !user.isOtpVerifed ){
            return res.status(404).json({message:"OTP verfication required"})
        }

        const hashPassword = await bcrypt.hash(password,10)
        user.password = hashPassword
        user.isOtpVerifed=false
        await user.save()
        return res.status(200).json({message:"Password Reset Successfully"})
    } catch (error) {
        return res.status(500).json({message:`Reset Password error ${error}`})
    }
}

// Google Sign-In using Google ID token
export const googleAuth = async (req, res) => {
    try {
        const { id_token } = req.body
        if (!id_token) return res.status(400).json({ message: "id_token missing" })

        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
        const ticket = await client.verifyIdToken({ idToken: id_token, audience: process.env.GOOGLE_CLIENT_ID })
        const payload = ticket.getPayload()
        const { email, name, picture, sub } = payload || {}
        if (!email) return res.status(400).json({ message: "Google account has no email" })

        let user = await User.findOne({ email })
        if (!user) {
            // create a Google user
            const hashPassword = await bcrypt.hash(Date.now().toString(), 10)
            user = await User.create({ name, email, password: hashPassword, isGoogle: true, googleId: sub, photoUrl: picture })
        } else {
            // update existing user with google info if not set
            let changed = false
            if (!user.isGoogle) { user.isGoogle = true; changed = true }
            if (!user.googleId && sub) { user.googleId = sub; changed = true }
            if (!user.photoUrl && picture) { user.photoUrl = picture; changed = true }
            if (changed) await user.save()
        }

        const token = await genToken(user._id)
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        }
        res.cookie("token", token, cookieOptions)
        return res.status(200).json(user)

    } catch (error) {
        console.log("googleAuth error", error)
        return res.status(500).json({ message: `Google auth error ${error}` })
    }
}

// Link a Google account to the currently authenticated user
export const linkGoogle = async (req, res) => {
    try {
        const { id_token } = req.body
        if (!id_token) return res.status(400).json({ message: "id_token missing" })

        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
        const ticket = await client.verifyIdToken({ idToken: id_token, audience: process.env.GOOGLE_CLIENT_ID })
        const payload = ticket.getPayload()
        const { email, sub, picture } = payload || {}
        if (!email) return res.status(400).json({ message: "Google account has no email" })

        // confirm current user
        const currentUserId = req.userId
        if (!currentUserId) return res.status(401).json({ message: "Not authenticated" })

        const user = await User.findById(currentUserId)
        if (!user) return res.status(404).json({ message: "User not found" })

        // If google email does not match user's email, reject linking for safety
        if (user.email !== email) {
            return res.status(400).json({ message: "Google email does not match your account email. Please use the same Google account or update your account email first." })
        }

        // ensure no other user has this googleId/email
        const other = await User.findOne({ googleId: sub })
        if (other && other._id.toString() !== user._id.toString()) {
            return res.status(400).json({ message: "This Google account is already linked with another user." })
        }

        user.isGoogle = true
        user.googleId = sub
        if (picture) user.photoUrl = user.photoUrl || picture
        await user.save()

        // return updated user
        return res.status(200).json(user)
    } catch (error) {
        console.log("linkGoogle error", error)
        return res.status(500).json({ message: `link Google error ${error}` })
    }
}