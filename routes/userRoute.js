const express=require("express")
const userController = require('../controller/userController')
const userRoute=express()
const productController = require('../controller/productController')
const addressController = require('../controller/addressController')



userRoute.set('views', 'views/user')

userRoute.get("/",userController.loadHome)
userRoute.get("/login",userController.loadLogin)
userRoute.post("/login",userController.postLogin)


userRoute.get("/register",userController.loadRegister)
userRoute.post('/register',userController.postRegister)

userRoute.post('/validateOTP',userController.validateOTP)
userRoute.post('/resendOTP',userController.resendOTP)


userRoute.get('/shop',productController.loadShop)
userRoute.get('/shop/productOverview1/:id',productController.loadProductOverview);

userRoute.get('/logout', userController.logoutUser);

//cart management
userRoute.get('/shoppingCart',userController.loadShoppingCart)
userRoute.get('/shop/addToCart/:id',userController.addToCart)
userRoute.put('/updateCart',userController.updateCart);
userRoute.post('/shoppingCart/removeItem/:id',userController.removeCartItem)


//Profile management
userRoute.get('/profile',userController.loadProfile)
userRoute.get('/profile/edit',userController.loadEditProfile)
userRoute.post('/profile/edit',userController.postEditProfile)

userRoute.get('/profile/addAddress',addressController.loadAddAddress)
userRoute.post('/profile/addAddress/:returnPage',addressController.postAddAddress)
userRoute.get('/profile/editAddress/:id',addressController.loadEditAddress)
userRoute.post('/profile/editAddress/:id',addressController.postEditAddress)
userRoute.get('/profile/deleteAddress/:id',addressController.deleteAddress)

userRoute.get('/profile/changePassword',userController.loadChangePassword)
userRoute.post('/profile/changePassword',userController.postChangePassword)

module.exports=userRoute