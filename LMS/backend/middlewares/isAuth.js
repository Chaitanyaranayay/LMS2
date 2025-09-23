
import jwt from "jsonwebtoken"
const isAuth=async (req,res,next)=>{
    try {
 
      let {token} = req.cookies
     
      if(!token){
        return res.status(400).json({message:"Not Authorized"})
      }
      let verifyToken = jwt.verify(token,process.env.JWT_SECRET)
      
      if(!verifyToken){
        return res.status(400).json({message:"Invalid token"})
      }
  
      req.userId = verifyToken.userId
      next()
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:`is auth error ${error}`})
    }
}
export default isAuth