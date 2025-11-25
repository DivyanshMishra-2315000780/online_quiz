const jwt = require('jsonwebtoken')

const SECRET = process.env.JWT_SECRET || 'dev_secret'

function auth(req,res,next){
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ message: 'No token' })
  const parts = authHeader.split(' ')
  if (parts.length !== 2) return res.status(401).json({ message: 'Invalid token' })
  const token = parts[1]
  try{
    const payload = jwt.verify(token, SECRET)
    req.user = payload
    next()
  }catch(e){
    return res.status(401).json({ message: 'Invalid token' })
  }
}

module.exports = auth
