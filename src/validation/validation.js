const isValid= function(value){
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    if(value==null)return false
    return true
}
const isvalidName=(name)=>{
    if( /^[-a-zA-Z_:,.' ']{1,100}$/.test(name))
    return true
}
const isValidEmail=(mail)=>{
    if(/^\w+([\.-]?\w+)*@\w([\.-]?\w+)*(\.w{2,3})+$/.test(mail))
    return true 
}
const isValidMobile=(mobile)=>{
    if(/^[0]?[6789]\d{9}$/.test(mobile))
    return true
    const isValidPassword=(password)=>{
        if(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d.*)[a-zA-Z0-9\$]{8,15}$/.test(password))
        return true
    }
    module.exports=(isValid,isvalidName,isValidEmail,isValidMobile,isValidPassword)

}