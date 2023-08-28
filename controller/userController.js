const User=require('../models/userModel')
const { getOTP, securePassword } = require('../helpers/generator')
const { sendVerifyMail } = require('../services/nodeMailer')
const crypto = require('crypto')
const bcrypt = require('bcrypt')






const loadHome = async(req,res,next)=>{
    try {
        const isLoggedIn = Boolean(req.session.userId)
        
        res.render('home',{page:'Home',isLoggedIn})
    } catch (error) {
        next(error);
    }
}


const loadLogin = async(req, res,next) => {
    try {
        res.render('login')
    } catch (error) {
        next(error);
    }
}

const logoutUser = async(req,res,next)=>{
    try {
        req.session.destroy()
        res.redirect('/')
    } catch (error) {
        next(error)
    }
}

const postLogin= async(req,res,next) =>{
    try {
        const {email, password} = req.body
        const userData = await User.findOne({email})
        
        if(userData){
            const passwordMatch = await bcrypt.compare(password,userData.password)
        
           if(passwordMatch){

             if(!userData.isBlocked){
                req.session.userId = userData._id
                // req.session.cartCount = userData.cart.length
                res.redirect('/')

                res.render("login",{isLoggedIn:true});
             }else{
                res.render('login',{message: 'Sorry you are blocked by the admin'})
                return;
             }
           }else{
            res.render('login',{message: 'Invalid Password'})
           }
        }else{
            res.render('login',{message: 'User does not exist'})
        }
    } catch (error) {
        next(error)
    }
}

const loadRegister = async(req,res,next)=>{
    try {
        res.render('register')
    } catch (error) {next
        next(error);
    }
}


// post signup

const postRegister = async(req,res,next)=>{
    try {
        const { fname, lname, email , mobile, password, confirmPassword } = req.body
        // res.json({fname, lname, email , mobile, password, confirmPassword})
        if(password === confirmPassword){
           
            const userData = await User.findOne({email})
            if(userData){
                console.log("User Already Exists");
                return res.render('register',{message : 'User Already Exists'})
            }

            const OTP = req.session.OTP = getOTP()
            // req.session.save()
            // req.session.fname=fname
            // req.session.lname=lname
            // req.session.email=email
            // req.session.mobile=mobile
            // req.session.password=password

            console.log(OTP);

            sendVerifyMail(email, OTP)

            setTimeout(() => {
                req.session.OTP = null    //Or delete req.session.otp
                console.log('OTP time out');
            }, 600000);

            res.render('otpValidation',{fname, lname, email, mobile, password, message:'Check Spam Mails'})

        }else{
            // console.log("Password Not Matching");
            res.render('register',{message : 'Password Not Matching'})
        }
   
    } catch (error) {
        next(error);   
    }
}

const validateOTP = async(req,res ,next) => {

    try {
        const { fname, lname, email, mobile, password } = req.body

        const userOTP = req.body.OTP
        

        if(userOTP == req.session.OTP){
            const spassword = await securePassword(password)


            let newUserData;

            newUserData = await new User({
                fname,lname, email, mobile,
                password:spassword
            }).save();

            req.session.userId = newUserData._id;

            res.redirect('/')

        }else{
            console.log('Incorrect OTP');
            res.render('otpValidation', { fname, lname, email, mobile, password, message:'Incorrect OTP'})
        }
    } catch (error) {
        next(error);
    }
}

const resendOTP = async(req,res, next)=>{
    try{
        console.log('in resend otp controller');
        const { email } = req.body
        const OTP=req.session.OTP = getOTP()
        console.log('resending otp '+OTP+' to '+email);
        setTimeout(() => {
            req.session.OTP = null;   //Or delete req.session.otp;
            console.log('otp time out');
        }, 600000);
        sendVerifyMail(email, OTP);
        res.json({isResend:true})
        
    } catch(error){
        next(error)
    }
}

module.exports = {
    loadHome,
    loadLogin,
    logoutUser,
    postLogin,
    loadRegister,
    postRegister,
    validateOTP,
    resendOTP
}


// new User({
//     name, //if both are same     save user
//     email: email
// }).save()