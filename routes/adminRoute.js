const express = require('express');
const adminRoute= express()
const session=require('express-session')
const config = require('../config/config')
const { randomUUID } = require('crypto')
const adminController=require('../controller/adminController')
const productController = require('../controller/productController')
const upload = require('../config/multer')
const categoryController = require('../controller/categoryController')
const orderController = require('../controller/orderController')
const couponController = require('../controller/couponController')
const offerController = require('../controller/offerController') 
const path = require('path')
const { isAdminLoggedIn, isAdminLoggedOut } = require('../middleware/auth')
// const nocache=require('nocache')




adminRoute.set('views','./views/admin')



const { cache } = require('ejs')

//Admin Login Handling
adminRoute.get('/login',isAdminLoggedOut ,adminController.loadLogin);
adminRoute.post('/login',isAdminLoggedOut ,adminController.postLogin)
adminRoute.post('/logout',adminController.adminLogout)


//admin dashboard
adminRoute.get('/dashboard',adminController.loadDashboard)

//User handling
adminRoute.get('/users',adminController.loadUsers)
adminRoute.get('/users/block/:id',adminController.blockUser)


//Category Handling
adminRoute.get('/categories',categoryController.loadCategories)
adminRoute.post('/categories',categoryController.addCategory)
adminRoute.post('/categories/edit',upload.single('categoryImages'),categoryController.editCategory)
adminRoute.get('/categories/list/:id',categoryController.listCategory)



//product Handling
adminRoute.get('/products',productController.loadProducts)
adminRoute.get('/products/addProduct',productController.loadAddProduct)
adminRoute.post('/products/addProduct',upload.array('product',3),productController.addProductDetails)
adminRoute.get('/products/editProduct/:id',productController.loadEditProduct)
adminRoute.post('/products/editProduct',upload.array('product',3),productController.postEditProduct)
adminRoute.get('/products/deleteProduct/:id',productController.deleteProduct)

adminRoute.get('/products/imageDelete/:id',productController.deleteImage)

adminRoute.get('/ordersList',orderController.loadOrdersList)
adminRoute.post('/changeOrderStatus',orderController.changeOrderStatus)
adminRoute.get('/cancelOrder/:orderId',orderController.cancelOrder)
adminRoute.get('/cancelSinglePrdt/:orderId/:pdtId',orderController.cancelSinglePdt)
adminRoute.get('/approveReturn/:orderId',orderController.approveReturn)
adminRoute.get('/approveReturnSinglePrdt/:orderId/:pdtId',orderController.approveReturnForSinglePdt)

//Coupon Handling
adminRoute.get('/coupons',couponController.loadCoupons)
adminRoute.get('/coupons/addCoupon',couponController.loadAddCoupon)
adminRoute.post('/coupons/addCoupon',couponController.postAddCoupon)
adminRoute.get('/coupons/editCoupon/:couponId',couponController.loadEditCoupon)
adminRoute.post('/coupons/editCoupon/:couponId',couponController.postEditCoupon)
adminRoute.get('/coupons/cancelCoupon/:couponId',couponController.cancelCoupon)


adminRoute.get('/offers',offerController.loadOffer)
adminRoute.get('/offers/addOffer',offerController.loadAddOffer)
adminRoute.get('/offers/editOffer/:offerId',offerController.loadEditOffer)


adminRoute.post('/offers/addOffer',offerController.postAddOffer)
adminRoute.post('/offers/editOffer/:offerId',offerController.postEditOffer)
adminRoute.get('/offers/cancelOffer/:offerId',offerController.cancelOffer)
adminRoute.post('/applyOfferToCategory',categoryController.applyCategoryOffer)
adminRoute.post('/removeCategoryOffer/:catId',categoryController.removeCategoryOffer)
adminRoute.post('/applyOfferToProduct',productController.applyProductOffer)
adminRoute.post('/removeProductOffer/:productId',productController.removeProductOffer)

module.exports = adminRoute