require('dotenv').config();
const NEW_PORT = process.env.PORT || 4000 ;
const connectDb = require('./config/db');
const express = require('express');
const cors = require('cors');
const router = require('./routes/index');
const app = express();

app.use(cors());
connectDb();
app.use('/api',router);

app.listen(NEW_PORT,()=>{
    console.log("backend listening on 4000...");
})