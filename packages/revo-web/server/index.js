const express = require('express')

const app = express()
const path = require('path')
const proxy = require('express-http-proxy')
const { createProxyMiddleware } = require('http-proxy-middleware')

const socketProxy = createProxyMiddleware('/socket.io', {
  target: process.env.REACT_SERVER_URL,
  changeOrigin: true,
  ws: true,
  logLevel: 'debug',
})

app.use(express.json({ limit: '100000kb' }))
app.use(express.urlencoded({ extended: false }))

app.use(socketProxy)
app.use('/api', proxy(process.env.REACT_SERVER_URL, { limit: '120mb' }))
app.use('/static', express.static(path.join(__dirname, '..', 'public')))
app.use(express.static(path.join(__dirname, '..', 'build')))
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '..', 'build', 'index.html'))
})

// start express server on port 3000
app.listen(3000, () => {
  console.log('server started on port 3000')
})
