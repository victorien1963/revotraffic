const { Server } = require('socket.io')
const pg = require('./pgService')
const { start, getTaskStatus, getResultXlsx } = require('./video')

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
        io.to(id).emit('video_status', {
          status: 'starting',
          message: 'starting job',
        })
        const getTask = async (task_id) => {
          console.log('---------------delaying result-------------------')
          console.log(task_id)
          await delay(5000)
          const { status, message } = await getTaskStatus(task_id)
          console.log('---------------getting result-------------------')
          console.log(status)
          console.log(message)
          if (status === 'pending' || status === 'running') {
            console.log('---------------result not completed-------------------')
            io.to(id).emit('video_status', {
              status,
              message,
            })
            getTask(task_id)
          } else if (status === 'error') {
            io.to(id).emit('video_status', {
              status,
              message,
            })
          } else{
            const result = await getResultXlsx(task_id)
            console.log('save data')
            console.log(parseInt(target, 10))
            const updated = await pg.exec('one', 'UPDATE times SET setting = $2 WHERE time_id = $1 RETURNING *', [timeId, {
              ...setting,
              videos: setting.videos.map((v, i) => parseInt(i, 10) === parseInt(target, 10) ? {
                ...v,
                task_id,
                task_status: 'success',
                result
              } : v)
            }])
            console.log(updated.setting.videos)
            io.to(id).emit('video', result)
          }
        }
        const { setting } = await pg.exec('one', 'SELECT setting FROM times WHERE time_id = $1', [timeId])
        const { name } = setting.videos[target]
        console.log('---------------starting job-------------------')
        const started = await start(name)
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
