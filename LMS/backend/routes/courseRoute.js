import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { createCourse, createLecture, editCourse, editLecture, getCourseById, getCourseLecture, getCourseWithProgress, getCreatorById, getCreatorCourses, getPublishedCourses, removeCourse, removeLecture } from "../controllers/courseController.js"
import { markLectureCompleted } from "../controllers/courseController.js"
import upload from "../middlewares/multer.js"

let courseRouter = express.Router()

courseRouter.post("/create",isAuth,createCourse)
courseRouter.get("/getpublishedcourses",getPublishedCourses)
courseRouter.get("/getcourse/:courseId",getCourseById) // Public endpoint to get course with lectures
courseRouter.get("/getcreatorcourses",isAuth,getCreatorCourses)
courseRouter.post("/editcourse/:courseId",isAuth,upload.single("thumbnail"),editCourse)
courseRouter.get("/:courseId/progress",isAuth,getCourseWithProgress)
courseRouter.post("/:courseId/lecture/:lectureId/complete", isAuth, markLectureCompleted)
courseRouter.delete("/removecourse/:courseId",isAuth,removeCourse)
courseRouter.post("/createlecture/:courseId",isAuth,createLecture)
courseRouter.get("/getcourselecture/:courseId",isAuth,getCourseLecture)
courseRouter.post("/editlecture/:lectureId",isAuth,upload.single("videoUrl"),editLecture)
courseRouter.delete("/removelecture/:lectureId",isAuth,removeLecture)
courseRouter.post("/getcreator",isAuth,getCreatorById)

export default courseRouter
