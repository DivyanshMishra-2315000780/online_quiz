const express = require('express')
const router = express.Router()
const { readDB, writeDB } = require('../db')
const auth = require('../middleware/auth')

router.get('/', async (req,res)=>{
  const db = await readDB()
  res.json(db.exams || [])
})

router.post('/', auth, async (req,res)=>{
  // only admin
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' })
  const { title, desc, time } = req.body
  const db = await readDB()
  const id = `e${(db.exams.length+1)}`
  const exam = { id, title, desc, time }
  db.exams.push(exam)
  await writeDB(db)
  res.json(exam)
})

module.exports = router
