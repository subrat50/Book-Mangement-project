const jwt = require("jsonwebtoken");
const bookModel = require("../model/bookModel") 
const userModel=require("../model/userModel")

//<!-----------------------Authentication------------------------------->
const authenticate = async function (req, res, next) {
    try {
        let token = req.headers["x-Api-key"];
        if (!token) token = req.headers["x-api-key"];
        
        if (!token) return res.status(401).send({ status: false, msg: "Token must be present", });

        let decodedToken = jwt.verify(token, "Group77", (err, decoded)=>{
            if(err){
                res.status(400).send({status: false , Error : err.message})
            }else{
                return decoded
            }
        })
        if (!decodedToken) return res.status(403).send({ status: false, msg: "Token is invalid", });
        req.userId= decodedToken.userId
        
        // req["bookId"]=decodedToken.bookId
    }
    catch(err){
        console.log(err)
        res.status(500).send({status:false,message:err.message})
    }
    next()
}
//     try {
//         let token = req.headers["x-api-key"];
//         if (!token) token = req.headers["x-Api-key"];

//         if (!token) return res.status(401).send({ status: false, msg: "Token must be present" });
//         console.log(token);

//         let decodedToken = jwt.verify(token, "Group-77");
//         if (!decodedToken)
//             return res.status(401).send({ status: false, msg: "Token is invalid" })
//         next()
//     }
//     catch (err) { res.status(500).send({ status: false, msg: err.message }) }
// 

module.exports.authenticate = authenticate