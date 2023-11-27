const User = require('./../Models/userModel')
const asyncErrorHandler = require('./../Utils/asyncErrorHandler');
const jwt = require('jsonwebtoken')
const CustomError = require('./../Utils/CustomError');
const bcrypt = require('bcryptjs')
const util = require('util')
const sendEmail = require('./../Utils/email')
const crypto = require('crypto')

const signToken = (newUserId) => {
    return jwt.sign(
        { id: newUserId },
        process.env.SECRET_STR,
        {
            expiresIn: process.env.LOGIN_EXPIRES
        }
    )
}


const signup = asyncErrorHandler(async (req, res, next) => {
    // for hashing pwd we use mongoDB middleware at pre save in model
    console.log(req.body)
    const newUser = await User.create(req.body)

    const token = signToken(newUser._id)

    res.status(201).json({
        status: "success",
        token,
        data: {
            user: newUser
        }
    })
})

const login = asyncErrorHandler(async (req, res, next) => {
    const { email, password } = req.body
    // if email and pwd is provided or not
    if (!email || !password) {
        const error = new CustomError('Please provide email id and password for login', 400)
        return next(error)
    }
    // finding the user
    const user = await User.findOne({ email }).select('password')

    // const isMatch = await user.comparePasswordInDb(password,user.password)
    console.log(typeof password, user)
    // for comparing the pwd we compare it in the user model by creating a instance method
    if (!user || !(await user.comparePasswordInDb('' + password, user.password))) {
        const error = new CustomError("Incorrect email or password", 400)
        return next(error)
    }

    const token = signToken(user._id)

    res.status(200).json({
        status: "sucess",
        token
    })
})

const protect = asyncErrorHandler(async (req, res, next) => {
    // 1. read the token and check if exits
    const testToken = req.headers.authorization
    let token
    if (testToken && testToken.toLowerCase().indexOf('bearer') === 0) {
        token = testToken.substr(7);
    }
    if (!token) {
        next(new CustomError('You are not loggrd in ', 401))
    }
    // 2.if present - validate it
    const decodedToken = await util.promisify(jwt.verify)(token, process.env.SECRET_STR)

    // 3.if the user exists
    const user = await User.findById(decodedToken.id)

    if (!user) {
        const error = new CustomError("User with the given token does not exists.", 400)
        return next(error)
    }

    // 4.if the user has changed the password after the token was issed
    /** for comparing the pwd we compare it in the user model by creating a instance method
    by taking the jwt time stamp and taking the pwd changed field at the schema
    => we can get the jwt timstamp from the decoded token iat(issued at)
    */
    const isPwdChanged = await user.isPasswordChanged(decodedToken.iat)
    if (isPwdChanged) {
        const error = new CustomError("The password has changed recently. Please login again", 401)
        return next(error)
    }

    // 5.allow access to route
    req.user = user
    next()
})

const restrict = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            const error = new CustomError("You do not have pwemission to perform this action", 403)
            next(error)
        }
        next()
    }
}

const forgotPassword = asyncErrorHandler(async (req, res, next) => {
    // 1. get user based on req
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        const error = new CustomError("We could not find the user with the given email.", 400)
        return next(error)
    }
    // 2. GENERATE A RANDOM RESET TOKEN
    const resetToken = user.createResetPasswordToken()
    await user.save({ validateBeforeSave: false })

    // 3.send email
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`

    const message = `we have recieved a password reset request. Please use the below link to reset your password \n\n ${resetUrl} \n\n This link will be only valid for 10 minutes`

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password reset request',
            message: message
        })

        res.status(200).json({
            status: "success",
            message: "password reset link send to your email"
        })

    } catch (error) {
        user.passwordResetToken = undefined
        user.passwordResetTokenExpire = undefined
        user.save({ validateBeforeSave: false })
        return next(new CustomError('There was an error sending password reset email. Please try again later', 500))
    }
})

const resetPassword = asyncErrorHandler(async (req, res, next) => {
    const token = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({ passwordResetToken: token, passwordResetTokenExpire: { $gt: Date.now() } })
    if (!user) {
        const error = new CustomError("Token is invalid or has expired", 400)
        next(error)
    }
    user.password = req.body.password
    user.confirmPassword = req.body.confirmPassword
    user.passwordResetToken = undefined
    user.passwordResetTokenExpire = undefined
    user.passwordChangedAt = Date.now()

    user.save()

    const loginToken = signToken(user._id)

    res.status(200).json({
        status: "sucess",
        token:loginToken
    })

})


module.exports = {
    signup,
    login,
    protect,
    restrict,
    forgotPassword,
    resetPassword
}