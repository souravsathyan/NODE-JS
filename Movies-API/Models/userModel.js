const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please Enter Your Name']
    },
    email: {
        type: String,
        required: [true, 'Please enter a valid email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please Enter a valid Email']
    },
    photo: String,
    roles:{
        type:String,
        enum:['user', 'admin'],
        default:'user'
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: 8,
        select: false
    },
    confirmPassword: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function (val) {
                // only work for save and create
                return val == this.password
            },
            message: 'Password and confirm password does not match'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken:String,
    passwordResetTokenExpire:Date
})

// hashing pwd
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt)
    this.confirmPassword = undefined
    next()
})

// comparing the pwd
userSchema.methods.comparePasswordInDb = async function (pwd, pwdDb) {
    return await bcrypt.compare(pwd, pwdDb)
}

// checking if the password changed after login and issuing jwt
userSchema.methods.isPasswordChanged = function (JWTTimestamp) {
    if(this.passwordChangedAt){
        const passwordChangedTimestamp = parseInt(this.passwordChangedAt.getTime()/1000,10)
        return JWTTimestamp < passwordChangedTimestamp
    }
    return false
}

// generating reset token
userSchema.methods.createResetPasswordToken = function(){
    // creating the crypted plain token
    const resetToken = crypto.randomBytes(32).toString('hex')
    // encrypting for saftey reason
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    this.passwordResetTokenExpire = Date.now()+10 * 60 * 1000
    /**returing the plain cryptocode to the user and stores the enrypred toke
     * in the DB so, when the user makes a req to change the pwd , will compre the plain code and the enrypted code
     */
    return resetToken
}

const User = mongoose.model('User', userSchema)
module.exports = User