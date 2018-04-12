'use strict';

const express = require('express');
const knex = require('../knex')
const humps = require('humps')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const boom = require('boom')
const router = express.Router();
// YOUR CODE HERE

const getUserId = (req, res, next) => {
  const { token } = req.cookies
  if (token) {
    const decoded = jwt.decode(token)
    knex('users')
      .where('email', decoded.email)
      .select('id')
      .then((info) => {
        req.userId = info[0].id
        next()
      })
      .catch(err => next(err))
  } else {
    next(boom.unauthorized())
  }
}

const findBook = (req, res, next) =>{
  const { bookId } = req.body
  if(typeof(bookId) !== 'number') next(boom.badRequest('Book ID must be an integer'))

  knex('books')
    .where('id', bookId)
    .then((book) =>{
      if(!book[0]) {
        if (req.method === 'DELETE') next(boom.notFound('Favorite not found'))
        else next(boom.notFound('Book not found'))
      }
      next()
    })
}

router.get('/favorites', getUserId, (req, res, next) => {
  console.log('hola, me llamo: ', req.userId)
  knex('favorites')
    .where('user_id', req.userId)
    .select('favorites.id', 'book_id', 'user_id', 'favorites.created_at', 'favorites.updated_at', 'books.id', 'title', 'author', 'genre', 'description', 'cover_url')
    .join('books', 'book_id', 'books.id')
    .returning ('*')
    .then(books => {
      res.status(200).send(humps.camelizeKeys(books))
    })
    .catch((err) => {
     next(err)
   })
})

router.get('/favorites/check', getUserId, (req, res, next) => {
  const { bookId } = req.query
  knex('favorites')
    .where('book_id', bookId)
    .select('*')
    .then(book => {
      res.status(200).send(book.length > 0)
    })
    .catch((err) => {
     next(boom.badRequest('Book ID must be an integer'))
    })
})

router.post('/favorites', getUserId, findBook, (req, res, next) => {
  const { bookId } = req.body
  const newFav = { 'user_id': req.userId, 'book_id': bookId }


  knex('favorites')
    .insert(newFav)
    .returning(['id', 'book_id', 'user_id'])
    .then(newFav => {
      //if(!newFav) next(boom.notFound('Book not found'))
      res.send(humps.camelizeKeys(newFav[0]))
    })
    .catch(err => {
      next(err)
    })
})

router.delete('/favorites', getUserId, findBook, (req, res, next) => {
  console.log(req.method)
  const { bookId } = req.body
  knex('favorites')
    .where('book_id', bookId)
    .del()
    .returning(['book_id', 'user_id'])
    .then(info => {
      res.status(200).send(humps.camelizeKeys(info[0]))
    })
  .catch(err => {
    next(err)
  })
})

module.exports = router;
