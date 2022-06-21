require('dotenv').config()
const express = require('express')
const authRoute = require('./routes/auth')

const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json())
app.use(authRoute)

app.get('/', (req, res) => {
  res.send('Connection Alive')
})

app.listen(PORT, '192.168.0.203',  () => {
  console.log(`Server Listening on port ${PORT}`)
})