const bcrypt = require("bcrypt")

// postgres
const cn = {
  host: process.env.PG_HOST,
  port: process.env.PG_PORT || '5432',
  database: 'revotraffic',
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  max: 30
}
const pgp = require('pg-promise')()

const db = pgp(cn)

const initialCheck = async (check, checkParams, init, initParams) => {
    try {
        const result = await db.one(check, checkParams)
        if (result.received === 0) {
            await db.none(init, initParams)
        }
    } catch (e) {
        console.log(e)
        try {
            await db.none(init, initParams)
        } catch (error) {
            console.error(error)
        }
    }
}

const hash = async (password, saltRounds = 10) => {
    const salt = await bcrypt.genSalt(saltRounds) 
    const hashed = await bcrypt.hash(password, salt)
    return hashed
}

const checkAll = async () => {
    await db.none(`DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
            CREATE TYPE user_role AS ENUM ('SYSTEM_ADMIN', 'USER');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'draft_user_role') THEN
            CREATE TYPE draft_user_role AS ENUM ('PROJECT_ADMIN', 'PROJECT_DESIGNER', 'VISITOR');
        END IF;
    END $$;`);
    await db.none(
      "CREATE TABLE IF NOT EXISTS users (user_id serial PRIMARY KEY, name VARCHAR ( 50 ) NOT NULL, email VARCHAR ( 255 ) UNIQUE NOT NULL, password VARCHAR ( 500 ) NOT NULL, setting JSONB NOT NULL, created_on TIMESTAMP NOT NULL, last_login TIMESTAMP, role user_role NOT NULL DEFAULT 'USER')"
    );
    // await db.none('CREATE TABLE IF NOT EXISTS chats (chat_id serial PRIMARY KEY, setting JSONB NOT NULL, user_id serial NOT NULL, created_on TIMESTAMP NOT NULL, FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE cascade)')
    await db.none('CREATE TABLE IF NOT EXISTS drafts (draft_id serial PRIMARY KEY, setting JSONB NOT NULL, user_id serial NOT NULL, created_on TIMESTAMP NOT NULL, updated_on TIMESTAMP NOT NULL, FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE cascade)')
    await db.none('CREATE TABLE IF NOT EXISTS ranges (range_id serial PRIMARY KEY, setting JSONB NOT NULL, draft_id serial NOT NULL, created_on TIMESTAMP NOT NULL, updated_on TIMESTAMP NOT NULL, FOREIGN KEY (draft_id) REFERENCES drafts (draft_id) ON DELETE cascade)')
    await db.none('CREATE TABLE IF NOT EXISTS times (time_id serial PRIMARY KEY, setting JSONB NOT NULL, range_id serial NOT NULL, created_on TIMESTAMP NOT NULL, updated_on TIMESTAMP NOT NULL, FOREIGN KEY (range_id) REFERENCES ranges (range_id) ON DELETE cascade)')
    await db.none(
      "CREATE TABLE IF NOT EXISTS drafts_users (draft_id integer NOT NULL, user_id integer NOT NULL, role draft_user_role NOT NULL, created_by integer NOT NULL, created_on TIMESTAMP NOT NULL, updated_on TIMESTAMP NOT NULL, PRIMARY KEY (draft_id, user_id), FOREIGN KEY (draft_id) REFERENCES drafts (draft_id) ON DELETE CASCADE, FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE, FOREIGN KEY (created_by) REFERENCES users (user_id) ON DELETE CASCADE)"
    );
    console.log('All Table Checked')
}

const initData = async () => {
    if (!process.env.ADMIN_EMAIL) {
        console.log('admin email and password not set in .env file.')
    }
    console.log('Initing data')
    const hashed = await hash(process.env.ADMIN_PASSWORD)
    try {
      await initialCheck('SELECT * FROM users WHERE user_id = $1', ['1'], 'INSERT INTO users(user_id, name, email, password, setting, role, created_on) VALUES($1, $2, $3, $4, $5, $6, current_timestamp) ON CONFLICT DO NOTHING', ['1', 'sinotech', process.env.ADMIN_EMAIL, hashed, { admin: true }, 'SYSTEM_ADMIN'])
    //   await initialCheck('SELECT * FROM users WHERE user_id = $1', ['2'], 'INSERT INTO users(user_id, name, email, password, setting, created_on) VALUES($1, $2, $3, $4, $5, current_timestamp) ON CONFLICT DO NOTHING', ['2', 'dAIVinci02', `daivinci02@wavenet.com.tw`, hashed, { admin: true }])
    //   await initialCheck('SELECT * FROM users WHERE user_id = $1', ['3'], 'INSERT INTO users(user_id, name, email, password, setting, created_on) VALUES($1, $2, $3, $4, $5, current_timestamp) ON CONFLICT DO NOTHING', ['3', 'dAIVinci03', `daivinci03@wavenet.com.tw`, hashed, { admin: true }])
    //   await initialCheck('SELECT * FROM users WHERE user_id = $1', ['4'], 'INSERT INTO users(user_id, name, email, password, setting, created_on) VALUES($1, $2, $3, $4, $5, current_timestamp) ON CONFLICT DO NOTHING', ['4', 'dAIVinci04', `daivinci04@wavenet.com.tw`, hashed, { admin: true }])
    //   await initialCheck('SELECT * FROM users WHERE user_id = $1', ['5'], 'INSERT INTO users(user_id, name, email, password, setting, created_on) VALUES($1, $2, $3, $4, $5, current_timestamp) ON CONFLICT DO NOTHING', ['5', 'dAIVinci05', `daivinci05@wavenet.com.tw`, hashed, { admin: true }])
    } catch (e) {
      console.log('admin user already exists.')
      console.log(e)
    }
}

const testConnect = async () => {
    try {
        await db.connect()
        await checkAll()
        await initData()
        console.log('db test complete.')
    } catch (e) {
        console.log('db test failed, retry after 5 sec.')
        console.log(e)
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
        await delay(5000)
        testConnect()
    }
}

testConnect()

module.exports = {
async exec (method, query, param) {
    try {
    const res = await db[method](query, param)
    return res
    } catch (e) {
    return e
    }
}
}