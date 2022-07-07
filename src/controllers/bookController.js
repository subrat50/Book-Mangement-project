const bookModel = require("../model/bookModel.js")
const userModel = require("../model/userModel")
const mongoose = require('mongoose')
const ObjectId =mongoose.Types.ObjectId
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
        let { title, excerpt, userId, ISBN, category, subcategory, reviews } = requestBody
        
        //title
        if (!isValid(title)) {
            return res.status(400).send({ status: false, msg: "Title is required" })
        }
        // if(!/^[a-zA-Z_ ]{2,15}$/.test(title)){
            // return res.status(400).send({ status: false, msg: "Title is invalid" })
        // }
        let checkTitle= await bookModel.findOne({title})
        if(checkTitle){
            return res.status(400).send({status:false,msg:"Title already exists"})
        }
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
         if (!userData) return res.status(400).send({ status: false, msg: "User Id not found" });

        //ISBN
        if(!isValid(ISBN)){
            return res.status(400).send({status:false,msg:"ISBN Number is required"})
        }
        if(!/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/.test(ISBN)){
            return res.status(400).send({status:false,msg:"Provide valid ISBN"})
        }
        let isbnData=await bookModel.findOne({ISBN});
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
            return res.status(400).send({status:false,msg:"category is required"})
        }
        if(!isValid(subcategory)){
            return res.status(400).send({status:false,msg:"Please provide valid category"})
        }
        //reviews
       // if(!reviews){
           // return res.status(400).send({status:false,msg:"Reviews is required"})
        //}
       // if(!isValid(reviews)){
            //return res.status(400).send({status:false,msg:"Please provide valid reviews"})
       // }
        let savedData = await bookModel.create(requestBody)
        return res.status(201).send({status:true,data:savedData})
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}
//   Delete bookId
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