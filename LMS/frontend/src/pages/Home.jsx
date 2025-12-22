import React from 'react'
import home from "../assets/home1.jpg"
import Nav from '../components/Nav'
import { SiViaplay } from "react-icons/si";
import Logos from '../components/Logos';
import Cardspage from '../components/Cardspage';
import ExploreCourses from '../components/ExploreCourses';
import About from '../components/About';
import ReviewPage from '../components/ReviewPage';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
function Home() {
      const navigate = useNavigate()

  return (

    
    
    <div className='w-[100%] overflow-hidden'>
      
      <div className='w-[100%] lg:h-[140vh] h-[70vh] relative'>
        <Nav/>
        <img src={home} className='object-cover md:object-fill   w-[100%] lg:h-[100%] h-[50vh]' alt="" />
        <span className='lg:text-[70px] absolute  md:text-[40px]  lg:top-[10%] top-[15%] w-[100%] flex items-center justify-center text-white font-bold text-[20px] '>
          Grow Your Skills to Advance 
        </span>
        <span className='lg:text-[70px] text-[20px] md:text-[40px] absolute lg:top-[18%] top-[20%] w-[100%] flex items-center justify-center text-white font-bold'>
          Your Career path
        </span>
        <div className='absolute lg:top-[30%] top-[75%]  md:top-[80%] w-[100%] flex items-center justify-center gap-3 flex-wrap'>
          
      <button className='px-[20px] py-[10px] border-2 lg:border-white border-black lg:text-white text-black rounded-[10px] text-[18px] font-light flex gap-2 cursor-pointer' onClick={()=>navigate("/allcourses")}>View all Courses <SiViaplay className='w-[30px] h-[30px] lg:fill-white fill-black' /></button>
      <button className='px-[20px] py-[10px] bg-white lg:text-purple-600 text-purple-600 rounded-[10px] text-[18px] font-light flex gap-2 cursor-pointer hover:opacity-90 transition' onClick={()=>navigate("/ai-search")}>🔍 AI Course Search</button>
      </div>
      </div>
      <Logos/>
      <ExploreCourses/>
      <Cardspage/>
      <About/>
      <ReviewPage/>
      <Footer/>

      
      
      
    </div>

  ) 
}

export default Home
