const bookModel = require("../model/bookModel")
const userModel = require("../model/userModel")
const reviewModel=require("../model/reviewModel")
const mongoose = require('mongoose')

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    // if (typeof value === "string")  
        return true;
};
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
        if (!isvalidRequest(requestBody)) {
            return res.status(400).send({ status: false, msg: "Please provide User data" })
        }
        //-----------------destructing----------------------------------------
        let { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = requestBody

     //--------------------check the title-------------------------
        if (!title) return res.status(400).send({ status: false, msg: "title Is required" });
    if (!isValid(title)) return res.status(400).send({ status: false, msg: "title is Invalid" })

    let Title = await bookModel.findOne({ title })
    if (Title) return res.status(400).send({ status: false, msg: "Title has been already used please choose diffrent" })
    //-------------------------check the excerpt-------------------------------------------------------
        if (!isValid(excerpt)) {
            return res.status(400).send({ status: false, msg: "Excerpt is required" })
        }
        if(!/^[a-zA-Z_ ]{2,15}$/.test(excerpt)){
            return res.status(400).send({ status: false, msg: "Excerpt is invalid" })
        }
     //----------------------------check the userid---------------------------
        //userId
        if (!userId){ return res.status(400).send({ status: false, msg: "Please provide User Id" });}
        if (!isValidUserId(userId)) return res.status(400).send({ status: false, msg: "Please provide Valid User Id" });
         let userData = await userModel.findById({_id:userId});
        console.log(userData)
         if (!userData) return res.status(404).send({ status: false, msg: "User Id not found" });

         //------------------------check the ISBN-------------------------
        //ISBN
        if(!isValid(ISBN)){
            return res.status(400).send({status:false,msg:"ISBN Number is required"})
        }
        if(!/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/.test(ISBN)){
            return res.status(400).send({status:false,msg:"Provide valid ISBN"})
        }
        let isbnData= await bookModel.findOne({ISBN});
        if(isbnData){
            return res.status(404).send({status:false,msg:"ISBN already exists"})
        }
//---------------------------check the category
        //category
        if(!category){
            return res.status(400).send({status:false,msg:"category is required"})
        }
        if(!isValid(category)){
            return res.status(400).send({status:false,msg:"Please provide valid category"})
        }
        //-----------------check the subcategory-----------------------
        if(!subcategory){
            return res.status(400).send({status:false,msg:"subcategory is required"})
        }
        if(!isValid(subcategory)){
            return res.status(400).send({status:false,msg:"Please provide valid subcategory"})
        }
        //--------------------------check the relesedAt---------------------------------------
        if(!isValid(releasedAt)) return res.status(400).send({status:false,msg:"relesedAt is require"})
        if(!/^\d{4}-\d{2}-\d{2}$/.test(releasedAt)) return res.status(400).send({status:false,msg:"please provied realesedAt in correect format"})
//----------------------------send response----------------------------------------------
        let savedData = await bookModel.create(requestBody)
        return res.status(201).send({status:true,data:savedData})
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}
//===============================get books==================================================
const getBooks = async function (req,res){
    try {
        let id = req.query.userId
        let Category = req.query.category
        let subcategory = req.query.subcategory
        if (id === undefined && Category === undefined && subcategory === undefined) {
            let allBooks = await bookModel.find({ isDeleted: false}).select({_id:1,title:1, excerpt:1, userId:1, category:1, releasedAt:1, reviews:1})
            allBooks.sort((a,b)=>{
                let fa=a.title.toLocaleLowerCase(),
                fb=b.title.toLocaleLowerCase();
                if(fa<fb){
                    return -1
                }if(fa>fb){
                    return 1
                }
                return 0
            })
    
            if (allBooks.length == 0) { return res.status(404).send({ status: false, message: " no books found" }) }
            else { res.status(200).send({ status: true, data: allBooks }) }
        }
        else {
            let booksWithFilter = await bookModel.find({ isDeleted: false, $or: [{userId:id }, { category: Category }, { subcategory: subcategory }] })
            if (booksWithFilter.length == 0) {
                res.status(404).send({ status: false, message: "no books found" })
            }
            else {
                res.status(200).send({ status: true, data: booksWithFilter })
            }
        }
    }
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ message: "Error", error: err.message })
    }
    }

//====================================get books by id==========================================
const getBooksbyId=async function(req,res){

    let bookId=req.params.bookId
    //------validation start--------------------------------
    if (!bookId.match(/^[0-9a-fA-F]{24}$/)) return res.status(400).send({ status: false, msg: "Incorrect book Id format" })
  //-----------------checkbookId present or not----------------
    let checkBook= await bookModel.findById({_id:bookId})
    if(!checkBook) return res.status(400).send({status:false,message:"book is not found"})
    //-------------------check if book is deleted-----------------
    if(checkBook.isDeleted==true) return res.status(404).send({status:false,message:"book is alraedy deleted"})
    //----------------check in reviews)
    let reviewsData=await reviewModel.find({bookId:bookId,isDeleted:false})
    //----------------destructing----------------
     let {_id,title,category,subcategory,excerpt,reviews,updatedAt,releasedAt,createdAt}=checkBook
    //------------[send response]-------------------------
    let data={_id,title,category,subcategory,excerpt,reviews,updatedAt,releasedAt,createdAt,reviewsData}
    //  let{ checkBook.reviewsData}=data
    
    //sending successful response with new object
    return res.status(200).send({
      status: true,
      message: "Books list",
      data: data,
    });
}

//========================update book=========================================

const updateBooks = async function (req, res) {
    try {
        let data = req.body
        const bookId = req.params.bookId;
        let checkBook = await bookModel.findById({ _id: bookId })
        if (!checkBook) return res.status(404).send({ status: false, message: "Book not found" })

        let { title, excerpt, releasedAt, ISBN } = data;
        if (!isValid(title)) return res.status(400).send({ status: false, msg: "title is Invalid" })
        let checkTitle = await bookModel.findOne({ title: title })
        if (checkTitle) return res.status(400).send({ status: false, message: "This title is already exists" })
        //excerpt
        if (!isValid(excerpt)) return res.status(400).send({ status: false, msg: "excerpt is Invalid" })
        let checkexcerpt = await bookModel.findOne({ excerpt: excerpt })
        if (checkexcerpt) return res.status(400).send({ status: false, message: "This excerpt is already exists" })
        //ISBN
        if (!isValid(ISBN)) return res.status(400).send({ status: false, msg: "ISBN is Invalid" })
        let checkISBN = await bookModel.findOne({ ISBN: ISBN })
        if (checkISBN) return res.status(400).send({ status: false, message: "This ISBN is already exists" })

        const book = await bookModel.findOneAndUpdate(
            { _id: bookId },
            { $set: { title, excerpt, releasedAt, ISBN, isDeleted: false }, }, { new: true }
        );

        return res.status(200).send({ status: true, data: book });
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ status: false, msg: err.message })
    }
}

// ===========================deletebook===================================================
let deletebook = async function (req, res) {
    try {
        let id = req.params.bookId
        
        //finding id in database  
        let idvalidation = await bookModel.findById(id)
        
        if (idvalidation.isDeleted == true) 
        return res.status(400).send({status:false, message:"Book is already deleted"})
            let validation = await bookModel.findOneAndUpdate({ _id: id }, { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true })
        
        res.status(200).send({status:true,data:validation})
       
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
}
module.exports.createBook = createBook
module.exports.deletebook=deletebook
module.exports.getBooksbyId=getBooksbyId
module.exports.updateBooks=updateBooks
module.exports.getBooks=getBooks
