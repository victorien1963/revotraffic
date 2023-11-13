const express = require('express')

const app = express()
const path = require('path')
const { createProxyMiddleware } = require('http-proxy-middleware')

const socketProxy = createProxyMiddleware('/socket.io', {
  target: process.env.REACT_SERVER_URL,
  changeOrigin: true,
  ws: true,
  logLevel: 'debug',
})

const proxy = createProxyMiddleware('/api', {
  target: process.env.REACT_SERVER_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/': '/',
  },
})

app.use(socketProxy)
app.use(proxy)

app.use(express.json({ limit: '100000kb' }))
app.use(express.urlencoded({ extended: false }))
app.use('/static', express.static(path.join(__dirname, '..', 'public')))
app.use(express.static(path.join(__dirname, '..', 'build')))
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '..', 'build', 'index.html'))
})

// start express server on port 3000
app.listen(3001, () => {
  console.log('server started on port 3001')
})
