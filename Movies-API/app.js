const express = require('express')
const fs = require('fs')

const app = express()

app.use(express.json())
app.use(express.static('./public'))

const movieRouter =  require('./routes/movies.routes.js')



app.use('/api/v1/movies',movieRouter)



module.exports = app