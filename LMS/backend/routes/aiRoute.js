import express from "express"
import { searchCourses } from "../controllers/aiController.js"

const router = express.Router()

router.post("/search", searchCourses)

export default router
