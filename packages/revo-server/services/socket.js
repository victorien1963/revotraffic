const { Server } = require('socket.io')
const pg = require('./pgService')
const { upload } = require('./minio')
const {
  start,
  getTaskStatus,
  getResultXlsx,
  getResultCarSpacing,
  getResultSpeed,
  getResultVideo,
  getResultVideoWarp,
} = require('./video')

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
          if (!task_id) {
            io.to(id).emit('video_status', {
              status: 'error',
              message: '發生錯誤，請檢查路口或路段標記',
            })
            return
          }
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
            const [result, resultVideo, resultCarSpacing, resultSpeed, resultVideoWarp] = await Promise.all([
              getResultXlsx(task_id),
              getResultVideo(task_id),
              getResultCarSpacing(task_id),
              getResultSpeed(task_id),
              getResultVideoWarp(task_id)
            ])

            let result_video = { name: '' }
            let result_video_warp = { name: '' }
            try {
              result_video = await upload({ Key: 'result.mp4', Body: Buffer.from(resultVideo) })
            } catch (e) {
              console.log(resultVideo)
              console.log(e)
            }
            try {
              result_video_warp = await upload({ Key: 'resultWarp.mp4', Body: Buffer.from(resultVideoWarp) })
            } catch (e) {
              console.log(resultVideoWarp)
              console.log(e)
            }
            const updated = await pg.exec('one', 'UPDATE times SET setting = $2 WHERE time_id = $1 RETURNING *', [timeId, {
              ...setting,
              videos: setting.videos.map((v, i) => parseInt(i, 10) === parseInt(target, 10) ? {
                ...v,
                task_id,
                task_status: 'success',
                result,
                result_video,
                resultCarSpacing,
                resultSpeed,
                result_video_warp
              } : v)
            }])
            io.to(id).emit('video', updated)
          }
        }
        const { setting } = await pg.exec('one', 'SELECT setting FROM times WHERE time_id = $1', [timeId])
        const { name, type, roadAdjust, tarW, tarH, warpPixelRate } = setting.videos[target]
        console.log('---------------starting job-------------------')
        const params = { name }
        params.road_mode = type === '路口' ? 'cross' : 'straight'
        if (roadAdjust && roadAdjust.points) params.srcPoints = [
          parseInt(roadAdjust.points[0].style.left, 10),
          parseInt(roadAdjust.points[0].style.top, 10),
          parseInt(roadAdjust.points[1].style.left, 10),
          parseInt(roadAdjust.points[1].style.top, 10),
          parseInt(roadAdjust.points[3].style.left, 10),
          parseInt(roadAdjust.points[3].style.top, 10),
          parseInt(roadAdjust.points[2].style.left, 10),
          parseInt(roadAdjust.points[2].style.top, 10),
        ].join()
        if (tarW) params.tarW = parseInt(tarW, 10)
        if (tarH) params.tarH = parseInt(tarH, 10)
        if (warpPixelRate) params.warpPixelRate = warpPixelRate
        console.log('---------calling api with these params--------')
        console.log(params)
        const started = await start(params)
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
