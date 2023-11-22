const express = require('express')
const router = express.Router()
const Multer = require('multer')
const { upload, download } = require('../services/minio')

// const pg = require('../services/pgService')

router.post('/file/:draft_id/:range_id/:time_id', Multer({ storage: Multer.memoryStorage() }).array("file"), async (req, res) => {
    try {
        if (!req.user) return res.send({ error: 'user not found' })
        const { draft_id, range_id, time_id } = req.params
        const uploadeds = await Promise.all(req.files.map(async (file) => {
            const { originalname, buffer } = file
            const refinedName = Buffer.from(originalname, 'latin1').toString('utf8')
            const uploaded = await upload({ Key: `${draft_id}/${range_id}/${time_id}/models/${Date.now()}_${refinedName}`, Body: buffer, hasTimeStamp: true })
            return uploaded
        }))
        await upload({ Key: `${draft_id}/${range_id}/${time_id}/results/empty`, Body: '', hasTimeStamp: true })
        // const { originalname, buffer } = req.file
        // const uploaded = await upload({ Key: originalname, Body: buffer })
        return res.send(uploadeds)
    } catch (error) {
        return res.send([])
    }
})

router.get('/file/:draft_id/:range_id/:time_id/:name', async (req, res) => {
    const { draft_id, range_id, time_id, name } = req.params
    const list = await download({ Key: `${draft_id}/${range_id}/${time_id}/results/${name}` })
    if (!list.error) list.pipe(res)
    else return res.send(list)
})

module.exports = router