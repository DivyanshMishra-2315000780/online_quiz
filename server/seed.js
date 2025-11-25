const { connect, mongoose } = require('./mongo')
const User = require('./models/User')
const Exam = require('./models/Exam')
const Result = require('./models/Result')
const bcrypt = require('bcryptjs')

async function run(){
  // Accept either MONGO_URI or MONGODB_URL; if none provided, mongo.connect() will fall back to the default local DB
  if (!process.env.MONGO_URI && !process.env.MONGODB_URL){
    console.warn('No MONGO_URI or MONGODB_URL found in environment; seed will attempt to use default local Mongo URL.')
  }
  try{
    await connect()
    console.log('Seeding MongoDB...')

    // cleanup
    await User.deleteMany({})
    await Exam.deleteMany({})
    await Result.deleteMany({})

    const users = [
      { name: 'Administrator', email: 'admin@example.com', role: 'admin', password: process.env.ADMIN_PW || 'Admin@123' },
      { name: 'Teacher One', email: 'teacher@example.com', role: 'teacher', password: process.env.TEACHER_PW || 'Teacher@123' },
      { name: 'Student One', email: 'student1@example.com', role: 'student', password: process.env.STUDENT_PW || 'Student@123' },
    ]

    const createdUsers = []
    for(const u of users){
      const hash = await bcrypt.hash(u.password, 10)
      const nu = await User.create({ name: u.name, email: u.email, role: u.role, passwordHash: hash })
      createdUsers.push({ ...u, id: nu._id })
    }

    // sample exams
    const exam1 = await Exam.create({
      title: 'Math Basics',
      desc: 'Simple arithmetic and number sense',
      time: '15',
      questions: [
        { text: '2 + 2 = ?', choices: ['3','4','5','22'], answer: '4' },
        { text: '5 * 6 = ?', choices: ['11','30','56','35'], answer: '30' }
      ],
      createdBy: null
    })

    const exam2 = await Exam.create({
      title: 'Science Intro',
      desc: 'Basic science knowledge',
      time: '20',
      questions: [
        { text: 'Water boils at ___ °C', choices: ['90','100','80','120'], answer: '100' },
      ],
      createdBy: null
    })

  console.log('Seed complete. Users:')
    createdUsers.forEach(u => console.log(`${u.role}: ${u.email} / ${u.password}`))
    console.log('Exams created:', [exam1.title, exam2.title])

    process.exit(0)
  }catch(e){
    console.error('Seed failed', e)
    process.exit(1)
  }
}

run()
