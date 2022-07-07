const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const bookController= require('../controllers/bookController')
router.post('/register',userController.createUser)
router.post('/books',bookController.createBook)

module.exports = router