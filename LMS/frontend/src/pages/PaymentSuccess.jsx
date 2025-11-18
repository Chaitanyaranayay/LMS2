import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function PaymentSuccess() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-xl text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">Payment Successful 🎉</h1>
        <p className="text-gray-700 mb-6">Thank you for your purchase. Your enrollment is confirmed.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate('/enrolledcourses')} className="px-4 py-2 bg-blue-600 text-white rounded">Go to My Courses</button>
          <button onClick={() => navigate('/')} className="px-4 py-2 bg-gray-200 rounded">Back to Home</button>
        </div>
      </div>
    </div>
  )
}
