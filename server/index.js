const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()
app.use(cors())
app.use(express.json())

const authRoutes = require('./routes/auth')
const examsRoutes = require('./routes/exams')
const resultsRoutes = require('./routes/results')
const adminRoutes = require('./routes/admin')
const { connect: connectMongo, mongoose } = require('./mongo')
const { readDB, writeDB } = require('./db')
const bcrypt = require('bcryptjs')

app.use('/api/auth', authRoutes)
app.use('/api/exams', examsRoutes)
app.use('/api/results', resultsRoutes)
app.use('/api/admin', adminRoutes)

	// seed admin user if missing
	; (async function seedAdmin() {
		try {
			const db = await readDB()
			const hasAdmin = db.users && db.users.find(u => u.role === 'admin')
			if (!hasAdmin) {
				const pass = process.env.ADMIN_PW || 'Admin@123'
				const hash = await bcrypt.hash(pass, 10)
				const admin = { id: 'admin-1', name: 'Administrator', email: 'admin@example.com', passwordHash: hash, role: 'admin' }
				db.users = db.users || []
				db.users.push(admin)
				await writeDB(db)
				console.log('Seeded admin user: admin@example.com /', process.env.ADMIN_PW ? 'provided password' : 'Admin@123')
			}
		} catch (e) { console.error('Admin seed failed', e) }
	})()

// simple health
app.get('/health', (req, res) => res.json({ status: 'ok' }))

// Global error handler
app.use((err, req, res, next) => {
	console.error(err.stack)
	res.status(500).json({ message: 'Something went wrong!', error: err.message })
})

const PORT = process.env.PORT || 5000

async function start() {
	// attempt mongo connect if MONGO_URI provided
	try {
		await connectMongo()
	} catch (e) {
		console.warn('Continuing without MongoDB (file DB will be used).')
	}

	try {
		app.listen(PORT, () => console.log(`Server listening on ${PORT}`))
	} catch (error) {
		console.error('Failed to start server:', error)
		process.exit(1)
	}
}

start()
