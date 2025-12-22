import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Card from '../components/Card'
import Nav from '../components/Nav'

export default function Recommendations() {
  const navigate = useNavigate()
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    try {
      const { data } = await axios.get('/api/external/recommendations')
      setRecommendations(data.recommendations || [])
      setReason(data.reason || '')
      setMessage(data.message || '')
    } catch (err) {
      console.error('Failed to fetch recommendations:', err)
      if (err.response?.status === 401) {
        navigate('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
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
          <h1 className="text-5xl font-bold text-gray-800 mb-3">
            🎯 Personalized Recommendations
          </h1>
          <p className="text-lg text-gray-600">{message}</p>
        </div>

        {/* Reason Badge */}
        {reason && (
          <div className="mb-6 inline-block">
            <span className={`px-6 py-3 rounded-full font-bold text-white shadow-lg ${
              reason === 'ai-personalized' ? 'bg-gradient-to-r from-purple-600 to-blue-600' :
              reason === 'category-match' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
              'bg-gradient-to-r from-orange-500 to-red-500'
            }`}>
              {reason === 'ai-personalized' && '🤖 AI Personalized'}
              {reason === 'category-match' && '🎯 Based on Your Interests'}
              {reason === 'popular' && '🔥 Popular Courses'}
            </span>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mb-4"></div>
            <p className="text-2xl font-bold text-gray-700">🤖 Finding perfect courses for you...</p>
          </div>
        )}

        {/* Recommendations Grid */}
        {!loading && recommendations.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recommendations.map((course, index) => (
              <Card 
                key={index}
                thumbnail={course.thumbnail}
                title={course.title}
                price={course.price}
                category={course.category}
                id={course._id}
                reviews={course.reviews}
              />
            ))}
          </div>
        )}

        {/* No Recommendations */}
        {!loading && recommendations.length === 0 && (
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-12 text-center">
            <p className="text-4xl mb-4">📚</p>
            <p className="text-2xl font-bold text-gray-800 mb-2">Start Your Learning Journey!</p>
            <p className="text-gray-600 mb-6">Enroll in courses to get personalized recommendations</p>
            <button 
              onClick={() => navigate('/allcourses')}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-blue-700 transition"
            >
              Browse All Courses
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
