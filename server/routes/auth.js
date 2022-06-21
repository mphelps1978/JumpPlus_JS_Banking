// signup, login and logout endpoints

const express = require('express')
const bcrypt = require('bcryptjs')
const { pool } = require('../db/connect')

const {
  validateUser,
  isInvalidField,
  generateAuthToken
} = require('../utils/common')

const authMiddlleware = requir('../middlware/auth')

const Router = express.Router()

Router.post('/signup', async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body
    const validFieldsToUpdate = [
      'first_name',
      'last_name',
      'email',
      'password'
    ]

    const recievedFields = Object.keys(req.body)

    const isInvalidFieldProvided = isInvalidField(
      recievedFields,
      validFieldsToUpdate
    )

    if (isInvalidFieldProvided) {
      return res.status(400).send({
        signup_error: 'Invalid field'
      })
    }

    const result = await pool.query(
      'select count(*) as count from user_account where email = $1',
      [email]
    )
    const count = result.rows[0].count
    if (count > 0) {
      return res.status(400).send({
        signup_error: 'Email already in use'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 8)
    await pool.query(
      'insert into user_account(first_name, last_name, email, password) values($1,$2,$3,$4',
      [first_name, last_name, email, hashedPassword]
    )
    res.status(201).send()
  } catch (error) {
    res.status(400).send({
      signup_error: 'Signup Error, please try again later.'
    })
  }
})

Router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await validateUser(email, password)

    if (!user) {
      res.status(400).send({
        login_error: 'Email/Password does not match'
      })
    }
    const token = await generateAuthToken(user)
    const result = await pool.query(
      'insert into tokens(access_token, userid) values ($1,$2) returning *'
      [token, user.userid]
    )
    if (!result.rows[0]) {
      return res.status(400).send({
        login_error: 'Error while loging in.. try again later'
      })
    }

    user.token = result.rows[0].access_token
    res.send(user)
  } catch (error) {
    res.status(400).send({
      login_error: 'Email/Password does not match'
    })
  }
})

Router.post('/logout', authMiddlleware, async (req, res) => {
  try {
    const { userid, access_token } = req.user
    await pool.query(
      'delete from tokens where userid=$1 and access_token=$2',
      [userid, access_token]
    )
    res.send()
  } catch (error) {
    res.status(400).send({
      logout_error: 'Error logging out.. Please try again later'
    })
  }
})

module.exports = Router