const mongoose = require("mongoose")
const dotenv = require('dotenv')

dotenv.config()

const URL = process.env.MONGODB_URI

const dbConnect = async()=>{
    try {
       await mongoose.connect(URL,{
        useUnifiedTopology:true,
        useNewUrlParser:true

       });
       console.log('DB connected successfully') 
    } catch (error) {
        console.log(`Error ${error.message}`)
    }
}

module.exports = dbConnect
