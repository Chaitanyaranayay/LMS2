import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

export default function AISearch() {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [mode, setMode] = useState("gemini")

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    
    setLoading(true)
    setSearched(true)
    try {
      const { data } = await axios.post("/api/ai/search", { query })
      console.log("Search results:", data)
      setResults(data.results || [])
      setMode(data.mode || "keyword")
    } catch (err) {
      console.error("Search error:", err)
      alert("Search failed: " + err.message)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate("/")} 
            className="mb-4 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition flex items-center gap-2 text-gray-700"
          >
            ← Back to Home
          </button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🎓 AI Course Finder</h1>
          <p className="text-gray-600">Powered by Google Gemini AI - Searches courses from your LMS database</p>
          <div className="mt-3 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-blue-800">
              💡 <strong>How it works:</strong> Gemini AI analyzes courses already in your database and matches them to your query. 
              To see results, make sure you have courses added in your LMS!
            </p>
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="What do you want to learn? (e.g., 'React development', 'Python programming')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={loading}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-lg"
              />
              <button 
                type="submit" 
                disabled={loading || !query.trim()}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? "🔄 Searching..." : "🔍 Search"}
              </button>
            </div>
          </div>
        </form>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mb-4"></div>
            <p className="text-xl font-semibold text-gray-700">🤖 Gemini AI is analyzing...</p>
          </div>
        )}

        {/* No Results */}
        {searched && !loading && results.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
            <p className="text-xl font-semibold text-yellow-800 mb-2">No courses found</p>
            <p className="text-yellow-700">Try adding courses to your LMS or use different keywords</p>
          </div>
        )}

        {/* Search Info */}
        {searched && !loading && results.length > 0 && (
          <div className="flex justify-between items-center mb-6">
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold">
              {mode === "gemini" ? "🤖 Gemini AI Active" : "🔍 Keyword Search"}
            </span>
            <span className="text-gray-600 font-medium">{results.length} course(s) found</span>
          </div>
        )}

        {/* Results Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((course, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-gray-800 flex-1">{course.title}</h3>
                {course.relevance && (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    course.relevance === 'high' ? 'bg-green-100 text-green-800' :
                    course.relevance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {course.relevance}
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 mb-4 line-clamp-3">{course.description}</p>
              
              {course.category && (
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    📚 {course.category}
                  </span>
                </div>
              )}

              {course.lectures && course.lectures.length > 0 && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">📝 Lectures Preview:</h4>
                  <ul className="space-y-1">
                    {course.lectures.map((lecture, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                        <span className="flex-1">{lecture.lectureTitle}</span>
                        {lecture.isPreviewFree && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold">
                            Free
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button 
                className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition"
                onClick={() => navigate(`/viewcourse/${course.courseId || course._id}`)}
              >
                View Course →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
