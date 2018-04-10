'use strict';

const express = require('express')
const knex = require('../knex')
const humps = require('humps')
const bcrypt = require('bcrypt')
const saltRounds = 10
const jwt = require('jsonwebtoken')
const boom = require('boom')
const router = express.Router()

// YOUR CODE HERE
router.post('/users', (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    password
  } = req.body

  if( !firstName ) next(boom.badRequest('First name must not be blank'))
  if( !lastName ) next(boom.badRequest('Last name must not be blank'))
  if( !email ) next(boom.badRequest('Email must not be blank'))
  if( !password || password.length < 8 ) next(boom.badRequest('Password must be at least 8 characters long'))

  const checkForExistingEmail = (email) => {
    knex('users')
      .select('email')
      .where('email', email)
      .then(user => {
        if(user[0]) next(boom.badRequest('Email already exists'))
      })
  }

  checkForExistingEmail(email)

  bcrypt.hash(password, saltRounds, (err, hashed_password) => {
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
        const token = jwt.sign({'email': req.body.email }, process.env.JWT_KEY)
        res.setHeader('Set-Cookie', `token=${token}; Path=\/;.HttpOnly`)
        res.status(200).send(humps.camelizeKeys(user[0]))
      })
      .catch(err => {
        next(err)
      })
  })

  function getEmailFromDB(email){
    knex('users')
      .select('email')
      .where('email', email)
      .then(e => {
        return e[0].email
      })
      .catch(err => {
        next(err)
      })
  }

})
module.exports = router;
