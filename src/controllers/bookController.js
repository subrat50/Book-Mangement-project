const bookModel = require("../model/bookModel")
const userModel = require("../model/userModel")
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
const createBook = async function (req, res) {
    try {
        let requestBody = req.body
        if (!isvalidRequest(requestBody)) {
            return res.status(400).send({ status: false, msg: "Please provide User data" })
        }
        let { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = requestBody


        if (!title) return res.status(400).send({ status: false, msg: "title Is required" });
    if (!isValid(title)) return res.status(400).send({ status: false, msg: "title is Invalid" })

    let Title = await bookModel.findOne({ title })
    if (Title) return res.status(400).send({ status: false, msg: "Title has been already used please choose diffrent" })
        //excerpt
        if (!isValid(excerpt)) {
            return res.status(400).send({ status: false, msg: "Excerpt is required" })
        }
        if(!/^[a-zA-Z_ ]{2,15}$/.test(excerpt)){
            return res.status(400).send({ status: false, msg: "Excerpt is invalid" })
        }


        //userId
        if (!userId){ return res.status(400).send({ status: false, msg: "Please provide User Id" });}
        if (!isValidUserId(userId)) return res.status(400).send({ status: false, msg: "Please provide Valid User Id" });
         let userData = await userModel.findById({_id:userId});
        console.log(userData)
         if (!userData) return res.status(404).send({ status: false, msg: "User Id not found" });



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

        //category
        if(!category){
            return res.status(400).send({status:false,msg:"category is required"})
        }
        if(!isValid(category)){
            return res.status(400).send({status:false,msg:"Please provide valid category"})
        }
        //subcategory
        if(!subcategory){
            return res.status(400).send({status:false,msg:"subcategory is required"})
        }
        if(!isValid(subcategory)){
            return res.status(400).send({status:false,msg:"Please provide valid subcategory"})
        }
        //relesedAt
        if(!isValid(releasedAt)) return res.status(400).send({status:false,msg:"relesedAt is require"})
        if(!/^\d{4}-\d{2}-\d{2}$/.test(releasedAt)) return res.status(400).send({status:false,msg:"please provied realesedAt in correect format"})

        let savedData = await bookModel.create(requestBody)
        return res.status(201).send({status:true,data:savedData})
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}
//===============================get books==================================================












//====================================get books by id==========================================
const getBooksbyId=async function(req,res){
    let data=req.body
    let bookId=req.params.bookId
    if (!bookId.match(/^[0-9a-fA-F]{24}$/)) return res.status(400).send({ status: false, msg: "Incorrect book Id format" })

    if (!Object.keys(data).length) return res.status(400).send({ status: false, msg: "input can't be empty" });
    let checkBook= await bookModel.findById({bookId})   
    if(!checkBook) return res.status(400).send({status:false,message:"book is not found"})
    if(checkBook.isDeleted==true) return res.status(404).send({status:false,message:"book is alraedy deleted"})
}
module.exports.createBook = createBook