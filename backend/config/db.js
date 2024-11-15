const mongoose = require('mongoose');

const connectDb = async()=>{
    try{
        await mongoose.connect(process.env.DB_URL);
        console.log("database connected successfully ✔️");
    }catch(error){
        console.warn("database connection failed ❌")
        process.exit(0);
    }
}

module.exports = connectDb;