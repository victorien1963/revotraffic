const pg = require('./pgService')

const initDraft = async (user_id) => {
    try {
        const drafts = await pg.exec('any', 'SELECT * FROM drafts WHERE user_id = $1 ORDER BY updated_on DESC', [user_id])
        if (!drafts.length) {
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
            return [draft]
        }
        return drafts
    } catch (e) {
        console.error('fail to init draft')
        console.log(e)
        return []
    }
}

const editDraft = async ({ draft_id, setting }) => {
    try {
        const old = await pg.exec('one', 'SELECT setting FROM drafts WHERE draft_id = $1', [draft_id])
        const draft = await pg.exec('one', 'UPDATE drafts set setting = $2, updated_on = current_timestamp WHERE draft_id = $1 RETURNING draft_id,setting', [draft_id, { ...old.setting, ...setting }])
        return draft
    } catch (e) {
        console.error('fail to update draft')
        console.log(e)
        return {}
    }
}

module.exports = {
    initDraft,
    editDraft,
}