const jwt = require("jsonwebtoken");
const bookModel = require("../models/bookModel") 
const userModel=require("../model/userModel")



//================================================= Authentication ==================================================//


const authenticate = async function (req, res, next) {
    try {
        let token = req.headers["x-Api-key"];
        if (!token) token = req.headers["x-api-key"];
        
        if (!token) return res.status(401).send({ status: false, msg: "token must be present", });

        let decodedToken = jwt.verify(token, "grouP77", (err, decoded)=>{
            if(err){
                res.status(400).send({status: false , Error : err.message})
            }else{
                return decoded
            }
        })
        if (!decodedToken) return res.status(403).send({ status: false, msg: "token is invalid", });
        req["userId"]= decodedToken.userId
    }
    catch(err){
        console.log(err)
        res.status(500).send({status:false,message:err.message})
    }
      
        

}

  






//================================================= Authorization ==================================================//





module.exports.authenticate = authenticate
