const fs = require('fs').promises
const path = require('path')

const DB_PATH = path.join(__dirname, 'data', 'db.json')

async function readDB(){
  try {
    const raw = await fs.readFile(DB_PATH, 'utf8')
    return JSON.parse(raw)
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Return empty structure if file doesn't exist
      return { users: [], exams: [], results: [] }
    }
    throw error
  }
}

async function writeDB(data){
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf8')
  } catch (error) {
    console.error('Error writing to DB:', error)
    throw error
  }
}

module.exports = { readDB, writeDB }
