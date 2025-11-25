const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')
const { readDB, writeDB } = require('../db')
const { mongoose } = require('../mongo')
let UserModel
try { UserModel = require('../models/User') } catch (e) { UserModel = null }

const SECRET = process.env.JWT_SECRET || 'dev_secret'

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' })
    // prefer MongoDB when available
    if (UserModel && mongoose && mongoose.connection.readyState === 1) {
      const exists = await UserModel.findOne({ email })
      if (exists) return res.status(400).json({ message: 'User exists' })
      const hash = await bcrypt.hash(password, 10)
      const u = await UserModel.create({ name, email, passwordHash: hash, role: role || 'student' })
      const token = jwt.sign({ id: u._id, name: u.name, role: u.role }, SECRET, { expiresIn: '7d' })
      return res.json({ user: { id: u._id, name: u.name, email: u.email, role: u.role }, token })
    }
    // fallback to file DB
    const db = await readDB()
    const exists = db.users && db.users.find(u => u.email === email)
    if (exists) return res.status(400).json({ message: 'User exists' })
    const hash = await bcrypt.hash(password, 10)
    const user = { id: uuidv4(), name, email, passwordHash: hash, role: role || 'student' }
    db.users = db.users || []
    db.users.push(user)
    await writeDB(db)
    const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, SECRET, { expiresIn: '7d' })
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Missing fields' })
    if (UserModel && mongoose && mongoose.connection.readyState === 1) {
      const user = await UserModel.findOne({ email })
      if (!user) return res.status(400).json({ message: 'Invalid credentials' })
      const ok = await bcrypt.compare(password, user.passwordHash)
      if (!ok) return res.status(400).json({ message: 'Invalid credentials' })
      const token = jwt.sign({ id: user._id, name: user.name, role: user.role }, SECRET, { expiresIn: '7d' })
      return res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token })
    }
    const db = await readDB()
    const user = db.users && db.users.find(u => u.email === email)
    if (!user) return res.status(400).json({ message: 'Invalid credentials' })
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' })
    const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, SECRET, { expiresIn: '7d' })
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

router.get('/me', async (req, res) => {
  const auth = req.headers.authorization
  if (!auth) return res.status(401).json({ message: 'No token' })
  const token = auth.split(' ')[1]
  try {
    const payload = jwt.verify(token, SECRET)
    // mongo path
    if (UserModel && mongoose && mongoose.connection.readyState === 1) {
      const user = await UserModel.findById(payload.id).select('-passwordHash')
      if (!user) return res.status(404).json({ message: 'User not found' })
      return res.json({ id: user._id, name: user.name, email: user.email, role: user.role })
    }
    const db = await readDB()
    const user = db.users.find(u => u.id === payload.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role })
  } catch (e) {
    res.status(401).json({ message: 'Invalid token' })
  }
})

module.exports = router
