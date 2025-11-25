const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { mongoose } = require('../mongo')
let User, Exam
try{ User = require('../models/User'); Exam = require('../models/Exam') }catch(e){}
const { readDB, writeDB } = require('../db')

// helper to ensure admin
function requireAdmin(req,res,next){ if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' }); next() }

// Users CRUD (mongo preferred)
router.get('/users', auth, requireAdmin, async (req,res)=>{
  if (User && mongoose && mongoose.connection.readyState===1){
    const u = await User.find().select('-passwordHash')
    return res.json(u)
  }
  const db = await readDB()
  res.json(db.users || [])
})

router.post('/users', auth, requireAdmin, async (req,res)=>{
  const { name, email, role, password } = req.body
  if (User && mongoose && mongoose.connection.readyState===1){
    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ message: 'User exists' })
    const bcrypt = require('bcryptjs')
    const hash = await bcrypt.hash(password || 'changeme', 10)
    const u = await User.create({ name, email, role: role||'student', passwordHash: hash })
    return res.json({ id: u._id, name: u.name, email: u.email, role: u.role })
  }
  const db = await readDB()
  const id = `u${(db.users||[]).length+1}`
  const user = { id, name, email, role: role||'student', passwordHash: (password||'changeme') }
  db.users = db.users || []
  db.users.push(user)
  await writeDB(db)
  res.json(user)
})

router.put('/users/:id', auth, requireAdmin, async (req,res)=>{
  const { id } = req.params
  const { name, role } = req.body
  if (User && mongoose && mongoose.connection.readyState===1){
    const u = await User.findByIdAndUpdate(id, { name, role }, { new:true }).select('-passwordHash')
    return res.json(u)
  }
  const db = await readDB()
  const idx = db.users.findIndex(x=>x.id===id)
  if (idx===-1) return res.status(404).json({ message: 'Not found' })
  db.users[idx].name = name || db.users[idx].name
  db.users[idx].role = role || db.users[idx].role
  await writeDB(db)
  res.json(db.users[idx])
})

router.delete('/users/:id', auth, requireAdmin, async (req,res)=>{
  const { id } = req.params
  if (User && mongoose && mongoose.connection.readyState===1){
    await User.findByIdAndDelete(id)
    return res.json({ ok:true })
  }
  const db = await readDB()
  db.users = (db.users || []).filter(u=>u.id!==id)
  await writeDB(db)
  res.json({ ok:true })
})

// Exams CRUD for admin
router.get('/exams', auth, requireAdmin, async (req,res)=>{
  if (Exam && mongoose && mongoose.connection.readyState===1){
    const e = await Exam.find().populate('createdBy','name email')
    return res.json(e)
  }
  const db = await readDB()
  res.json(db.exams || [])
})

router.post('/exams', auth, requireAdmin, async (req,res)=>{
  const { title, desc, time } = req.body
  if (Exam && mongoose && mongoose.connection.readyState===1){
    const ex = await Exam.create({ title, desc, time })
    return res.json(ex)
  }
  const db = await readDB(); const id = `e${(db.exams||[]).length+1}`
  const ex = { id, title, desc, time }
  db.exams = db.exams || []
  db.exams.push(ex)
  await writeDB(db)
  res.json(ex)
})

router.put('/exams/:id', auth, requireAdmin, async (req,res)=>{
  const { id } = req.params
  const { title, desc, time } = req.body
  if (Exam && mongoose && mongoose.connection.readyState===1){
    const ex = await Exam.findByIdAndUpdate(id, { title, desc, time }, { new:true })
    return res.json(ex)
  }
  const db = await readDB()
  const idx = (db.exams||[]).findIndex(x=>x.id===id)
  if (idx===-1) return res.status(404).json({ message:'Not found' })
  db.exams[idx] = { ...db.exams[idx], title, desc, time }
  await writeDB(db)
  res.json(db.exams[idx])
})

router.delete('/exams/:id', auth, requireAdmin, async (req,res)=>{
  const { id } = req.params
  if (Exam && mongoose && mongoose.connection.readyState===1){
    await Exam.findByIdAndDelete(id)
    return res.json({ ok:true })
  }
  const db = await readDB()
  db.exams = (db.exams||[]).filter(x=>x.id!==id)
  await writeDB(db)
  res.json({ ok:true })
})

module.exports = router
