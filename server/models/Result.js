const { Schema, model } = require('mongoose')

const ResultSchema = new Schema({
  examId: { type: Schema.Types.ObjectId, ref: 'Exam' },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  score: Number,
  answers: Schema.Types.Mixed,
  date: { type: Date, default: Date.now }
})

module.exports = model('Result', ResultSchema)
