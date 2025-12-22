import Course from "../models/courseModel.js"

// Mock AI response (no OpenAI key needed for local testing)
const mockAISearch = async (query) => {
  const mockResults = [
    { title: "Advanced React Patterns", description: "Master React hooks, context, and performance optimization", tags: ["React", "Frontend", "Advanced"] },
    { title: "Node.js REST API Masterclass", description: "Build scalable REST APIs with Express and MongoDB", tags: ["Node.js", "Backend", "REST"] },
    { title: "Full-Stack Web Development", description: "Complete guide to building full-stack applications", tags: ["Full-Stack", "Web Dev", "Beginner"] },
    { title: "Database Design with MongoDB", description: "Learn schema design, indexing, and aggregation pipelines", tags: ["MongoDB", "Database", "Data"] },
    { title: "Cloud Deployment on AWS", description: "Deploy your applications to AWS with EC2, S3, and Lambda", tags: ["AWS", "DevOps", "Cloud"] },
  ]
  
  // Simple fuzzy filter based on query keywords
  const keywords = query.toLowerCase().split(/\s+/)
  return mockResults.filter(r => 
    keywords.some(kw => 
      r.title.toLowerCase().includes(kw) || 
      r.description.toLowerCase().includes(kw) ||
      r.tags.some(t => t.toLowerCase().includes(kw))
    )
  ).slice(0, 5)
}

// Real OpenAI integration (optional, requires OPENAI_API_KEY)
const realAISearch = async (query) => {
  try {
    const { Configuration, OpenAIApi } = await import('openai')
    const config = new Configuration({ apiKey: process.env.OPENAI_API_KEY })
    const openai = new OpenAIApi(config)
    
    const prompt = `Given this learning interest: "${query}", suggest 5 online course ideas. 
    Return ONLY a JSON array with objects: { "title": "...", "description": "...", "tags": ["..."] }.
    Be concise. No markdown or extra text.`
    
    const resp = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      max_tokens: 400,
      temperature: 0.7,
    })
    
    const text = resp.data.choices?.[0]?.text?.trim() || "[]"
    return JSON.parse(text)
  } catch (err) {
    console.error("Real AI search error:", err)
    return []
  }
}

export const searchCourses = async (req, res) => {
  try {
    const { query, useAI } = req.body
    if (!query) return res.status(400).json({ message: "query required" })

    const useRealAI = useAI && process.env.OPENAI_API_KEY
    const results = useRealAI 
      ? await realAISearch(query)
      : await mockAISearch(query)

    return res.status(200).json({ results, isReal: useRealAI })
  } catch (err) {
    console.error("searchCourses error:", err)
    return res.status(500).json({ message: "Search error" })
  }
}
