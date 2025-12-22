import { GoogleGenerativeAI } from "@google/generative-ai"
import Course from "../models/courseModel.js"
import Lecture from "../models/lectureModel.js"

// Gemini AI search - analyzes user query and finds relevant courses/lectures
const geminiAISearch = async (query) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY not configured, falling back to keyword search")
      return await keywordSearch(query)
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // First, get all courses from DB
    const allCourses = await Course.find({}).select("title description category price").limit(50)
    const coursesJson = JSON.stringify(allCourses)

    // Ask Gemini to understand the user's intent and find matching courses
    const prompt = `You are an intelligent course recommendation system. 
    
User query: "${query}"

Available courses in our LMS:
${coursesJson}

Based on the user's learning interest/query, analyze and return ONLY a JSON array of the MOST RELEVANT courses from the available list above.
Return format: [{"courseId": "...", "title": "...", "description": "...", "category": "...", "relevance": "high/medium/low"}]

Return only JSON, no other text. If no courses match, return empty array [].`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    // Parse JSON response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return await keywordSearch(query)

    const recommendedCourses = JSON.parse(jsonMatch[0])

    // Fetch lectures for top courses
    const coursesWithLectures = await Promise.all(
      recommendedCourses.slice(0, 5).map(async (course) => ({
        ...course,
        lectures: course.courseId ? await Lecture.find({ course: course.courseId }).select("lectureTitle isPreviewFree").limit(3) : []
      }))
    )

    return coursesWithLectures
  } catch (err) {
    console.error("Gemini AI search error:", err)
    return await keywordSearch(query)
  }
}

// Fallback keyword search when AI is unavailable
const keywordSearch = async (query) => {
  try {
    const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 2)
    
    const courses = await Course.find({
      $or: [
        { title: { $regex: keywords.join("|"), $options: "i" } },
        { description: { $regex: keywords.join("|"), $options: "i" } },
        { category: { $regex: keywords.join("|"), $options: "i" } }
      ]
    }).select("title description category price").limit(5)

    // Fetch lectures for each course
    const coursesWithLectures = await Promise.all(
      courses.map(async (course) => ({
        courseId: course._id,
        title: course.title,
        description: course.description,
        category: course.category,
        relevance: "medium",
        lectures: await Lecture.find({ course: course._id }).select("lectureTitle isPreviewFree").limit(3)
      }))
    )

    return coursesWithLectures
  } catch (err) {
    console.error("Keyword search error:", err)
    return []
  }
}

export const searchCourses = async (req, res) => {
  try {
    const { query } = req.body
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: "query required" })
    }

    // Use Gemini AI (with fallback to keyword search)
    const results = await geminiAISearch(query)

    return res.status(200).json({ 
      results, 
      mode: process.env.GEMINI_API_KEY ? "gemini" : "keyword",
      message: results.length === 0 ? "No courses found matching your query" : "Courses found"
    })
  } catch (err) {
    console.error("searchCourses error:", err)
    return res.status(500).json({ message: "Search error" })
  }
}
