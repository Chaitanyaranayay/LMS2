import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { serverUrl } from '../App';
import { FaArrowLeftLong } from "react-icons/fa6";
import img from "../assets/empty.jpg"
import Card from "../components/Card.jsx"
import { setSelectedCourseData } from '../redux/courseSlice';
import { FaLock, FaPlayCircle } from "react-icons/fa";
import { toast } from 'react-toastify';
import { FaStar } from "react-icons/fa6";


function ViewCourse() {

      const { courseId } = useParams();
      const navigate = useNavigate()
    const {courseData} = useSelector(state=>state.course)
    const {userData} = useSelector(state=>state.user)
    const [creatorData , setCreatorData] = useState(null)
    const dispatch = useDispatch()
    const [selectedLecture, setSelectedLecture] = useState(null);
    const {lectureData} = useSelector(state=>state.lecture)
    const {selectedCourseData} = useSelector(state=>state.course)
  const [selectedCreatorCourse,setSelectedCreatorCourse] = useState([])
   const [rating, setRating] = useState(0);
   const [comment, setComment] = useState("");
   
   
  


  const handleReview = async () => {
    try {
      const result = await axios.post(serverUrl + "/api/review/givereview" , {rating , comment , courseId} , {withCredentials:true})
      toast.success("Review Added")
      console.log(result.data)
      setRating(0)
      setComment("")

    } catch (error) {
      console.log(error)
      toast.error(error.response.data.message)
    }
  }
  

  const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0;

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return (total / reviews.length).toFixed(1); // rounded to 1 decimal
};

