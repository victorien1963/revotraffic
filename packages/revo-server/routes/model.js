const express = require('express')
const router = express.Router()
const Multer = require('multer')
const { upload, download } = require('../services/minio')

// const pg = require('../services/pgService')

router.post('/file/:time_id', Multer({ storage: Multer.memoryStorage() }).array("file"), async (req, res) => {
    try {
        if (!req.user) return res.send({ error: 'user not found' })
        const uploadeds = await Promise.all(req.files.map(async (file) => {
            const { originalname, buffer } = file
            const refinedName = Buffer.from(originalname, 'latin1').toString('utf8')
            const uploaded = await upload({ Key: refinedName, Body: buffer })
            return uploaded
        }))
        // const { originalname, buffer } = req.file
        // const uploaded = await upload({ Key: originalname, Body: buffer })
        return res.send(uploadeds)
    } catch (error) {
        return res.send([])
    }
})

router.get('/list/:time_id', async (req, res) => {
    if (!req.user) return res.send([])
    const list = await download({ Key: `result/list.csv` })
    if (!list.error) list.pipe(res)
    else return res.send(list)
})

router.get('/file/:time_id/:name', async (req, res) => {
    if (!req.user) return res.send([])
    const list = await download({ Key: `result/${req.params.name}` })
    if (!list.error) list.pipe(res)
    else return res.send(list)
})

module.exports = router