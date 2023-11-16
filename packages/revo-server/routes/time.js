const express = require('express')
const router = express.Router()
const Multer = require('multer')
const { upload, download } = require('../services/minio')

const pg = require('../services/pgService')

router.get('/:range_id', async (req, res) => {
    if (!req.user) return res.send([])
    const times = await pg.exec('any', 'SELECT * FROM times WHERE range_id = $1', [req.params.range_id])
    return res.send(times)
})

router.post('/:range_id', async (req, res) => {
    if (!req.user) return res.send({ error: 'user not found' })
    const time = await pg.exec('one', 'INSERT INTO times(range_id, setting, created_on, updated_on) values($1, $2, current_timestamp, current_timestamp) RETURNING *', [req.params.range_id, {
        ...req.body,
        videos: [],
      }])
    return res.send(time)
})

router.put('/:time_id', async (req, res) => {
    if (!req.user) return res.send({ error: 'user not found' })
    const old = await pg.exec('one', 'SELECT setting FROM times WHERE time_id = $1', [req.params.time_id])
    const time = await pg.exec('one', 'UPDATE times SET setting = $2 WHERE time_id = $1 RETURNING *', [req.params.time_id, {
        ...old.setting,
        ...req.body,
      }])
    return res.send(time)
})

router.delete('/:time_id', async (req, res) => {
    if (!req.user) return res.send({ error: 'user not found' })
    const deleted = await pg.exec('oneOrNone', 'DELETE FROM times WHERE time_id = $1 RETURNING *', [req.params.time_id])
    return res.send(deleted)
})

router.post('/file/:time_id', Multer({ storage: Multer.memoryStorage() }).single("file"), async (req, res) => {
    try {
        if (!req.user) return res.send({ error: 'user not found' })
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

router.post('/video/:time_id', async (req, res) => {
    if (!req.user) return res.send({ error: 'user not found' })
    const uploads = await Promise.all(JSON.parse(req.body.files).map((file) => {
        return upload({ Key: file.name, Body: Buffer.from(file.data) })
    }))
    const { video } = req.body
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
    const file = await download({ Key: req.params.name })
    if (!file.error) file.pipe(res)
    else return res.send(file)
  })

router.delete('/video/:time_id/:index', async (req, res) => {
    if (!req.user) return res.send({ error: 'user not found' })
    const old = await pg.exec('one', 'SELECT setting FROM times WHERE time_id = $1', [req.params.time_id])
    const time = await pg.exec('one', 'UPDATE times set setting = $2, updated_on = current_timestamp WHERE time_id = $1 RETURNING time_id,setting', [req.params.time_id, { ...old.setting, videos: old.setting.videos.filter((v, i) => i !== parseInt(req.params.index, 10) ) }])
    return res.send(time)
})

module.exports = router