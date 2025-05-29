const express = require('express')
const router = express.Router()

const pg = require('../services/pgService')
const checkRole = require('../middlewares/is-role.middleware')
const { Role } = require('../constants');

router.get('/:draft_id', async (req, res) => {
    if (!req.user) return res.send([])
    const ranges = await pg.exec('any', 'SELECT * FROM ranges WHERE draft_id = $1', [req.params.draft_id])
    return res.send(ranges)
})

router.post('/:draft_id', checkRole([Role.USER]), async (req, res) => {
   
    const range = await pg.exec('one', 'INSERT INTO ranges(draft_id, setting, created_on, updated_on) values($1, $2, current_timestamp, current_timestamp) RETURNING *', [req.params.draft_id, {
        ...req.body,
      }])
    return res.send(range)
})

router.put('/:range_id', checkRole([Role.USER]), async (req, res) => {
    
    const old = await pg.exec('one', 'SELECT setting FROM ranges WHERE range_id = $1', [req.params.range_id])
    const range = await pg.exec('one', 'UPDATE ranges SET setting = $2 WHERE range_id = $1 RETURNING *', [req.params.range_id, {
        ...old.setting,
        ...req.body,
      }])
    return res.send(range)
})

router.delete('/:range_id', checkRole([Role.USER]), async (req, res) => {

    const deleted = await pg.exec('oneOrNone', 'DELETE FROM ranges WHERE range_id = $1 RETURNING *', [req.params.range_id])
    return res.send(deleted)
})

module.exports = router