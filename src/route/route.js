const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const bookController= require('../controllers/bookController')
router.post('/register',userController.createUser)
router.post('/books',bookController.createBook)
router.get('/books',bookController.getBooks)
router.get('/books/:bookId',bookController.getBooksbyId)
router.put('/books/:bookId',bookController.updateBooks)
router.delete('/books/:bookId',bookController.deletebook)

module.exports = router