// Usage:
const avgRating = calculateAverageRating(selectedCourseData?.reviews);
console.log("Average Rating:", avgRating);

  

  useEffect(() => {
    const fetchCourseData = async () => {
      courseData.map((item) => {
        if (item._id === courseId) {
          dispatch(setSelectedCourseData(item))
          // console.log(selectedCourseData)
          return null;
        }
      })
    }
    fetchCourseData()
  }, [courseId, courseData, lectureData, dispatch])

  // Razorpay flow: create order on server, open checkout, verify on server
  const handleBuy = async () => {
    try {
      // 1) create order on server with payment method
      const createRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId })
      })
      if (!createRes.ok) {
        const err = await createRes.json().catch(() => null)
        return toast.error('Create order failed: ' + (err?.message || createRes.status))
      }
      const { key, order } = await createRes.json()

      // 2) open Razorpay checkout
      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: 'QuestEd',
        description: selectedCourseData?.title || 'Course purchase',
        order_id: order.id,
        handler: async function (response) {
          // 3) verify payment on server
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response)
          })
          if (verifyRes.ok) {
            toast.success('Payment successful and verified')
            navigate('/payment-success')
          } else {
            const err = await verifyRes.json().catch(() => null)
            toast.error('Payment verification failed: ' + (err?.message || verifyRes.status))
          }
        },
        prefill: { name: userData?.name || '', email: userData?.email || '' },
        theme: { color: '#3399cc' }
      }
      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (resp) {
        console.error('payment.failed', resp)
        toast.error('Payment failed: ' + (resp.error?.description || 'Unknown'))
      })
      rzp.open()
    } catch (err) {
      console.error('handleBuy error', err)
      toast.error('Error starting payment')
    }
  }


    // Fetch creator info once course data is available
  useEffect(() => {
    const getCreator = async () => {
      if (selectedCourseData?.creator) {
        try {
          const result = await axios.post(
            `${serverUrl}/api/course/getcreator`,
            { userId: selectedCourseData.creator },
            { withCredentials: true }
          );
          setCreatorData(result.data);
          console.log(result.data)
        } catch (error) {
          console.error("Error fetching creator:", error);
        }
      }
    };

    getCreator();

    
  }, [selectedCourseData, courseId]);


   


  useEffect(() => {
  if (creatorData?._id && courseData.length > 0) {
    const creatorCourses = courseData.filter(
      (course) =>
        course.creator === creatorData._id && course._id !== courseId // Exclude current course
    );
    setSelectedCreatorCourse(creatorCourses);
  
  }
}, [creatorData, courseData, courseId]);

  return (
     <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white shadow-md rounded-xl p-6 space-y-6 relative">

        {/* Top Section */}
        <div className="flex flex-col md:flex-row gap-6 ">
             
          {/* Thumbnail */}
          <div className="w-full md:w-1/2">
             <FaArrowLeftLong  className='text-[black] w-[22px] h-[22px] cursor-pointer' onClick={()=>navigate("/")}/>
            {selectedCourseData?.thumbnail ? <img
              src={selectedCourseData?.thumbnail}
              alt="Course Thumbnail"
              className="rounded-xl w-full object-cover"
            /> :  <img
              src={img}
              alt="Course Thumbnail"
              className="rounded-xl  w-full  object-cover"
            /> }
          </div>

          {/* Course Info */}
          <div className="flex-1 space-y-2 mt-[20px]">
            <h1 className="text-2xl font-bold">{selectedCourseData?.title}</h1>
            <p className="text-gray-600">{selectedCourseData?.subTitle}</p>

            {/* Rating & Price */}
            <div className="flex items-start flex-col justify-between">
              <div className="text-yellow-500 font-medium">
                ⭐ {avgRating} <span className="text-gray-500">(1,200 reviews)</span>
              </div>
              <div>
                <span className="text-lg font-semibold text-black">{selectedCourseData?.price}</span>{" "}
                <span className="line-through text-sm text-gray-400">₹599</span>
              </div>
            </div>

            {/* Highlights */}
            <ul className="text-sm text-gray-700 space-y-1 pt-2">
              <li>✅ 10+ hours of video content</li>
              <li>✅ Lifetime access to course materials</li>
              
            </ul>

            {/* Enroll Button */}
            {userData?.role === "educator" ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 font-semibold">
                  ℹ️ Educators cannot enroll in courses
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Your account is set up for creating and selling courses only.
                </p>
              </div>
            ) : (
              <>
                {/* Check if user is already enrolled */}
                {userData?.enrolledCourses?.some(
                  enrollment => enrollment.course?._id === courseId || enrollment.course === courseId || enrollment === courseId
                ) ? (
                  <button 
                    className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                    onClick={() => navigate(`/viewlecture/${courseId}`)}
                  >
                    ✓ Already Enrolled - Continue Learning →
                  </button>
                ) : (
                  <div className="flex gap-3 flex-col">
                    {/* Test Mode Warning */}
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-semibold text-yellow-800">Test Mode - No Real Charges</p>
                          <p className="text-xs text-yellow-700 mt-1">
                            Use test card: <code className="bg-yellow-100 px-2 py-1 rounded">4111 1111 1111 1111</code> | CVV: Any 3 digits | Expiry: Any future date
                          </p>
                        </div>
                      </div>
                    </div>

                    <button 
                      className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-lg"
                      onClick={handleBuy}
                    >
                      🎓 Enroll Now - ₹{selectedCourseData?.price}
                    </button>
                    <p className="text-xs text-gray-500 text-center">
                      Lifetime access • Certificate of completion • 30-day money-back guarantee
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* What You'll Learn */}
        <div>
          <h2 className="text-xl font-semibold mb-2">What You’ll Learn</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Learn {selectedCourseData?.category} from Beginning</li>
            
          </ul>
        </div>

        {/* Requirements */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Requirements</h2>
          <p className="text-gray-700">Basic programming knowledge is helpful but not required.</p>
        </div>

        {/* Who This Course Is For */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Who This Course is For</h2>
          <p className="text-gray-700">
            Beginners, aspiring developers, and professionals looking to upgrade skills.
          </p>
        </div>

        {/* course lecture   */}
         <div className="flex flex-col md:flex-row gap-6">
  {/* Left Side - Curriculum */}
  <div className="bg-white w-full md:w-2/5 p-6 rounded-2xl shadow-lg border border-gray-200">
    <h2 className="text-xl font-bold mb-1 text-gray-800">Course Curriculum</h2>
    <p className="text-sm text-gray-500 mb-4">{selectedCourseData?.lectures?.length} Lectures</p>

    <div className="flex flex-col gap-3">
      {selectedCourseData?.lectures?.map((lecture, index) => (
        <button
          key={index}
          disabled={!lecture.isPreviewFree}
          onClick={() => {
            if (lecture.isPreviewFree) {
              setSelectedLecture(lecture);
            }
          }}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-200 text-left ${
            lecture.isPreviewFree
              ? "hover:bg-gray-100 cursor-pointer border-gray-300"
              : "cursor-not-allowed opacity-60 border-gray-200"
          } ${
            selectedLecture?.lectureTitle === lecture.lectureTitle
              ? "bg-gray-100 border-gray-400"
              : ""
          }`}
        >
          <span className="text-lg text-gray-700">
            {lecture.isPreviewFree ? <FaPlayCircle /> : <FaLock />}
          </span>
          <span className="text-sm font-medium text-gray-800">
            {lecture.lectureTitle}
          </span>
        </button>
      ))}
    </div>
  </div>

  {/* Right Side - Video + Info */}
  <div className="bg-white w-full md:w-3/5 p-6 rounded-2xl shadow-lg border border-gray-200">
    <div className="aspect-video w-full rounded-lg overflow-hidden mb-4 bg-black flex items-center justify-center">
      {selectedLecture?.videoUrl ? (
        <video
          src={selectedLecture.videoUrl}
          controls
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-white text-sm">Select a preview lecture to watch</span>
      )}
    </div>

    <h3 className="text-lg font-semibold text-gray-900 mb-1">
      {selectedLecture?.lectureTitle || "Lecture Title"}
    </h3>
    <p className="text-gray-600 text-sm">
      {selectedCourseData?.title}
    </p>
  </div>
</div>
<div className="mt-8 border-t pt-6">
    <h2 className="text-xl font-semibold mb-2">Write a Review</h2>
    <div className="mb-4">
      <div className="flex gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
         
            <FaStar  key={star}
            onClick={() => setRating(star)} className={star <= rating ? "fill-yellow-500" : "fill-gray-300"} />
         
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write your comment here..."
        className="w-full border border-gray-300 rounded-lg p-2"
        rows="3"
      />
      <button
        
        className="bg-black text-white mt-3 px-4 py-2 rounded hover:bg-gray-800" onClick={handleReview}
      >
        Submit Review
      </button>
    </div>

        {/* Instructor Info */}
        <div className="flex items-center gap-4 pt-4 border-t ">
          {creatorData?.photoUrl ?<img
            src={creatorData?.photoUrl}
            alt="Instructor"
            className="w-16 h-16 rounded-full object-cover"
          />: <img
            src={img}
            alt="Instructor"
            className="w-16 h-16 rounded-full object-cover"
          />
          }
          <div>
            <h3 className="text-lg font-semibold">{creatorData?.name}</h3>
            <p className="md:text-sm text-gray-600 text-[10px] ">{creatorData?.description}</p>
            <p className="md:text-sm text-gray-600 text-[10px] ">{creatorData?.email}</p>
            
          </div>
        </div>
        <div>
          <p className='text-xl font-semibold mb-2'>Other Published Courses by the Educator -</p>
        <div className='w-full transition-all duration-300 py-[20px]   flex items-start justify-center lg:justify-start flex-wrap gap-6 lg:px-[80px] '>
          
            {
                selectedCreatorCourse?.map((item,index)=>(
                    <Card key={index} thumbnail={item.thumbnail} title={item.title} id={item._id} price={item.price} category={item.category}/>
                ))
            }
        </div>
      </div>
    </div>
    </div>
    </div>
  )
}

export default ViewCourse