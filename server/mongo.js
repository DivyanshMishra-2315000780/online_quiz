const mongoose = require('mongoose')

// Accept either MONGO_URI or MONGODB_URL, otherwise fall back to a local default
const uri = process.env.MONGO_URI || process.env.MONGODB_URL || 'mongodb://localhost:27017/blog-user-hierarchy'

async function connect(){
  if (!uri) {
    console.warn('No MongoDB URI provided; skipping connection')
    return null
  }
  try{
    await mongoose.connect(uri, { useNewUrlParser:true, useUnifiedTopology:true })
    console.log('Connected to MongoDB:', uri)
    return mongoose
  }catch(e){
    console.error('MongoDB connect error', e.message)
    throw e
  }
}

module.exports = { connect, mongoose, uri }
