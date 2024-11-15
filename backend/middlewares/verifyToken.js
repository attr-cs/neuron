const jwt = require('jsonwebtoken');


const verifyToken = (req,res,next)=>{
    const rawToken = req.headers.authorization;
    if(!rawToken || !rawToken.startsWith('Bearer ')){
        return res.status(400).json({"msg":"Invalid Token!"});
    }
    const token = rawToken.split(" ")[1];
    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    }catch(error){
        return res.status(401).json({"msg":"Invalid Token provided!"});
    }
}

module.exports = verifyToken;