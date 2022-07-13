const reviewModel = require("../model/reviewModel")
const mongoose = require('mongoose')
const bookModel = require("../model/bookModel")

const isvalidRequest = function (requestBody) {
  return Object.keys(requestBody).length > 0
}
const isValid = function (value) {
  if (typeof value == "undefined" || value === null) return false;
  if (typeof value == "string" && value.trim().length === 0) return false;
  return true;
};

const isValidObjectId = function (id) {
  var ObjectId = mongoose.Types.ObjectId;
  return ObjectId.isValid(id)
}
//====================================create review===========================================
const createReview = async function (req, res) {
  const requestBody = req.body
  const Id = req.params.bookId
  //----------------------check request body------------------------------------------
  if (!isvalidRequest(requestBody)) return res.status(400).send({ status: false, message: "request reviewBody in empty" })
  //-------------------validate book id--------------------------------
  if (!isValidObjectId(Id)) {
    return res.status(400).send({ status: false, message: "Please provide valid bookId" })

  }

  //-----------------checkbookId present or not----------------
  let checkBook = await bookModel.findById({ _id: Id })
  // console.log(checkBook)
  if (!checkBook) return res.status(404).send({ status: false, message: "book is not found" })


  //-------------------check if book is deleted-----------------
  if (checkBook.isDeleted == true)
    return res.status(400).send({ status: false, message: "book is alraedy deleted" })
  requestBody.bookId = checkBook._id

  //-------------------destructing--------------------------------------
  let { review, rating } = requestBody
  //-----------------------------check review------------------------------------------
  if (!review) return res.status(400).send({ message: "review is required" })
  if (!isValid(review)) return res.status(400).send({ message: "invalid review" })

  //------------------check reviewBy-------------------------------------
  if (requestBody.reviewedBy === "") { requestBody.reviewedBy = "Guest" }

  //--------------------check rating----------------------------------
  if (!isValid(rating)) res.status(400).send({ message: "review is required" })
  if (!(/^[1-5](\.[1-5][1-5]?)?$/).test(rating)) return res.status(400).send({ message: "please give valid rating" })
  //----------------------assigen date--------------------------------------
  requestBody.reviewedAt = new Date()
  //----------------------------create review----------------------------------------
  let reviewData = await reviewModel.create(requestBody)

  //-------------------increment the review---------------------------------
  if (reviewData) await bookModel.findOneAndUpdate({ _id: Id }, { $inc: { reviews: +1 } })
  let { _id, title,userId, category, subcategory, excerpt, reviews, updatedAt, releasedAt, createdAt } = checkBook

  let data = { _id, title, userId,category, subcategory, excerpt, reviews, updatedAt, releasedAt, createdAt, reviewData }
  res.status(201).send({ status: true, message: "created sucessfully", data: data })


}


//==========================Update review=======================
const updateReview = async function (req, res) {
  try {
    let data = req.body
    if (!isvalidRequest(data)) { return res.status(400).send({ status: false, msg: "Please provide User data" }) }
    const bookId = req.params.bookId;
    const reviewId = req.params.reviewId

    if (!isValidObjectId(bookId)) return res.status(400).send({ status: false, msg: "Invalid Book id" })
    if (!isValidObjectId(reviewId)) return res.status(400).send({ status: false, msg: "Invalid Review id" })

    let checkBook = await bookModel.findOne({ _id: bookId, isDeleted: false })
    if (!checkBook) return res.status(404).send({ status: false, message: "Book not found" })

    let checkReview = await reviewModel.findOne({ _id: reviewId, isDeleted: false })
    if (!checkReview) return res.status(404).send({ status: false, message: "Review not found" })

    if (checkReview.bookId != bookId) return res.status(403).send({ message: "Review is not from this book" })
    // Ckecking for already deleted books
    if (checkBook.isDeleted == true)
      return res.status(400).send({ status: false, message: "Book is already deleted" })

    let { review, rating, reviewedBy } = data;
    //review
    if (!review) return res.status(400).send({ message: "Review is required" })
    if (!/^[a-zA-Z_ ]{2,500}$/.test(review)) { return res.status(400).send({ status: false, msg: "Review is invalid" }) }
    //rating
    if (rating) {
      if (!rating) return res.status(400).send({ message: "Rating is required" })
      if (!(/^[1-5](\.[1-5][1-5]?)?$/).test(rating)) return res.status(400).send({ message: "Please give valid rating" })
    }
    //reviewedBy
    if (reviewedBy) {
      if (!reviewedBy) return res.status(400).send({ message: "ReviewedBy is required" })
      if (!/^[a-zA-Z_ ]{2,500}$/.test(reviewedBy)) { return res.status(400).send({ status: false, msg: "Reviewed by is invalid" }) }
    }
    //Released At
    data.reviewedAt = new Date()
    const reviewData = await reviewModel.findOneAndUpdate(
      { _id: reviewId },
      { ...data }, { new: true }
    );
    let { _id, title,userId, category, subcategory, excerpt, reviews, updatedAt, releasedAt, createdAt } = checkBook

    let data1 = { _id, title, userId,category, subcategory, excerpt, reviews, updatedAt, releasedAt, createdAt, reviewData }
    return res.status(200).send({ status: true, data:data1 });
  }
  catch (err) {
    res.status(500).send({ status: false, message: err.message })
  }
}

//======================delete review==========================================
const deleteReview = async function (req, res) {
  try {
    // reviewId & bookId sent through path params
    const reviewId = req.params.reviewId;
    const bookId = req.params.bookId;

    //------------------check review-----------------------------
    if (!isValidObjectId(bookId)) return res.status(400).send({ status: false, message: "Book Id is not a valid ObjectId"});

    if (!isValidObjectId(reviewId)) return res.status(400).send({ status: false, message: "Review Id is not a valid ObjectId"});
    //---------------reviewid exsit in database------------------------------------------
    let review = await reviewModel.findOne({ _id: reviewId }); // database call (reviewModel)
    if (!review) {
      return res.status(404).send({ status: false, message: "Review not found"});
    }

    //----------------------------check review id is deleted --------------------------------
    if (review.isDeleted === true) {
      return res.status(400).send({ status: false, message: "Review is already deleted"});
    }

    //---------------------check book id--------------------------------------------
    if (!isValidObjectId(bookId)) {
      return res.status(400).send({ status: false, message: "BookId is not a valid ObjectId" });
    }

    //---------------------------------check bookid present or not-------------------------------
    let book = await bookModel.findOne({ _id: review.bookId }); // database call (bookModel)
    if (!book) {
      return res.status(404).send({ status: false, message: "Book not found" });
    }

    //--------------------------------check bookid isdeleted true------------------------------------------
    if (book.isDeleted === true) {
      return res.status(400).send({ status: false, message: "Book id already deleted" });
    }
    //-------------------update the reviewModel-----------------------------------------
    let newData = await reviewModel.findOneAndUpdate(
      { _id: reviewId },
      {
        $set: { isDeleted: true },
      }, { new: true }
    );

    //--------------------------decrement--------------------------------------
    if (newData) await bookModel.findByIdAndUpdate({ _id: bookId }, { $inc: { reviews: -1 } })

    //-----------------------send response-------------------------------------------------
    return res.status(200).send({ status: true, data: newData })
  } catch (err) {
    console.log(err)
    return res.status(500).send({ status: false, message: err.message })
  }

}
module.exports.createReview = createReview
module.exports.updateReview = updateReview
module.exports.deleteReview = deleteReview