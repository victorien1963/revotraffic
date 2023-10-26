/* eslint-disable no-console */
require('dotenv').config()
const createError = require('http-errors')
const express = require('express')
const path = require('path')

const fs = require('fs/promises')
const { createWriteStream } = require('fs')
const { upload, download } = require('./services/minio')
const apiServices = require('./services/apiService')

const cookieParser = require('cookie-parser')
const logger = require('morgan')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const socket = require('./services/socket')
// postgres
const pg = require('./services/pgService')

const app = express()

// warp image api
app.post('/warp_image', async (req, res) => {
  const { Key } = req.query
  const file = await download({ Key })
  const destination = createWriteStream("./public/save.png")
  file.pipe(destination)
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
  await delay(5000)

  const saved = await fs.readFile('./public/save.png')
  const img = await apiServices.send({
    url: `${process.env.IMAGE_WARP_API}/api/warp_image`,
    method: 'post',
    data: saved,
    params: req.query,
    responseType: 'arraybuffer'
  })
  const uploaded = await upload({ Key: `haha`, Body: Buffer.from(img) })
  return res.send({
    data: uploaded
  })
})

const authRouter = require('./routes/auth')
const draftRouter = require('./routes/draft')
const rangeRouter = require('./routes/range')
const timeRouter = require('./routes/time')

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(cors())
app.use(logger('dev'))

app.use(express.json({ limit: '1000000kb' }))
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

async function getUser(req, res, next) {
  const token = req.header('Authorization') || req.header('authorization')
  if (token) {
    try {
      const decoded = jwt.verify(token.replace('Bearer ', ''), 'APPLE')
      const user = await pg.exec('oneOrNone', 'SELECT user_id,name,email,setting FROM users WHERE user_id = $1', [decoded._id])
      if (user) req.user = user
      else return res.status('401').send('auth failed')
    } catch (err) {
      return res.status('401').send('auth failed')
    }
  }
  next()
}

app.use('/auth', authRouter)
app.use('/draft', getUser, draftRouter)
app.use('/range', getUser, rangeRouter)
app.use('/time', getUser, timeRouter)
app.get('/me', getUser, async (req, res) => {
  return res.send({
    user: req.user,
  })
})

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
})

const logErrors = (err, req, res, next) => {
  console.error(err.stack)
  next(err)
}

const clientErrorHandler = (err, req, res, next) => {
  if (req.xhr) {
    res.status(500).send({ error: 'Something failed!' })
  } else {
    next(err)
  }
}

const errorHandler = (err, req, res) => {
  res.status(500)
  res.render('error', { error: err })
}

app.use(logErrors)
app.use(clientErrorHandler)
app.use(errorHandler)

module.exports = app
