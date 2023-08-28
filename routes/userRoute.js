const express=require("express")
const userController = require('../controller/userController')
const userRoute=express()
const productController = require('../controller/productController')

userRoute.set('views', 'views/user')

userRoute.get("/",userController.loadHome)
userRoute.get("/login",userController.loadLogin)
userRoute.post("/login",userController.postLogin)


userRoute.get("/register",userController.loadRegister)
userRoute.post('/register',userController.postRegister)

userRoute.post('/validateOTP',userController.validateOTP)
userRoute.post('/resendOTP',userController.resendOTP)


userRoute.get('/shop',productController.loadShop)
userRoute.get('/shop/productOverview/:id',productController.loadProductOverview);

userRoute.get('/logout', userController.logoutUser);
module.exports=userRoute