const { Server } = require('socket.io')
const { getImage, getStreamResponse, getChatResponse } = require('./chatgpt')
const { initDraft, editDraft } = require('./draft')
// const { getPic } = require('./stableDiffusion')
const pg = require('./pgService')

const initHelper = async (user_id, callback) => {
  let chats = await pg.exec('any', 'SELECT * FROM chats WHERE user_id = $1', [user_id])
  callback(chats)
}

const splitText = (origin) => {
  const t = origin.replaceAll('：', ':')
  if (t.includes(':'))
    return t.split(':').map((s) => s.trim())
  else if (t.includes('：'))
    return t.split('：').map((s) => s.trim())
  else if (t.includes('-'))
    return t.split('-').map((s) => s.trim())
  else return [t, '']
}

const socket = {}
socket.init = (server, setting) => {
  const io = new Server(server, setting)
  io.on('connection', (socket) => {
    const id = socket.handshake.auth.auth
    socket.join(id)

    // gpt helper
    initHelper(id, (chats) => io.to(id).emit('gpt', chats))
    socket.on('gpt', async (message) => {
      const newMessage = await pg.exec('one', 'INSERT INTO chats(user_id, setting, created_on) VALUES($1, $2, current_timestamp) RETURNING *', [id, { chat: message, from: id }])
      io.to(id).emit('chat', newMessage)
      const history = await pg.exec('any', 'SELECT setting FROM chats WHERE user_id = $1', [id])
      getChatResponse(history.slice(Math.max(0, history.length - 11), history.length).map((h) => ({ role: h.setting.from === 'gpt' ? 'assistant' : 'user', content: h.setting.chat })), (stream) => io.to(id).emit('stream', stream), async (chat) => {
        const newChat = await pg.exec('one', 'INSERT INTO chats(user_id, setting, created_on) VALUES($1, $2, current_timestamp) RETURNING *', [id, { chat, from: 'gpt'  }])
        io.to(id).emit('chat', newChat)
      }, 200)
    })

    // draft
    socket.on('draft', async ({ action, data }) => {
      if (action === 'init') {
        const draft = await initDraft(id)
        io.to(id).emit('draft', draft)
      } else if (action === 'update') {
        editDraft(data)
      }
    })    
  })
  socket.io = io
}

module.exports = socket
