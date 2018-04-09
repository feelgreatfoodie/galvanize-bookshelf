'use strict';

const express = require('express')
const knex = require('../knex')
const humps = require('humps')
const bcrypt = require('bcrypt')
const saltRounds = 10
// eslint-disable-next-line new-cap
const router = express.Router()

// YOUR CODE HERE
router.post('/users', (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    password
  } = req.body

  if (!firstName) return next({
    status: 400,
    message: 'First name must not be blank'
  })
  if (!lastName) return next({
    status: 400,
    message: 'Last name must not be blank'
  })
  if (!email) return next({
    status: 400,
    message: 'Email must not be blank'
  })
  if (!password) return next({
    status: 400,
    message: 'Password must not be blank'
  })

  bcrypt.hash(password, saltRounds, function(err, hashed_password) {
    // Store hash in your password DB.

    const newUser = {
      'first_name': firstName,
      'last_name': lastName,
      'email': email,
      'hashed_password': hashed_password
    }

    knex('users')
      .insert(newUser)
      .returning(['id', 'first_name', 'last_name', 'email'])
      .then(user => {
        res.status(200).send(humps.camelizeKeys(user[0]))
      })
      .catch(err => {
        next(err)
      })
  })
})
module.exports = router;
