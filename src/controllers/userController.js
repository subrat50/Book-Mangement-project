const userModel = require("../model/userModel.js")
const jwt=require("jsonwebtoken")

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    // if (typeof value === "string")
        return true;
};

const isvalidRequest = function (requestBody) {
    return Object.keys(requestBody).length > 0
}
const isValidTitle = function (title) {
    return ["Mr", "Mrs", "Miss"].indexOf(title) !== -1
  }

//==========================create user========================================================

const createUser = async function (req, res) {
    try {
        let requestBody = req.body
    //-----------------------validation start-----------------------------
        if (!isvalidRequest(requestBody)) {
            return res.status(400).send({ status: false, msg: "Please provide User data" })
        }
//--------------------destructure-------------------------------------------------------------
        let { title, name, phone, email, password, address,street,city,pincode } = requestBody
        //------------validate the title
        if (!isValid(title)) {
            return res.status(400).send({ status: false, msg: "Title is required"})
        }
        if(!isValidTitle(title)){
            return res.send({msg:"Invalid format of title"})
         }
         let checkTitle=await userModel.findOne({title})
         if(!checkTitle) return res.status(400).send({status:false,message:"title is already use"})
        //----------------------validate the name------------------------------
        if (!isValid(name)) {
            return res.status(400).send({ status: false, msg: "Name is required" })
        }
        if(!/^[a-zA-Z.]{2,15}$/.test(name)){
           return res.send({msg:"Invalid format"})
        }
    //------------------validate phone---------------------------------------
        if (!isValid(phone)) {
            return res.status(400).send({ status: false, msg: "Phone number is required" })
        }
        if (!(/^[6-9]{1}[0-9]{9}$/im.test(phone))) return res.status(400).send({ status: false, message: "Phone number is invalid. +91 is not required" })
        let checkNumber = await userModel.findOne({ phone })
        if (checkNumber) return res.status(404).send({ status: false, message: "Phone Number is already in use" })
    //-------------validate email---------------------------------------
        if (!isValid(email)) {
            return res.status(400).send({ status: false, msg: "Email is required" })
        }
        if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email))) return res.status(400).send({ status: false, message: "email Id is invalid" })
        let Email = await userModel.findOne({ email })
        if (Email) return res.status(400).send({ status: false, message: "email is already used" })
    //------------------------validate password----------------------------------------------
        if (!isValid(password)) {
            return res.status(400).send({ status: false, msg: "Password is required" })
        }
        if(!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/.test(password)){
            return res.status(400).send({status:false,msg:"Password is invalid"})
        }
       //-----------------------------validate addresss-------------------------------------------------------
        if (address) {
            
            if(!isValid(address.street)){
                return res.status(400).send({status:false,msg:"Street is required"})
            }
            if(!isValid(address.city)){
                return res.status(400).send({status:false,msg:"City is required"})
            }
            if(!/^(\d{4}|\d{6})$/.test(address.pincode)){
                return res.status(400).send({status:false,msg:"Pincode is required"})
            }
        }
    //---------------------send response------------------------------------------------
        let savedData = await userModel.create(requestBody)
        {return res.status(201).send({status:true,data:savedData})}
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ status: false, msg: err.message  })
    }
}

//==============================login user========================================================

const loginUser=async function(req,res){
    try{
    let requestBody=req.body
    if(!isvalidRequest(requestBody)) return res.status(400).send({msg:false,msg:"please provied requestbody"})
    let {email,password}=requestBody
    if (!isValid(email)) {
        return res.status(400).send({ status: false, msg: "Email is required" })
    }
    if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email))) return res.status(400).send({ status: false, message: "email Id is invalid" })
    if (!isValid(password))  return res.status(400).send({ status: false, msg: "Password is required" })
    if(!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/.test(password))
    return res.status(400).send({status:false,msg:"Password is invalid"})
    

    let user=await userModel.findOne({email:email,password:password})
    if(!user) return res.status(400).send({status:false,msg:"email & password is incorrect"})
    //---------creat jwt token-----------
    let token=jwt.sign({
         email:user.email.toString(),
        userId:user._id.toString(),
        project:"Book Mangement",
        batch:"Radon"
    },
    "group77",
    {
        expiresIn: "72h",
    }
    )
    res.setHeader("x-api-key",token)
    return res.status(400).send({status:true,token:token,msg:"login sucessfully"})
}catch(err){
       res.status(500).send({status:false,msg:err.message})
}
}


module.exports.createUser=createUser
module.exports.loginUser=loginUser
