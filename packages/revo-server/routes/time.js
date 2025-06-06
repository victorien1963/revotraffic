const express = require('express')
const router = express.Router()
const Multer = require('multer')
const { upload, getSize, partial, getPresignedUrl } = require('../services/minio')

const pg = require('../services/pgService')
const checkRole = require('../middlewares/is-role.middleware')
const { Role } = require('../constants')

router.get('/presigned', async (req, res) => {
    if (!req.user) return res.send({})
    getPresignedUrl(req.query.name, (url) => res.send({
        url,
    }))
})

router.get('/:range_id', async (req, res) => {
    if (!req.user) return res.send([])
    const times = await pg.exec('any', 'SELECT * FROM times WHERE range_id = $1', [req.params.range_id])
    return res.send(times)
})

router.post('/:range_id', checkRole([Role.USER]), async (req, res) => {
    
    const time = await pg.exec('one', 'INSERT INTO times(range_id, setting, created_on, updated_on) values($1, $2, current_timestamp, current_timestamp) RETURNING *', [req.params.range_id, {
        ...req.body,
        videos: [],
      }])
    return res.send(time)
})

router.put('/:time_id', checkRole([Role.USER]), async (req, res) => {
   
    const old = await pg.exec('one', 'SELECT setting FROM times WHERE time_id = $1', [req.params.time_id])
    console.log('======updating time======')
    console.log(old.setting)
    console.log('======data here======')
    console.log(req.body)
    const updated = Object.keys(old.setting).reduce((prev, cur) => ({
        ...prev,
        [cur]: old.setting[cur].map ? old.setting[cur].map((p, i) => ({
            ...p,
            ...req.body[cur] ? req.body[cur][i] : {},
        }))  : req.body[cur] || old.setting[cur]
    }), {})
    console.log('=====updated here=====')
    const time = await pg.exec('one', 'UPDATE times SET setting = $2 WHERE time_id = $1 RETURNING *', [req.params.time_id, {
        ...updated, 
        ...req.body
    }])
    return res.send(time)
})

router.delete('/:time_id', checkRole([Role.USER]), async (req, res) => {
   
    const deleted = await pg.exec('oneOrNone', 'DELETE FROM times WHERE time_id = $1 RETURNING *', [req.params.time_id])
    return res.send(deleted)
})

router.post('/file/:time_id', checkRole([Role.USER]), Multer({ storage: Multer.memoryStorage() }).single("file"), async (req, res) => {
    try {
       
        console.log(req.file)
        const { originalname, buffer } = req.file
        const uploaded = await upload({ Key: originalname, Body: buffer })
        return res.send(uploaded)
    } catch (error) {
        return res.send({
            error
        })
    }
})

router.post('/video/:time_id', checkRole([Role.USER]), async (req, res) => {
  
    const uploads = await Promise.all(JSON.parse(req.body.files).map((file) => {
        return upload({ Key: file.name, Body: Buffer.from(file.data) })
    }))
    const { video, fileName } = req.body
    console.log(video)
    console.log(uploads)
    const old = await pg.exec('one', 'SELECT setting FROM times WHERE time_id = $1', [req.params.time_id])
    const time = await pg.exec(
        'one',
        'UPDATE times set setting = $2, updated_on = current_timestamp WHERE time_id = $1 RETURNING time_id,setting',
        [
            req.params.time_id, {
                ...old.setting,
                videos: [
                    ...old.setting.videos,
                    {
                        ...video,
                        originName: fileName,
                        thumbnail: uploads[0],
                        label: '',
                        date: '',
                        type: '路口',
                    }
                ]
            }
        ]
    )
    return res.send(time)
})

router.get('/video/:name', async (req, res) => {
    const size = await getSize({ Key: req.params.name })
    const rangeHeader = req.headers.range
    const splittedRange = rangeHeader.replace(/bytes=/, '').split('-')
    const start = parseInt(splittedRange[0])
    const end = Math.min(splittedRange[1] ? parseInt(splittedRange[1], 10) : start + 10 ** 6, size - 1)
    const contentLength = end - start + 1
    console.log(start)
    console.log(end)

    // create and set response headers
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    }
    const file = await partial({ Key: req.params.name, Range: `bytes=${start}-${end}` })
    res.writeHead(206, headers)
    file.pipe(res)
  })

router.delete('/video/:time_id/:index', checkRole([Role.USER]), async (req, res) => {
  
    const old = await pg.exec('one', 'SELECT setting FROM times WHERE time_id = $1', [req.params.time_id])
    const time = await pg.exec('one', 'UPDATE times set setting = $2, updated_on = current_timestamp WHERE time_id = $1 RETURNING time_id,setting', [req.params.time_id, { ...old.setting, videos: old.setting.videos.filter((v, i) => i !== parseInt(req.params.index, 10) ) }])
    return res.send(time)
})

module.exports = router