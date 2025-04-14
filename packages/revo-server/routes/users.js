const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()
const pg = require('../services/pgService')
const checkRole = require('../middlewares/is-role.middleware')
const { Role } = require('../constants');

// Get all users
router.get('/', checkRole([Role.SUPER_ADMIN]), async (req, res) => {
  try {
    const users = await pg.exec(
      'any',
      'SELECT user_id, name, email, setting, created_on, last_login, role FROM users ORDER BY user_id',
      []
    )
    return res.send({ users })
  } catch (err) {
    console.error('Error fetching users:', err)
    return res.status(500).send({ error: 'Failed to fetch users' })
  }
})

// Get a specific user
router.get('/:id', checkRole([Role.SUPER_ADMIN]), async (req, res) => {
  try {
    const user = await pg.exec(
      'oneOrNone',
      'SELECT user_id, name, email, setting, created_on, last_login, role FROM users WHERE user_id = $1',
      [req.params.id]
    )
    if (!user) {
      return res.status(404).send({ error: 'User not found' })
    }
    return res.send({ user })
  } catch (err) {
    console.error('Error fetching user:', err)
    return res.status(500).send({ error: 'Failed to fetch user' })
  }
})

// Create a new user
router.post('/', checkRole([Role.SUPER_ADMIN]), async (req, res) => {
  const { name, email, password, role } = req.body

  if (!name || !email || !password || !role) {
    return res.status(400).send({ error: 'Missing required fields' })
  }

  // Validate role
  const validRoles = [Role.PROJECT_ADMIN, Role.PROJECT_DESIGNER, Role.VISITOR]
  if (!validRoles.includes(role)) {
    return res.status(400).send({ error: 'Invalid role' })
  }

  try {
    // Check if email already exists
    const existingUser = await pg.exec(
      'oneOrNone',
      'SELECT user_id FROM users WHERE email = $1',
      [email]
    )
    
    if (existingUser) {
      return res.status(400).send({ error: 'Email already in use' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Create settings object with role
    const setting = {
      admin: role === Role.PROJECT_ADMIN // Only PROJECT_ADMIN gets admin privileges
    }

    // Insert new user
    const newUser = await pg.exec(
      'one',
      'INSERT INTO users(name, email, password, setting, role, created_on) VALUES($1, $2, $3, $4, $5, current_timestamp) RETURNING user_id, name, email, setting, role, created_on',
      [name, email, hashedPassword, setting, role]
    )

    return res.status(201).send({ user: newUser })
  } catch (err) {
    console.error('Error creating user:', err)
    return res.status(500).send({ error: 'Failed to create user' })
  }
})

// Update a user
router.put('/:id', checkRole([Role.SUPER_ADMIN]), async (req, res) => {
  const { name, email, password, role } = req.body
  const userId = req.params.id

  if (!userId) {
    return res.status(400).send({ error: 'User ID is required' })
  }

  // Validate role if provided
  if (role) {
    const validRoles = [Role.PROJECT_ADMIN, Role.PROJECT_DESIGNER, Role.VISITOR]
    if (!validRoles.includes(role)) {
      return res.status(400).send({ error: 'Invalid role' })
    }
  }

  try {
    // Check if user exists
    const existingUser = await pg.exec(
      'oneOrNone',
      'SELECT user_id, setting FROM users WHERE user_id = $1',
      [userId]
    )
    
    if (!existingUser) {
      return res.status(404).send({ error: 'User not found' })
    }

    // Prepare update query parts
    let updateQuery = 'UPDATE users SET '
    const queryParams = []
    const updates = []

    if (name) {
      queryParams.push(name)
      updates.push(`name = $${queryParams.length}`)
    }

    if (email) {
      // Check if email is already in use by another user
      const emailUser = await pg.exec(
        'oneOrNone',
        'SELECT user_id FROM users WHERE email = $1 AND user_id != $2',
        [email, userId]
      )
      
      if (emailUser) {
        return res.status(400).send({ error: 'Email already in use by another user' })
      }

      queryParams.push(email)
      updates.push(`email = $${queryParams.length}`)
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10)
      queryParams.push(hashedPassword)
      updates.push(`password = $${queryParams.length}`)
    }

    if (role) {
      // Update setting with new role
      queryParams.push(role)
      updates.push(`role = $${queryParams.length}`)
    }

    // Add last updated timestamp
    updates.push('last_login = current_timestamp')

    // If no updates, return the existing user
    if (updates.length === 0) {
      return res.status(200).send({ 
        user: await pg.exec(
          'oneOrNone',
          'SELECT user_id, name, email, setting, created_on, last_login, role FROM users WHERE user_id = $1',
          [userId]
        )
      })
    }

    // Complete the query
    updateQuery += updates.join(', ')
    updateQuery += ' WHERE user_id = $' + (queryParams.length + 1)
    queryParams.push(userId)
    updateQuery += ' RETURNING user_id, name, email, setting, created_on, last_login, role'

    // Execute update
    const updatedUser = await pg.exec('one', updateQuery, queryParams)
    return res.send({ user: updatedUser })
  } catch (err) {
    console.error('Error updating user:', err)
    return res.status(500).send({ error: 'Failed to update user' })
  }
})

// Delete a user
router.delete('/:id', checkRole([Role.SUPER_ADMIN]), async (req, res) => {
  const userId = req.params.id

  // Prevent deleting the main admin account
  if (userId === '1') {
    return res.status(403).send({ error: 'Cannot delete the main administrator account' })
  }

  try {
    // Check if user exists first
    const user = await pg.exec(
      'oneOrNone',
      'SELECT user_id FROM users WHERE user_id = $1',
      [userId]
    )
    
    if (!user) {
      return res.status(404).send({ error: 'User not found' })
    }

    // Delete the user
    await pg.exec('none', 'DELETE FROM users WHERE user_id = $1', [userId])
    return res.send({ success: true, message: 'User deleted successfully' })
  } catch (err) {
    console.error('Error deleting user:', err)
    return res.status(500).send({ error: 'Failed to delete user' })
  }
})

module.exports = {router, Role}
