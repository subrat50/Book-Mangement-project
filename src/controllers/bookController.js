const bookModel = require("../model/bookModel")
const userModel = require("../model/userModel")
const reviewModel = require("../model/reviewModel")
const mongoose = require('mongoose')

const isValid = function (value) {
  if (!value || value === "undefined" || value === null) return false;
  if (!value === "string" && value.trim().length === 0) return false;
  return true;
};
const isValidDate = function (date) {
  const dateRegex = /((\d{4}[\/-])(\d{2}[\/-])(\d{2}))/
  return dateRegex.test(date)
}
const isValidISBN = function (ISBN) {
  const dateRegex = /^\+?([1-9]{3})\)?[-. ]?([0-9]{10})$/
  return dateRegex.test(ISBN)
}
const isValidName = function (value) {
  const dateName = /^[a-zA-Z_ ]{2,100}$/
  return dateName.test(value)
}
const isvalidRequest = function (requestBody) {
  return Object.keys(requestBody).length > 0
}
const isValidUserId = function (ObjectId) {
  return mongoose.Types.ObjectId.isValid(ObjectId)
}

//1.
//==========================create Book==================================
const createBook = async function (req, res) {
  try {
    let requestBody = req.body
    //-------------------validation start--------------
    if (!isvalidRequest(requestBody)) { return res.status(400).send({ status: false, message: "Please provide User data" }) }
    let { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = requestBody

    //--------------------check the title-------------------------

    // if (!title) return res.status(400).send({ status: false, message: "Title is required" });
    if (!isValid(title)) return res.status(400).send({ status: false, message: "Title is rquired" })
    if (!isValidName(title)) { return res.status(400).send({ status: false, msg: "Title is invalid" }) }
    let checkTitle = await bookModel.findOne({ title })
    if (checkTitle) return res.status(400).send({ status: false, message: "Title has been already used please choose different" })

    //-------------------------check the excerpt-------------------------------------------------------
    if (!isValid(excerpt)) { return res.status(400).send({ status: false, message: "Excerpt is required" }) }
    if (!isValidName(excerpt)) { return res.status(400).send({ status: false, message: "Excerpt is invalid" }) }

    //----------------------------check the userid---------------------------
    if (!userId) { return res.status(400).send({ status: false, message: "Please provide User Id" }); }
    if (!isValidUserId(userId)) return res.status(400).send({ status: false, message: "Please provide Valid User Id" });
    let checkUerId = await userModel.findById({ _id: userId });
    if (!checkUerId) return res.status(404).send({ status: false, message: "User Id not found" });
    //-------------------------Authorisation------------------
    let token = req.userId
    if (token != requestBody.userId) res.status(401).send({ status: false, message: "Unauthorised! User logged is not allowed" });

    //------------------------check the ISBN-------------------------
    if (!isValid(ISBN)) { return res.status(400).send({ status: false, message: "ISBN Number is required" }) }
    
    if (!isValidISBN(ISBN)) { return res.status(400).send({ status: false, message: "Please provide a valid ISBN!" }) }

    let isbnData = await bookModel.findOne({ ISBN });
    if (isbnData) { return res.status(400).send({ status: false, message: "ISBN already exists" }) }

    //---------------------------check the category-------------------------
    if (!category) { return res.status(400).send({ status: false, message: "category is required" }) }
    if (!isValid(category)) { return res.status(400).send({ status: false, message: "Please provide valid category" }) }

    //-----------------check the subcategory-----------------------
    if (!subcategory) { return res.status(400).send({ status: false, message: "subcategory is required" }) }
    if (!isValid(subcategory)) { return res.status(400).send({ status: false, message: "Please provide valid subcategory" }) }

    //--------------------------check the relesedAt---------------------------------------
    if (!isValid(releasedAt)) return res.status(400).send({ status: false, message: "relesedAt is require" })
    if (!isValidDate(releasedAt)) return res.status(400).send({ status: false, message: "please provied realesedAt in correect format" })

    //----------------------------send response----------------------------------------------
    let savedData = await bookModel.create(requestBody)
    return res.status(201).send({ status: true, data: savedData })
  }
  catch (err) {
    res.status(500).send({ status: false, message: err.message })
  }
}
//===============================get books==================================================
const getBooks = async function (req, res) {

  try {

      const queryParams = req.query
      //---------------------validate userId--------------------------------------------
      if (!isValidUserId(queryParams.userId )) {
          return res.status(400).send({ status: false, message: "Incorrect userId" })
      }      

//------------------find the book isDeleted false & ascending order by title------------------------------
      const books = await bookModel.find({ ...queryParams, isDeleted: false }).sort({ title: 1 }).select('_id title excerpt userId category releasedAt reviews')
      books.sort((a, b) => a.title.localeCompare(b.title))  // enables case - insenstive and then sort the array


//-------------------------check book length--------------------------------------------
      if (books && books.length == 0) {
        return res.status(404).send({ status: false, message: "Books not found" })
      }

      //------------------------send response----------------------------------------
      return res.status(200).send({ status: true, message: "Books list", data: books })

  }
  catch (error) {
      return res.status(500).send({ status: false, message: error.message })

  }
}



//====================================get books by id==========================================
const getBooksbyId = async function (req, res) {

  let bookId = req.params.bookId
  //------validation start--------------------------------
  if (!isValidUserId(bookId)) return res.status(400).send({ status: false, message: "Incorrect book Id format" })


  //-----------------checkbookId present or not----------------
  let checkBook = await bookModel.findById({ _id: bookId })
  if (!checkBook) return res.status(404).send({ status: false, message: "Book is not found" })


  //-------------------check if book is deleted-----------------
  if (checkBook.isDeleted == true) return res.status(400).send({ status: false, message: "Book is alraedy deleted" })


  //----------------check in reviews--------------
  let reviewsData = await reviewModel.find({ bookId: bookId, isDeleted: false })


  //----------------destructing----------------
  let { _id, title, userId, category, subcategory, excerpt, reviews, updatedAt, releasedAt, createdAt } = checkBook


  //------------[send response]--------------------------------------------------------------
  let data = { _id, title, userId, category, subcategory, excerpt, reviews, updatedAt, releasedAt, createdAt, reviewsData }


  //-------------------sending successful response with new object-------------------------------------------
  return res.status(200).send({
    status: true, message: "Books list", data: data,
  });
}

//========================update book=========================================

const updateBooks = async function (req, res) {
  try {
    let data = req.body
    const bookId = req.params.bookId;
    //-----------------------validate bookId-----------------------------------------
    if (!isvalidRequest(data)) return res.status(400).send({ status: false, messge: "please provied requestbody to update" })
    if (!isValidUserId(bookId)) return res.status(400).send({ status: false, message: "Please provide valid book id" })

    //-----------------------------check book id & validation start----------------------------
    let checkBook = await bookModel.findById({ _id: bookId })

    if (!checkBook) return res.status(404).send({ status: false, message: "Book not found" })
    if (checkBook.isDeleted == true)
      return res.status(400).send({ status: false, message: "Book is already deleted" })


      //---------------------authorization---------------------------------------------
    let token = req.userId
    if (token != checkBook.userId.toString()) return res.status(400).send({ status: false, message: "User is not authorised to this update book" })


//-----------------------destruing--------------------------------------------------------------
    let { title, excerpt, releasedAt, ISBN } = data;


    //-------------------------check title-----------------------------
    // if title is present in req checking through hasOwnProperty
    if (data.hasOwnProperty("title")) {

      //if title is empty
      if (!isValid(title)) { return res.status(400).send({ status: false, message: "title is required!" }); }
      if (!isValidName(title)) { return res.status(400).send({ status: false, message: "title is not valid !" }); }


      //title duplication checK
      const isPresentTitle = await bookModel.findOne({ title: title });
      if (isPresentTitle) { return res.status(400).send({ status: false, message: "it is already exists.Please try a new title" }); }
    }

    // if excerpt is present in req checking through hasOwnProperty
    if (data.hasOwnProperty("excerpt")) {

      //if excerpt is empty
      if (!isValid(excerpt)) { return res.status(400).send({ status: false, message: "excerpt is required!" }); }
      if (!isValidName(excerpt)) { return res.status(400).send({ status: false, message: "excerpt is not valid!" }); }
    }

    // if releasedAt is present in req checking through hasOwnProperty
    if (data.hasOwnProperty("releasedAt")) {

      //if releasedAt is empty or invalid format
      if (!isValidDate(releasedAt)) { return res.status(400).send({ status: false, message: "releasedAt is not valid.Please use (YYYY-MM-DD) format" }); }
    }
//------------------------check ISBN----------------------------------------------------
    // if ISBN is present in req checking through hasOwnProperty
    if (data.hasOwnProperty("ISBN")) {
      if (!isValid(ISBN)) { return res.status(400).send({ status: false, message: "ISBN is required!" }); }
      // if ISBN is empty or invalid format
      if (!isValidISBN(ISBN)) {
        return res.status(400).send({ status: false, message: "ISBN is not valid.Please use 10 or 13 digits ISBN format" });
      }
      // ISBN duplication check
      const checkISBN = await bookModel.findOne({ ISBN: ISBN });
      if (checkISBN) {
        return res.status(400).send({ status: false, message: "ISBN is already registered" });
      }
    }

    //--------------------------updating book details--------------------------------------------------
    const updatedBook = await bookModel.findOneAndUpdate(
      { _id: bookId }, { ...data }, { new: true }
    );
    return res.status(200).send({ status: true, data: updatedBook });

  }
  catch (err) {
    console.log(err)
    res.status(500).send({ status: false, message: err.message })
  }
}

// ===========================deletebook===================================================
let deletebook = async function (req, res) {
  try {
    let bookId = req.params.bookId
    if (!isValidUserId(bookId)) return res.status(400).send({ status: false, message: "Please provide valid book id" })
    //finding id in database  
    let idvalidation = await bookModel.findById(bookId)
    if (!idvalidation) return res.send(404).send({ status: false, messge: "Book id is not found" })

    let token = req.userId
    if (token != idvalidation.userId.toString()) return res.status(401).send({ status: false, msg: "Unauthorised! User logged is not allowed" });

    if (idvalidation.isDeleted == true) return res.status(400).send({ status: false, message: "Book is already deleted" })
    let validation = await bookModel.findOneAndUpdate({ _id: bookId }, { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true })

    res.status(200).send({ status: true, data: validation })

  }
  catch (err) {
    res.status(500).send({ status: false, msg: err.message });
  }
}
module.exports.createBook = createBook
module.exports.getBooksbyId = getBooksbyId
module.exports.updateBooks = updateBooks
module.exports.getBooks = getBooks
module.exports.deletebook = deletebook
