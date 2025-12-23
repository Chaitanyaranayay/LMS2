import React, { useEffect, useState } from 'react';
import Card from "../components/Card.jsx";
import { FaArrowLeftLong } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import Nav from '../components/Nav';
import { useSelector } from 'react-redux';
import axios from 'axios';

function AllCourses() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const navigate = useNavigate()
  const [category,setCategory] = useState([])
  const [filterCourses,setFilterCourses] = useState([])
  const {courseData} = useSelector(state=>state.course)
  
  // AI Search states
  const [aiSearchQuery, setAiSearchQuery] = useState('')
  const [aiSearchActive, setAiSearchActive] = useState(false)
  const [aiSearchLoading, setAiSearchLoading] = useState(false)
  const [aiSearchResults, setAiSearchResults] = useState([])

 
  
  const toggleCategory = (e) =>{
     if(category.includes(e.target.value)){
       setCategory(prev=> prev.filter(item => item !== e.target.value))
     }else{
      setCategory(prev => [...prev,e.target.value])
     }
  }

  const applyFilter = () =>{
    let courseCopy = courseData.slice();

    if(category.length > 0){
      courseCopy = courseCopy.filter(item => category.includes(item.category))
    }
   
    setFilterCourses(courseCopy)
  }

  const handleAiSearch = async (e) => {
    e.preventDefault()
    if (!aiSearchQuery.trim()) return
    
    setAiSearchLoading(true)
    setAiSearchActive(true)
    try {
      const { data } = await axios.post('/api/external/intelligent-search', {
        query: aiSearchQuery,
        includeExternal: true
      })
      setAiSearchResults(data.results || [])
    } catch (err) {
      console.error('AI Search error:', err)
      alert('Search failed: ' + (err.response?.data?.message || err.message))
    } finally {
      setAiSearchLoading(false)
    }
  }

  const clearAiSearch = () => {
    setAiSearchActive(false)
    setAiSearchQuery('')
    setAiSearchResults([])
  }

  const handleCourseClick = (course) => {
    if (course.isExternal) {
      window.open(course.url, '_blank')
    } else {
      navigate(course.url || `/viewcourse/${course._id}`)
    }
  }

  useEffect(()=>{
    setFilterCourses(courseData)
  },[courseData])

  useEffect(()=>{
    applyFilter()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[category])

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Nav/>
      {/* Toggle Button */}
      <button
        onClick={() => setIsSidebarVisible(prev => !prev)}
        className="fixed top-20 left-4 z-50 bg-white text-black px-3 py-1 rounded md:hidden border-2 border-black"
      >
        {isSidebarVisible ? 'Hide' : 'Show'} Filters
      </button>

      {/* Sidebar */}
      <aside className={`w-[260px] h-screen overflow-y-auto bg-black fixed  top-0 left-0 p-6 py-[130px] border-r border-gray-200 shadow-md transition-transform duration-300 z-5 
        ${isSidebarVisible ? 'translate-x-0' : '-translate-x-full'} 
        md:block md:translate-x-0`}>
          
        <h2 className="text-xl font-bold flex items-center justify-center gap-2 text-gray-50 mb-6"><FaArrowLeftLong className='text-white' onClick={()=>navigate("/")}/>Filter by Category</h2>

        {/* AI Search Form */}
        <div className="mb-6 bg-gray-600 border-white text-white border p-4 rounded-2xl">
          <h3 className="text-sm font-bold mb-3 text-center">🤖 AI Course Search</h3>
          <p className="text-xs text-gray-300 mb-3 text-center">Search YouTube Videos</p>
          <form onSubmit={handleAiSearch} className="space-y-2">
            <input
              type="text"
              placeholder="e.g. React, Python, AI"
              value={aiSearchQuery}
              onChange={(e) => setAiSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-500 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={aiSearchLoading || !aiSearchQuery.trim()}
              className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 text-white rounded-lg font-semibold text-sm transition"
            >
              {aiSearchLoading ? '🔄 Searching...' : '🔍 Search Platforms'}
            </button>
            {aiSearchActive && (
              <button
                type="button"
                onClick={clearAiSearch}
                className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition"
              >
                ✕ Clear AI Search
              </button>
            )}
          </form>
        </div>

        <form className="space-y-4 text-sm bg-gray-600 border-white text-[white] border p-[20px] rounded-2xl" onSubmit={(e)=>e.preventDefault()}>

          <label  className="flex items-center gap-3 cursor-pointer hover:text-gray-200 transition">
              <input type="checkbox" className="accent-black w-4 h-4 rounded-md" value={'App Development'} onChange={toggleCategory} checked={category.includes('App Development')}/>
              App Development
            </label>
          <label  className="flex items-center gap-3 cursor-pointer hover:text-gray-200 transition">
              <input type="checkbox" className="accent-black w-4 h-4 rounded-md" value={'AI/ML'} onChange={toggleCategory} checked={category.includes('AI/ML')}/>
              AI/ML
            </label>
            
            <label  className="flex items-center gap-3 cursor-pointer hover:text-gray-200 transition">
              <input type="checkbox" className="accent-black w-4 h-4 rounded-md" value={'AI Tools'} onChange={toggleCategory} checked={category.includes('AI Tools')} />
              AI Tools
            </label>
            <label  className="flex items-center gap-3 cursor-pointer hover:text-gray-200 transition">
              <input type="checkbox" className="accent-black w-4 h-4 rounded-md" value={'Data Science'} onChange={toggleCategory} checked={category.includes('Data Science')}/>
              Data Science
            </label>
            <label  className="flex items-center gap-3 cursor-pointer hover:text-gray-200 transition">
              <input type="checkbox" className="accent-black w-4 h-4 rounded-md" value={'Data Analytics'} onChange={toggleCategory} checked={category.includes('Data Analytics')} />
              Data Analytics
            </label>
            <label  className="flex items-center gap-3 cursor-pointer hover:text-gray-200 transition">
              <input type="checkbox" className="accent-black w-4 h-4 rounded-md" value={'Ethical Hacking'} onChange={toggleCategory} checked={category.includes('Ethical Hacking')}/>
              Ethical Hacking
            </label>
            <label  className="flex items-center gap-3 cursor-pointer hover:text-gray-200 transition">
              <input type="checkbox" className="accent-black w-4 h-4 rounded-md" value={'UI UX Designing'} onChange={toggleCategory} checked={category.includes('UI UX Designing')}/>
              UI UX Designing
            </label>
            <label  className="flex items-center gap-3 cursor-pointer hover:text-gray-200 transition">
              <input type="checkbox" className="accent-black w-4 h-4 rounded-md" value={'Web Development'} onChange={toggleCategory} checked={category.includes('Web Development')}/>
              Web Development
            </label>
            <label  className="flex items-center gap-3 cursor-pointer hover:text-gray-200 transition">
              <input type="checkbox" className="accent-black w-4 h-4 rounded-md" value={'Others'} onChange={toggleCategory} checked={category.includes('Others')} />
              Others
            </label>
        </form>
      </aside>

      {/* Main Courses Section */}
      <main className="w-full transition-all duration-300 py-[130px] md:pl-[300px] flex items-start justify-center md:justify-start flex-wrap gap-6 px-[10px]">
        {aiSearchActive ? (
          <div className="w-full px-4">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                🤖 AI Search Results: "{aiSearchQuery}"
              </h2>
              <p className="text-gray-600">
                Found {aiSearchResults.length} courses from your LMS & YouTube
              </p>
            </div>
            
            {aiSearchLoading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mb-4"></div>
                <p className="text-xl font-bold text-gray-700">Searching across platforms...</p>
              </div>
            ) : aiSearchResults.length > 0 ? (
              <div className="flex flex-wrap gap-6">
                {aiSearchResults.map((course, idx) => (
                  course.isExternal ? (
                    // External course card
                    <div
                      key={idx}
                      onClick={() => handleCourseClick(course)}
                      className="bg-white rounded-lg shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden w-[calc(33.333%-1rem)] min-w-[280px]"
                    >
                      {course.thumbnail && (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-40 object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => { 
                            e.target.onerror = null;
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225"%3E%3Crect fill="%236366f1" width="400" height="225"/%3E%3Ctext fill="white" font-size="20" font-family="Arial" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E' + encodeURIComponent(course.platform + ' Course') + '%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      )}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            course.platform === 'YouTube' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            🌐 {course.platform}
                          </span>
                          <span className="text-sm font-bold text-green-600">{course.price}</span>
                        </div>
                        <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 h-12">{course.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3 h-10">{course.description}</p>
                        <button className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold text-sm transition">
                          View on {course.platform} →
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Internal course - use existing Card component
                    <Card 
                      key={idx} 
                      thumbnail={course.thumbnail} 
                      title={course.title} 
                      price={course.price} 
                      category={course.category} 
                      id={course._id} 
                      reviews={course.reviews} 
                    />
                  )
                ))}
              </div>
            ) : (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8 text-center">
                <p className="text-2xl mb-2">😕 No courses found</p>
                <p className="text-gray-600">Try different keywords</p>
              </div>
            )}
          </div>
        ) : (
          filterCourses?.map((item,index)=>(
            <Card key={index} thumbnail={item.thumbnail} title={item.title} price={item.price} category={item.category} id={item._id} reviews={item.reviews} />
          ))
        )}
      </main>
    </div>
  );
}

export default AllCourses;
