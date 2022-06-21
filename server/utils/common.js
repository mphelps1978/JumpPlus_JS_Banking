/* Common Utilities to be used within
   the banking application
*/

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { pool } = require('../db/connect')


// verifying the field input is valid
const isInvalidField = (recievedFields, validFieldsToUpdate) => {
  return recievedFields.some(
    (field) => validFieldsToUpdate.indexOf(field) === -1
  )
}


// user login validation 
const validateUser = async (email, password) => {
  // SQL Statement to grab the user based on their email
  const result = await pool.query(
    `select userId, email, password from user_account where email = $1`,
    [email]
  )
  // check that the user exists, AND there is a password present
  const user = result.rows[0]
  if (user) {
    const isMatch = await bcrypt.compare(password, user.password)
    
    if (isMatch) {
      delete user.password
      return user
    } else {
      throw new Error()
    }
    
  } else {
    throw new Error()
  }
}


// we need to give the user an auth token assuming they login successfully
// we'll just sign their id, email, and a secret key together for this
const generateAuthToken = async (user) => {
  const { userId, email } = user
  const secret = process.env.secret
  const token = await jwt.sign({ userId, email }, secret)
  return token
}

module.exports = {
  isInvalidField,
  validateUser,
  generateAuthToken
}