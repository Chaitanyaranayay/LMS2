import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "../styles/AISearch.css"

export default function AISearch() {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [useRealAI, setUseRealAI] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    
    setLoading(true)
    setSearched(true)
    try {
      const { data } = await axios.post("/api/ai/search", { query, useAI: useRealAI })
      setResults(data.results || [])
    } catch (err) {
      console.error("Search error:", err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ai-search-container">
      <div className="ai-search-header">
        <button className="back-btn" onClick={() => navigate("/")}>← Back</button>
        <h1>🔍 Find Courses with AI</h1>
        <p>Describe your learning interest and let AI suggest courses</p>
      </div>

      <form className="search-form" onSubmit={handleSearch}>
        <div className="search-input-group">
          <input
            type="text"
            placeholder="e.g., 'I want to learn React and build web apps'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !query.trim()}>
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
        
        <label className="ai-toggle">
          <input
            type="checkbox"
            checked={useRealAI}
            onChange={(e) => setUseRealAI(e.target.checked)}
            disabled={loading}
          />
          <span>Use AI (requires API key)</span>
        </label>
      </form>

      {loading && <div className="loading">Loading results...</div>}

      {searched && !loading && results.length === 0 && (
        <div className="no-results">No courses found. Try a different search.</div>
      )}

      <div className="results-grid">
        {results.map((course, idx) => (
          <div key={idx} className="result-card">
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            <div className="tags">
              {course.tags?.map((tag, i) => (
                <span key={i} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
