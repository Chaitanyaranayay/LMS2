import express from "express"
import dotenv from "dotenv"
import connectDb from "./configs/db.js"
import authRouter from "./routes/authRoute.js"
import cookieParser from "cookie-parser"
import fs from 'fs'
import https from 'https'
import cors from "cors"
import userRouter from "./routes/userRoute.js"
import courseRouter from "./routes/courseRoute.js"
import reviewRouter from "./routes/reviewRoute.js"
import paymentRouter from "./routes/paymentRoute.js"
import aiRouter from "./routes/aiRoute.js"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import bodyParser from 'body-parser'

dotenv.config()

const port = process.env.PORT || 4000
const app = express()

// IMPORTANT: Razorpay webhooks require the raw request body to compute signature.
// We register a route-level raw parser for the webhook path BEFORE the JSON parser
// so that `/api/payment/webhook` receives the raw Buffer in `req.body`.
app.use('/api/payment/webhook', bodyParser.raw({ type: '*/*' }))

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
    origin: ["http://localhost:5173", "https://localhost:5173"],
    credentials: true,
}))

app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/course", courseRouter)
app.use("/api/review", reviewRouter)
app.use("/api/payment", paymentRouter)
app.use("/api/ai", aiRouter)

app.get("/", (req, res) => {
    res.send("Hello From Server")
})

// Start server: prefer HTTPS when cert files are provided via env
const startServer = async () => {
    try {
        await connectDb()

        const sslKeyPath = process.env.SSL_KEY_PATH
        const sslCertPath = process.env.SSL_CERT_PATH

        if (sslKeyPath && sslCertPath && fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath)) {
            const key = fs.readFileSync(sslKeyPath)
            const cert = fs.readFileSync(sslCertPath)
            https.createServer({ key, cert }, app).listen(port, () => {
                console.log(`HTTPS Server started on port ${port}`)
            })
        } else {
            app.listen(port, () => {
                console.log("HTTP Server Started on port", port)
            })
        }
    } catch (err) {
        console.error('Failed to start server:', err)
        process.exit(1)
    }
}

startServer()