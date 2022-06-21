// middleware function to ensure user is logged in 
// and has a valid AuthToken

const jwt = require('jsonwebtoken')
const { pool } = require('../db/connect')

const authMiddleware = async function (req, res, next) {
  try {
    const token = req.header('Authorization').split(' ')[1]
    const decoded = jwt.verify(token, process.env.secret)
    const result = pool.query(
      'select b.userid, b.first_name, b.email, t.access_token from user_account b inner join tokens t on b.userid=t.userud where t.access_token=$1 and t.userid=$2',
      [token, decoded.userid]
    )
    
    const user = result.rows[0]
    if (user) {
      req.user = user
      req.token = token
      next()
    } else {
      throw new Error('Error while authenticating')
    }
  } catch (error) {
    res.status(400).send({
      auth_error: 'Authentication Failed.'
    })
  }
}

module.exports = authMiddleware