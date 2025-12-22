import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { FaPlayCircle } from 'react-icons/fa';
import { FaArrowLeftLong } from "react-icons/fa6";
import { setUserData } from '../redux/userSlice';

function ViewLecture() {
  const { courseId } = useParams();
  const dispatch = useDispatch()
  const { courseData } = useSelector((state) => state.course);
  const {userData} = useSelector((state) => state.user)
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch course with populated lectures to get video URLs
  useEffect(() => {
    const fetchCourseWithLectures = async () => {
      try {
        const res = await fetch(`/api/course/getcourse/${courseId}`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setSelectedCourse(data);
        } else {
          console.error('Failed to load course');
        }
      } catch (err) {
        console.error('Error fetching course:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseWithLectures();
  }, [courseId]);

  const [selectedLecture, setSelectedLecture] = useState(null);
  const navigate = useNavigate()
  const courseCreator = userData?._id === selectedCourse?.creator?._id ? selectedCourse.creator : null;

  const enrollment = userData?.enrolledCourses?.find(ec => {
    const cid = ec.course?._id || ec.course || ec
    return cid?.toString?.() === courseId
  })
  const completedLectureIds = enrollment?.completedLectures?.map(l => l?._id || l) || []
  const isLectureCompleted = selectedLecture ? completedLectureIds.includes(selectedLecture._id) : false

  // Set initial lecture once course loads
  useEffect(() => {
    if (selectedCourse?.lectures?.length) {
      setSelectedLecture(selectedCourse.lectures[0]);
    }
  }, [selectedCourse]);

  const handleMarkComplete = async (lecture) => {
    if (!lecture) return
    try {
      const res = await fetch(`/api/course/${courseId}/lecture/${lecture._id}/complete`, {
        method: 'POST',
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()

        // Update userData in store with new progress and completed lectures
        if (userData) {
          const updatedEnrollments = userData.enrolledCourses.map(ec => {
            const cid = ec.course?._id || ec.course || ec
            if (cid?.toString?.() === courseId) {
              return {
                ...ec,
                progress: data.progress,
                completedLectures: data.completedLectures
              }
            }
            return ec
          })
          dispatch(setUserData({ ...userData, enrolledCourses: updatedEnrollments }))
        }
      } else {
        console.error('Failed to mark complete')
      }
    } catch (err) {
      console.error('Error marking complete', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">Loading course...</div>
      </div>
    );
  }

  if (!selectedCourse) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-xl font-semibold text-red-600">Course not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col md:flex-row gap-6">
     
      {/* Left - Video & Course Info */}
      <div className="w-full md:w-2/3 bg-white rounded-2xl shadow-md p-6 border border-gray-200">
        {/* Course Details */}
        <div className="mb-6" >
           
          <h1 className="text-2xl font-bold flex items-center justify-start gap-[20px]  text-gray-800"><FaArrowLeftLong  className=' text-black w-[22px] h-[22px] cursor-pointer' onClick={()=>navigate("/")}/>{selectedCourse?.title}</h1>
          
          <div className="mt-2 flex gap-4 text-sm text-gray-500 font-medium">
            <span>Category: {selectedCourse?.category}</span>
            <span>Level: {selectedCourse?.level}</span>
          </div>
        </div>

        {/* Video Player */}
        <div className="aspect-video bg-black rounded-xl overflow-hidden mb-4 border border-gray-300">
          {selectedLecture?.videoUrl ? (
            <video
              src={selectedLecture.videoUrl}
              controls
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
              onEnded={() => handleMarkComplete(selectedLecture)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-white">
              Select a lecture to start watching
            </div>
          )}
        </div>

        {/* Selected Lecture Info */}
        <div className="mt-2">
          <h2 className="text-lg font-semibold text-gray-800">{selectedLecture?.lectureTitle}</h2>
          <div className="mt-3 flex gap-3 items-center">
            <button
              className={`px-4 py-2 rounded-md text-sm font-semibold border ${isLectureCompleted ? 'bg-green-100 text-green-700 border-green-300' : 'bg-black text-white border-black'}`}
              onClick={() => handleMarkComplete(selectedLecture)}
              disabled={!selectedLecture}
            >
              {isLectureCompleted ? 'Completed' : 'Mark as completed'}
            </button>
          </div>
        </div>
      </div>

      {/* Right - All Lectures + Creator Info */}
      <div className="w-full md:w-1/3 bg-white rounded-2xl shadow-md p-6 border border-gray-200 h-fit">
        <h2 className="text-xl font-bold mb-4 text-gray-800">All Lectures</h2>
        <div className="flex flex-col gap-3 mb-6">
          {selectedCourse?.lectures?.length > 0 ? (
            selectedCourse.lectures.map((lecture, index) => (
              <button
                key={index}
                onClick={() => setSelectedLecture(lecture)}
                className={`flex items-center justify-between p-3 rounded-lg border transition text-left ${
                  selectedLecture?._id === lecture._id
                    ? 'bg-gray-200 border-gray-500'
                    : 'hover:bg-gray-50 border-gray-300'
                }`}
              >
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">{lecture.lectureTitle}</h4>
                  
                </div>
                <FaPlayCircle className="text-black text-xl" />
              </button>
            ))
          ) : (
            <p className="text-gray-500">No lectures available.</p>
          )}
        </div>

        {/* Creator Info */}
        {courseCreator && (
  <div className="mt-4 border-t pt-4">
    <h3 className="text-md font-semibold text-gray-700 mb-3">Instructor</h3>
    <div className="flex items-center gap-4">
      <img
        src={courseCreator.photoUrl || '/default-avatar.png'}
        alt="Instructor"
        className="w-14 h-14 rounded-full object-cover border"
      />
      <div>
        <h4 className="text-base font-medium text-gray-800">{courseCreator.name}</h4>
        <p className="text-sm text-gray-600">
          {courseCreator.description || 'No bio available.'}
        </p>
      </div>
    </div>
  </div>
        )}
      </div>
    </div>
  );
}

export default ViewLecture;
