const mongoose = require("mongoose");
const validator = require("validator");
const jwt  = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please Enter your name"],
        maxLength:[30,"Name cannot exceed 30 character"],
        minLength:[4,"Name Should have more than 5 character"],
    },
    email:{
        type:String,
        required:[true,"Please Enter your Email"],
        unique:true,
        validate:[validator.isEmail,"Please Enter a valid Email"]
    },
    password:{
        type:String,
        required:[true,"Please Enter your password"],
        minLength:[8,"Password Should have more than 8 character"],
        select:false
    },
    avatar:{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        },
    },
    role:{
        type:String,
        default:"user",
    },
    phone:{
        type:Number,
        required:[true,"Please Enter your phone number"],
    },
    category:{
        type:String,
        default:"none",
    },
    rating:{
        type:Number,
        default:0,
    },
    posCount:{
        type:Number,
        default:0
    },
    numOfReviews:{
        type:Number,
        default:0
    },
    reviews:[
        {
            user:{
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required: true,
            },
            name:{
                type:String,
                required:true
            },
            rating:{
                type:String,
                required:true
            },
            comment:{
                type:String,
                required:true
            },
            isPos:{
                type:Boolean,
                default:false,
            },
        }
    ],
    city:{
        type:String,
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date,
});

userSchema.pre("save",async function(next){
    if(!this.isModified("password"))
    {
        next();
    }
    this.password = await bcrypt.hash(this.password,10);
})

//JWT TOKEN

userSchema.methods.getJWTToken = function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE
    });
}

//compare password

userSchema.methods.comparePassword = async function(enteredPassword)
{
    return await bcrypt.compare(enteredPassword,this.password);
}

//generating password reset token
userSchema.methods.getResetPasswordToken = function (){
    //Generating Token
    const resetToken = crypto.randomBytes(20).toString("hex");

    //hashing and adding to user schema
    this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

    this.resetPasswordExpire=Date.now() + 15*60*1000;

    return resetToken;
}
module.exports=mongoose.model("User",userSchema);