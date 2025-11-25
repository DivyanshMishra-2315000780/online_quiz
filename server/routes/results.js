const express = require('express')
const router = express.Router()
const { readDB, writeDB } = require('../db')
const auth = require('../middleware/auth')

// submit a result
router.post('/', auth, async (req,res)=>{
  const { examId, score, answers } = req.body
  if (!examId) return res.status(400).json({ message: 'Missing examId' })
  const db = await readDB()
  db.results = db.results || []
  const result = { id: `r${db.results.length+1}`, examId, userId: req.user.id, score: score || 0, answers: answers || [], date: new Date().toISOString() }
  db.results.push(result)
  await writeDB(db)
  res.json(result)
})

// get all results (admin) or user's own results
router.get('/', auth, async (req,res)=>{
  const db = await readDB()
  if (req.user.role === 'admin') return res.json(db.results || [])
  const mine = (db.results || []).filter(r => r.userId === req.user.id)
  res.json(mine)
})

module.exports = router
