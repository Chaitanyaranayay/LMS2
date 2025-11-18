import express from "express"
import dotenv from "dotenv"
import connectDb from "./configs/db.js"
import authRouter from "./routes/authRoute.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import userRouter from "./routes/userRoute.js"
import courseRouter from "./routes/courseRoute.js"
import reviewRouter from "./routes/reviewRoute.js"
import paymentRouter from "./routes/paymentRoute.js"
import helmet from "helmet"
import rateLimit from "express-rate-limit"

dotenv.config()

const port = process.env.PORT || 4000
const app = express()

// Security: trust reverse proxy when in production so secure cookies work behind proxies/load balancers
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1)
}

// Basic middlewares
app.use(express.json())
app.use(cookieParser())

// Helmet sets secure HTTP headers
app.use(helmet())

// Rate limiter: basic protection against brute-force & DOS-ish requests
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
})
app.use(limiter)

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))

app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/course", courseRouter)
app.use("/api/review", reviewRouter)
app.use("/api/payment", paymentRouter)

app.get("/", (req, res) => {
    res.send("Hello From Server")
})

app.listen(port, () => {
    console.log("Server Started on port", port)
    connectDb()
})