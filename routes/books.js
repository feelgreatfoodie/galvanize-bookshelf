'use strict';
const knex = require('../knex')
const humps = require('humps')
const express = require('express')
const boom = require('boom')
const router = express.Router();

// YOUR CODE HERE
router.get('/books', (req, res, next) => {
  knex('books')
    .orderBy('title', 'asc')
    .then(books => {
      res.status(200).send(humps.camelizeKeys(books))
    })
    .catch((err) => {
     next(err)
   })
})

router.get('/books/:id', (req, res, next) => {
  const { id } = req.params
  if(typeof(id) !== 'number') next(boom.notFound('Not Found'))

  knex('books')
    .where('id', id)
    .then(book => {
      if(!book[0]) next(boom.notFound('Not Found'))
      res.status(200).send(humps.camelizeKeys(book[0]))
    })
    .catch((err) => {
     next(err)
   })
})
// CREATE ONE record for this table
router.post('/books', (req, res, next) => {
  const { title, author, genre, description, coverUrl } = req.body
  const newBook = {
    'title': title,
    'author': author,
    'genre': genre,
    'description': description,
    'cover_url': coverUrl
  }

  if( !title ) next(boom.badRequest('Title must not be blank'))
  if( !author ) next(boom.badRequest('Author must not be blank'))
  if( !genre ) next(boom.badRequest('Genre must not be blank'))
  if( !description ) next(boom.badRequest('Description must not be blank'))
  if( !coverUrl ) next(boom.badRequest('Cover URL must not be blank'))

  knex('books')
    .insert(newBook)
    .returning('*')
    .then(book => {
      res.status(200).send(humps.camelizeKeys(book[0]))
    })
    .catch(err => {
     next(err)
   })
})
// UPDATE ONE record for this table
router.patch('/books/:id', (req, res, next) => {
  const { id } = req.params
  const { title, author, genre, description, coverUrl } = req.body
  const cover_url = coverUrl

  if(typeof(id) !== 'number') next(boom.notFound('Not Found'))


  knex('books')
  .where('id', id)
    .update( {title, author, genre, description, cover_url} )
    .returning('*')
    .then((book) => {
      if(!book[0]) next(boom.notFound('Not Found'))
      res.status(200).send(humps.camelizeKeys(book[0]))
    })
    .catch((err) => {
     next(err)
   })
 })
// DELETE ONE record for this table
router.delete('/books/:id', (req, res, next) => {
  const { id } = req.params
  if(typeof(id) !== 'number') next(boom.notFound('Not Found'))

  knex('books')
  .where('id', id)
  .del()
  .returning(['title', 'author', 'genre', 'description', 'cover_url'])
  .then((book) => {
    if(!book[0]) next(boom.notFound('Not Found'))
    res.status(200).send(humps.camelizeKeys(book[0]))
  })
})

module.exports = router;
