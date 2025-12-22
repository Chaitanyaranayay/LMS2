import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { FaArrowLeftLong } from "react-icons/fa6"

export default function EnrolledStudents() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourseProgress = async () => {
      try {
        const { data: progressData } = await axios.get(`/api/course/${courseId}/progress`)
        setData(progressData)
      } catch (err) {
        console.error(err)
        toast.error(err.response?.data?.message || "Failed to load course details")
      } finally {
        setLoading(false)
      }
    }
    fetchCourseProgress()
  }, [courseId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    )
  }

  if (!data || !data.course) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl font-semibold text-red-600">Course not found</div>
      </div>
    )
  }

  const { course, students } = data
  const enrolledCount = students.length
  const totalRevenue = enrolledCount * (course.price || 0)
  const avgProgress = enrolledCount > 0 
    ? Math.round(students.reduce((sum, s) => sum + s.progress, 0) / enrolledCount)
    : 0

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="mb-4 flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition"
          >
            <FaArrowLeftLong /> Back to Dashboard
          </button>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{course.title}</h1>
            <p className="text-gray-600 mb-4">Total Lectures: {course.totalLectures}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-semibold">Total Students</div>
                <div className="text-3xl font-bold text-purple-700">{enrolledCount}</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-semibold">Course Price</div>
                <div className="text-3xl font-bold text-green-700">₹{course.price || 0}</div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-semibold">Total Revenue</div>
                <div className="text-3xl font-bold text-blue-700">₹{totalRevenue.toLocaleString()}</div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 font-semibold">Avg Progress</div>
                <div className="text-3xl font-bold text-orange-700">{avgProgress}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Enrolled Students ({enrolledCount})
          </h2>

          {enrolledCount === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-xl text-gray-600 font-semibold mb-2">No students enrolled yet</p>
              <p className="text-gray-500">Share your course to get your first student!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {students.map((student, idx) => {
                const enrolledDate = student.enrolledAt 
                  ? new Date(student.enrolledAt).toLocaleDateString()
                  : 'N/A'
                
                return (
                  <div 
                    key={student._id || idx} 
                    className="bg-gray-50 rounded-lg p-5 flex items-center gap-4 hover:shadow-md transition"
                  >
                    {student.photoUrl ? (
                      <img 
                        src={student.photoUrl} 
                        alt={student.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-purple-500"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-purple-600 text-white flex items-center justify-center text-2xl font-bold">
                        {student.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-lg">{student.name}</h3>
                      <p className="text-sm text-gray-600">{student.email}</p>
                      <p className="text-xs text-gray-500 mt-1">Enrolled: {enrolledDate}</p>
                    </div>

                    <div className="text-center px-4">
                      <div className="text-sm text-gray-600 mb-1">Progress</div>
                      <div className="relative w-20 h-20">
                        <svg className="w-20 h-20 transform -rotate-90">
                          <circle
                            cx="40"
                            cy="40"
                            r="32"
                            stroke="#e5e7eb"
                            strokeWidth="6"
                            fill="none"
                          />
                          <circle
                            cx="40"
                            cy="40"
                            r="32"
                            stroke={student.progress >= 80 ? "#10b981" : student.progress >= 50 ? "#f59e0b" : "#8b5cf6"}
                            strokeWidth="6"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 32}`}
                            strokeDashoffset={`${2 * Math.PI * 32 * (1 - student.progress / 100)}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold text-gray-800">{student.progress}%</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {student.completedLectures}/{student.totalLectures} lectures
                      </div>
                    </div>
                    
                    <div className="text-green-600 font-semibold text-lg">
                      ₹{course.price || 0}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        {enrolledCount > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
            <div className="flex gap-4 flex-wrap">
              <button 
                onClick={() => toast.info("Email feature coming soon!")}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                📧 Email All Students
              </button>
              <button 
                onClick={() => {
                  const studentsList = students.map(s => 
                    `${s.name} - ${s.email} - Progress: ${s.progress}%`
                  ).join('\n')
                  navigator.clipboard.writeText(studentsList)
                  toast.success("Student list copied to clipboard!")
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                📋 Copy Student List
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
