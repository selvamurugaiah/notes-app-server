
const mongoose = require("mongoose");
const validator = require("validator");
const PasswordValidator = require("password-validator")


const passwordSchema = new PasswordValidator();
passwordSchema.is()
.min(8)
.has()
.uppercase()
.has()
.symbols();


const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:[true, "Username is required"],
        trim:true
    },
    email:{
        type:String,
        required:[true, "Email is required"],
        unique:true,
        validate:{
            validator:validator.isEmail,
            message:'Invalid Email Format',
        },

    },
    password:{
        type:String,
        required:[true, "Password is required"],
        validate:{
            validator:function(value){
                return passwordSchema.validate(value);
            },
            message:'Password must be at least 8 characters, contain at least one uppercase letter, and one special character (!@#$%^&*)'
        },
    },

},
{
    timestamps:true,
}

);

//Compile schema into model

const User = mongoose.model('User',userSchema )

module.exports = User;