const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const bookController= require('../controllers/bookController')
const reviewController = require('../controllers/reviewContoller')
// const storageController=require('../controllers/storageController')
const middleware = require('../middleware/auth')

//-------------------User----------------------------
router.post('/register',userController.createUser)
router.post('/login',userController.login)

//---------------------Books-------------------------
router.post('/books',middleware.authenticate,bookController.createBook)
router.get('/books',middleware.authenticate,bookController.getBooks)
router.get('/books/:bookId',middleware.authenticate,bookController.getBooksbyId)
router.put('/books/:bookId',middleware.authenticate,bookController.updateBooks)
router.delete('/books/:bookId',middleware.authenticate,bookController.deletebook)

//--------------------Review-------------------------
router.post('/books/:bookId/review',reviewController.createReview)
router.put('/books/:bookId/review/:reviewId',reviewController.updateReview)
router.delete('/books/:bookId/review/:reviewId',reviewController.deleteReview)
//  router.post("/write-file-aws",storageController.uploadFile)

//--------------------------All-----------------------------
// router.all("/**", function (req, res) {
//     res.status(400).send({status: false,msg: "The api you request is not available"})
// })

 module.exports = router