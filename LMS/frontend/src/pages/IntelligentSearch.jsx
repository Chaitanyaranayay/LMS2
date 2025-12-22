import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Nav from '../components/Nav'

export default function IntelligentCourseSearch() {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [includeExternal, setIncludeExternal] = useState(true)
  const [stats, setStats] = useState(null)
  const [mode, setMode] = useState("")

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    
    setLoading(true)
    setSearched(true)
    try {
      const { data } = await axios.post("/api/external/intelligent-search", { 
        query,
        includeExternal 
      })
      
      setResults(data.results || [])
      setStats(data.sources || {})
      setMode(data.mode || 'keyword')
    } catch (err) {
      console.error("Search error:", err)
      alert("Search failed: " + err.message)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleCourseClick = (course) => {
    if (course.isExternal) {
      window.open(course.url, '_blank')
    } else {
      navigate(course.url)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <Nav />
      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate("/allcourses")} 
            className="mb-4 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition flex items-center gap-2 text-gray-700"
          >
            ← Back to All Courses
          </button>
          <h1 className="text-5xl font-bold text-gray-800 mb-3">🚀 Intelligent Course Search</h1>
          <p className="text-lg text-gray-600 mb-4">Search across your LMS + Coursera + YouTube</p>
          
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-5 rounded-xl shadow-lg">
            <p className="text-sm font-semibold mb-2">✨ Powered by AI</p>
            <ul className="text-sm space-y-1">
              <li>🔍 Searches your courses + external platforms</li>
              <li>🤖 AI ranks results by relevance (Gemini)</li>
              <li>🎯 Finds both free and premium courses</li>
              <li>📺 Includes free YouTube tutorials</li>
            </ul>
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="What do you want to learn? (e.g., 'Machine Learning', 'React Hooks', 'Data Science')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={loading}
                className="px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-lg"
              />
              
              <div className="flex items-center justify-between gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeExternal}
                    onChange={(e) => setIncludeExternal(e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-gray-700 font-medium">
                    Include external platforms (Coursera, YouTube)
                  </span>
                </label>
                
                <button 
                  type="submit" 
                  disabled={loading || !query.trim()}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl"
                >
                  {loading ? "🔄 Searching..." : "🔍 Search Courses"}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mb-4"></div>
            <p className="text-2xl font-bold text-gray-700">🤖 AI is analyzing courses...</p>
            <p className="text-gray-500 mt-2">Searching across multiple platforms</p>
          </div>
        )}

        {/* Stats */}
        {searched && !loading && stats && (
          <div className="mb-6 flex gap-4 flex-wrap">
            <div className="bg-white px-6 py-3 rounded-xl shadow-md">
              <span className="text-2xl font-bold text-purple-600">{results.length}</span>
              <span className="text-gray-600 ml-2">Total Results</span>
            </div>
            <div className="bg-white px-6 py-3 rounded-xl shadow-md">
              <span className="text-2xl font-bold text-blue-600">{stats.internal || 0}</span>
              <span className="text-gray-600 ml-2">Your LMS</span>
            </div>
            <div className="bg-white px-6 py-3 rounded-xl shadow-md">
              <span className="text-2xl font-bold text-green-600">{stats.external || 0}</span>
              <span className="text-gray-600 ml-2">External Platforms</span>
            </div>
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl shadow-md">
              <span className="font-bold">
                {mode === 'ai-ranked' ? '🤖 AI Ranked' : '🔍 Keyword Match'}
              </span>
            </div>
          </div>
        )}

        {/* No Results */}
        {searched && !loading && results.length === 0 && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-12 text-center">
            <p className="text-3xl mb-4">😕</p>
            <p className="text-2xl font-bold text-yellow-800 mb-2">No courses found</p>
            <p className="text-yellow-700">Try different keywords or check if external search is enabled</p>
          </div>
        )}

        {/* Results Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((course, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
              onClick={() => handleCourseClick(course)}
            >
              {/* Course Image */}
              {course.thumbnail && (
                <img 
                  src={course.thumbnail} 
                  alt={course.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x225?text=Course'
                  }}
                />
              )}
              
              <div className="p-6">
                {/* Platform Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    course.platform === 'Your LMS' ? 'bg-purple-100 text-purple-700' :
                    course.platform === 'Coursera' ? 'bg-blue-100 text-blue-700' :
                    course.platform === 'YouTube' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {course.isExternal ? '🌐 ' : '🏠 '}{course.platform}
                  </span>
                  
                  {course.price && (
                    <span className="font-bold text-green-600">
                      {typeof course.price === 'number' ? `₹${course.price}` : course.price}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 min-h-[3.5rem]">
                  {course.title}
                </h3>
                
                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 min-h-[4rem]">
                  {course.description}
                </p>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  {course.rating && (
                    <span className="flex items-center gap-1">
                      ⭐ {course.rating.toFixed(1)}
                    </span>
                  )}
                  {course.reviews > 0 && (
                    <span>👥 {course.reviews} reviews</span>
                  )}
                  {course.level && (
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      {course.level}
                    </span>
                  )}
                </div>

                {/* Category */}
                {course.category && (
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                      📚 {course.category}
                    </span>
                  </div>
                )}

                {/* Instructor */}
                {course.instructor && (
                  <p className="text-sm text-gray-500 mb-4">
                    👨‍🏫 By {course.instructor}
                  </p>
                )}

                {/* CTA Button */}
                <button 
                  className={`w-full py-3 rounded-xl font-bold transition ${
                    course.isExternal 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                  }`}
                >
                  {course.isExternal ? 'View on ' + course.platform + ' →' : 'View Course →'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
