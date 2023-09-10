const express = require('express')
const router = express.Router()

const pg = require('../services/pgService')

router.post('/', async (req, res) => {
    if (!req.user) res.send({ error: 'user not found' })
    const { user_id } = req.user
    const draft = await pg.exec('one', 'INSERT INTO drafts(user_id, setting, created_on, updated_on) values($1, $2, current_timestamp, current_timestamp) RETURNING *', [user_id, {
        modals: [],
        roadLine: null,
        roadAdjust: null,
        roads: null,
        videos: [],
        time: {},
        projects: [],
        selectedProject: '',
      }])
    return res.send(draft)
})

router.delete('/:draft_id', async (req, res) => {
    if (!req.user) res.send({ error: 'user not found' })
    const deleted = await pg.exec('oneOrNone', 'DELETE FROM drafts WHERE draft_id = $1 RETURNING *', [`${req.params.draft_id}`])
    return res.send(deleted)
})

module.exports = router