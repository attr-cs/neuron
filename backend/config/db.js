const mongoose = require('mongoose');

const connectDb = async()=>{
    try{
        await mongoose.connect(process.env.DB_URL);
        console.log("database connected successfully ✔️");
    }catch(error){
    console.log("database connection failed ❌");
    console.error("FULL ERROR:", error);
}
}

module.exports = connectDb;

