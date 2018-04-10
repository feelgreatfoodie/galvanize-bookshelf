'use strict';

const express = require('express');
const knex = require('../knex')
const humps = require('humps')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const boom = require('boom')
const router = express.Router();

// YOUR CODE HERE
router.get('/token', (req, res, next) => {
  const { token } = req.cookies
  if(!token) res.status(200).send(false)
  else res.status(200).send(true)
})

router.post('/token', (req, res, next) => {
  const { email, password } = req.body
  if( !email ) next(boom.badRequest('Email must not be blank'))
  if( !password ) next(boom.badRequest('Password must not be blank'))

  knex('users')
    .where('email', email)
    .select('id', 'email', 'first_name', 'last_name', 'hashed_password')
    .then(user => {

      if(!user[0]) next(boom.badRequest('Bad email or password'))

      bcrypt.compare(password, user[0].hashed_password, (err, result) => {
        if(err) throw err
        if(!result) next(boom.badRequest('Bad email or password'))
        else {
          const token = jwt.sign({'email': req.body.email }, process.env.JWT_KEY)
          res.setHeader('Set-Cookie', `token=${token}; Path=\/;.HttpOnly`)

          const userInfo = {
            'id': user[0].id,
            'email': user[0].email,
            'first_name': user[0].first_name,
            'last_name': user[0].last_name
          }
          res.status(200).send(humps.camelizeKeys(userInfo))
        }
      })
    })
    .catch(err => {
      next(err)
    })
  })

router.delete('/token', (req, res, next) => {
  res.setHeader('Set-Cookie', `token=; Path=\/; HttpOnly`)
  res.status(200).send(true)
})

module.exports = router;
