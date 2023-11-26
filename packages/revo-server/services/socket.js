const { Server } = require('socket.io')
const pg = require('./pgService')
const fs = require('fs/promises')
const { createWriteStream } = require('fs')
const { download } = require('./minio')
const { upload, start, getResultXlsx } = require('./video')

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const socket = {}
socket.init = (server, setting) => {
  const io = new Server(server, setting)
  io.on('connection', (socket) => {
    const id = socket.handshake.auth.auth
    socket.join(id)

    // draft
    socket.on('video', async ({ timeId, target }) => {
      try {
        const getTask = async (task_id) => {
          console.log('---------------delaying result-------------------')
          console.log(task_id)
          await delay(5000)
          const result = await getResultXlsx(task_id)
          console.log('---------------getting result-------------------')
          if (result.error) {
            console.log('---------------result not completed-------------------')
            getTask(task_id)
          } else {
            io.to(id).emit('video', result)
          }
        }
        const { setting } = await pg.exec('one', 'SELECT setting FROM times WHERE time_id = $1', [timeId])
        const { name } = setting.videos[target]
        console.log('---------------getting video-------------------')
        const file = await download({ Key: name })
        const destination = createWriteStream("./public/video.mp4")
        file.pipe(destination)
        await delay(10000)
        const saved = await fs.readFile('./public/video.mp4')
        console.log('---------------uploading video-------------------')
        const { video_id } = await upload(saved)
        console.log('---------------starting job-------------------')
        const started = await start(video_id)
        const task_id = started.id
        console.log('---------------writing status-------------------')
        await pg.exec('one', 'UPDATE times SET setting = $2 WHERE time_id = $1 RETURNING *', [timeId, {
          ...setting,
          videos: setting.videos.map((v, i) => i === target ? {
            ...v,
            task_id,
            task_status: 'pending'
          } : v)
        }])
        getTask(task_id)
      } catch (e) {
        console.log(e)
      }
    })
  })
  socket.io = io
}

module.exports = socket
