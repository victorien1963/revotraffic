const express = require('express')
const router = express.Router()
const { upload, download } = require('../services/minio')

const pg = require('../services/pgService')

router.get('/', async (req, res) => {
    if (!req.user) return res.send([])
    const { user_id } = req.user
    const drafts = await pg.exec('any', 'SELECT *,(SELECT name as user_name FROM users u WHERE u.user_id = d.user_id) FROM drafts d WHERE user_id = $1', [user_id])
    return res.send(drafts)
})

router.post('/', async (req, res) => {
    if (!req.user) return res.send({ error: 'user not found' })
    const { user_id } = req.user
    const draft = await pg.exec('one', 'INSERT INTO drafts(user_id, setting, created_on, updated_on) values($1, $2, current_timestamp, current_timestamp) RETURNING *', [user_id, {
        ...req.body,
      }])
    return res.send(draft)
})

router.put('/:draft_id', async (req, res) => {
    if (!req.user) return res.send({ error: 'user not found' })
    const old = await pg.exec('one', 'SELECT setting FROM drafts WHERE draft_id = $1', [req.params.draft_id])
    const draft = await pg.exec('one', 'UPDATE drafts SET setting = $2 WHERE draft_id = $1 RETURNING *', [req.params.draft_id, {
        ...old.setting,
        ...req.body,
      }])
    return res.send(draft)
})

router.delete('/:draft_id', async (req, res) => {
    if (!req.user) return res.send({ error: 'user not found' })
    const deleted = await pg.exec('oneOrNone', 'DELETE FROM drafts WHERE draft_id = $1 RETURNING *', [`${req.params.draft_id}`])
    return res.send(deleted)
})

router.get('/video/:name', async (req, res) => {
    const file = await download({ Key: req.params.name })
    if (!file.error) file.pipe(res)
    else return res.send(file)
  })

router.post('/video/:draft_id', async (req, res) => {
    if (!req.user) return res.send({ error: 'user not found' })
    const uploads = await Promise.all(JSON.parse(req.body.files).map((file) => upload({ Key: file.name, Body: Buffer.from(file.data) })))
    const old = await pg.exec('one', 'SELECT setting FROM drafts WHERE draft_id = $1', [req.params.draft_id])
    const draft = await pg.exec('one', 'UPDATE drafts set setting = $2, updated_on = current_timestamp WHERE draft_id = $1 RETURNING draft_id,setting', [req.params.draft_id, { ...old.setting, videos: [...old.setting.videos, ...uploads] }])
    return res.send(draft)
})

router.delete('/video/:draft_id/:index', async (req, res) => {
    if (!req.user) return res.send({ error: 'user not found' })
    const old = await pg.exec('one', 'SELECT setting FROM drafts WHERE draft_id = $1', [req.params.draft_id])
    const draft = await pg.exec('one', 'UPDATE drafts set setting = $2, updated_on = current_timestamp WHERE draft_id = $1 RETURNING draft_id,setting', [req.params.draft_id, { ...old.setting, videos: old.setting.videos.filter((v, i) => i !== parseInt(req.params.index, 10) ) }])
    return res.send(draft)
})

module.exports = router