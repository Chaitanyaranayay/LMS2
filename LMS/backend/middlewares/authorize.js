import User from "../models/userModel.js"

// authorize(...allowedRoles) - checks user role after isAuth sets req.userId
export default function authorize(...allowedRoles) {
  return async (req, res, next) => {
    try {
      if (!req.userId) return res.status(401).json({ message: 'Not authenticated' })
      const user = await User.findById(req.userId).select('role')
      if (!user) return res.status(401).json({ message: 'User not found' })
      if (!allowedRoles.includes(user.role)) return res.status(403).json({ message: 'Forbidden' })
      next()
    } catch (err) {
      console.error('authorize error', err)
      return res.status(500).json({ message: 'Server error' })
    }
  }
}
