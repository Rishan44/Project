const express=require("express")
const userController = require('../controller/userController')
const userRoute=express()
const productController = require('../controller/productController')
const addressController = require('../controller/addressController')
const orderController =require('../controller/orderController')
const {isUserLoggedIn, isUserLoggedOut ,isUserBlocked} = require('../middleware/auth')

userRoute.set('views', 'views/user')

userRoute.use(async(req,res,next)=>{
    res.locals.cartCount=req.session.cartCount
    res.locals.wishCount = req.session.wishCount
    next()
})

userRoute.use('/',isUserBlocked)


userRoute.get("/",userController.loadHome)
userRoute.get("/login",isUserLoggedOut,userController.loadLogin)
userRoute.post("/login",isUserLoggedOut,userController.postLogin)


userRoute.get("/register",isUserLoggedIn,userController.loadRegister)
userRoute.post('/register',isUserLoggedIn,userController.postRegister)

userRoute.post('/validateOTP',isUserLoggedOut,userController.validateOTP)
userRoute.post('/resendOTP',userController.resendOTP)

//to check isUserLoggedIn after this route
userRoute.use('/',isUserLoggedIn)

userRoute.get('/shop',productController.loadShop)
userRoute.get('/shop/productOverview1/:id',productController.loadProductOverview);

userRoute.get('/logout', userController.logoutUser);

//cart management
userRoute.get('/shoppingCart',userController.loadShoppingCart)
userRoute.get('/shop/addToCart/:id',userController.addToCart)
userRoute.put('/updateCart',userController.updateCart);
userRoute.post('/shoppingCart/removeItem/:id',userController.removeCartItem)
userRoute.post('/shoppingCart/clearCart',userController.clearCart)
userRoute.get('/shoppingCart/proceedToCheckout',orderController.loadCheckout)
userRoute.post('/shoppingCart/placeOrder',orderController.placeOrder)
userRoute.get('/wishlist',userController.loadWishlist)
userRoute.get('/addToWishlist/:productId',userController.addToWishlist)
userRoute.get('/RemoveWishlistItem/:productId',userController.removeWishlistItem)

userRoute.get('/orderSuccess',orderController.orderSuccess)


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

userRoute.get('/profile/forgotPassword',userController.forgotPassword)
userRoute.post('/profile/forgotPasswordVerification',userController.verifyOTPforgotPass)
userRoute.get('/profile/resetPassword',userController.loadResetPassword)
userRoute.post('/profile/resetPassword',userController.postResetPassword)


userRoute.get('/profile/myOrders',orderController.loadMyOrders)
userRoute.get('/viewOrderDetails/:orderId',orderController.loadViewOrderDetails)


module.exports=userRoute