const express = require('express')
// passport.js
const jwt = require('jsonwebtoken')
const bcrypt = require("bcrypt")
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
// postgres
const pg = require('../services/pgService')

const router = express.Router()

const signin = (req, res) => {
    console.log(`${req.user.name} has logged in`)
    const token = jwt.sign({ _id: req.user.user_id, email: req.user.email }, 'APPLE')
    return res.send({ token })
}

const verify = async (password, hash) => {
    const result = await bcrypt.compare(password, hash)
    return result
}

// passport local strategy
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    console.log(email)
    console.log(passport)
    const users = await pg.exec('any', 'SELECT user_id,name,password FROM users', [])
    console.log(users)
    const user = await pg.exec('oneOrNone', 'SELECT user_id,name,password FROM users WHERE email = $1', [email])
    if (!user) return done(null, false)
    const verified = await verify(password, user.password)
    if (!verified) { return done(null, false) }
    return done(null, user)
  }
))

router.post('/login', passport.authenticate('local', { session: false }), signin)

module.exports = router
