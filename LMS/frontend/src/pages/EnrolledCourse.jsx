import React  from 'react'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import { FaArrowLeftLong } from "react-icons/fa6";

function EnrolledCourse() {
  const navigate = useNavigate()
  const { userData } = useSelector((state) => state.user);

  return (
    <div className="min-h-screen w-full px-4 py-9 bg-gray-50">
      <FaArrowLeftLong  className='absolute top-[3%] md:top-[6%] left-[5%] w-[22px] h-[22px] cursor-pointer' onClick={()=>navigate("/")}/>
      
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl text-center font-bold text-gray-800 mb-2">
          My Enrolled Courses
        </h1>
        <p className="text-center text-gray-600 mb-8">
          You have enrolled in {userData.enrolledCourses?.length || 0} course(s)
        </p>

        {!userData.enrolledCourses || userData.enrolledCourses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-xl text-gray-600 font-semibold mb-2">No courses enrolled yet</p>
            <p className="text-gray-500 mb-6">Start learning by enrolling in amazing courses!</p>
            <button 
              onClick={() => navigate('/allcourses')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userData.enrolledCourses.map((enrollment, idx) => {
              const course = enrollment.course || enrollment;
              const courseId = course?._id || course; // supports stored ObjectId strings
              const progress = enrollment.progress || 0;
              const enrolledDate = enrollment.enrolledAt 
                ? new Date(enrollment.enrolledAt).toLocaleDateString()
                : null;

              const thumb = course?.thumbnail
                ? (course.thumbnail.startsWith('http') ? course.thumbnail : `${serverUrl}${course.thumbnail}`)
                : "";
              
              return (
                <div
                  key={course._id || idx}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border hover:shadow-xl transition"
                >
                  <img
                    src={thumb}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                    onError={(e)=>{e.currentTarget.src='https://via.placeholder.com/400x225?text=Course+Image'}}
                  />
                  <div className="p-5">
                    <div className="mb-3">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                        {course.category}
                      </span>
                    </div>
                    
                    <h2 className="text-xl font-bold text-gray-800 mb-2">{course.title}</h2>
                    <p className="text-sm text-gray-600 mb-2">{course.subTitle}</p>
                    
                    <div className="flex items-center gap-2 mb-3 text-sm text-gray-700">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                        {course.level}
                      </span>
                      <span className="text-gray-500">•</span>
                      <span className="font-semibold text-green-600">Enrolled ✓</span>
                    </div>

                    {enrolledDate && (
                      <p className="text-xs text-gray-500 mb-3">Enrolled: {enrolledDate}</p>
                    )}

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold text-purple-600">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <button 
                      onClick={() => navigate(`/viewlecture/${courseId}`)}
                      className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition"
                    >
                      Continue Learning →
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default EnrolledCourse
