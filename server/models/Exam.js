const { Schema, model } = require('mongoose')

const QuestionSchema = new Schema({
  text: String,
  choices: [String],
  answer: String
})

const ExamSchema = new Schema({
  title: { type: String, required: true },
  desc: String,
  time: String,
  questions: [QuestionSchema],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  students: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
})

module.exports = model('Exam', ExamSchema)
