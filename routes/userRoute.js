const express=require("express")
const userController = require('../controller/userController')
const userRoute=express()

userRoute.set('views', 'views/user')

userRoute.get("/",userController.loadHome)
userRoute.get("/login",userController.loadLogin)
userRoute.get("/register",userController.loadRegister)

module.exports=userRoute