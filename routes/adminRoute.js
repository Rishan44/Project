const express = require('express');
const adminRoute= express()
const session=require('express-session')
const config = require('../config/config')
const { randomUUID } = require('crypto')
const adminController=require('../controller/adminController')
const productController = require('../controller/productController')
const upload = require('../config/multer')
const categoryController = require('../controller/categoryController')
const path = require('path')
// const nocache=require('nocache')


// adminRoute.use(nocache())

// adminRoute.use(express.json());
// adminRoute.use(express.urlencoded({extended:true}))

// adminRoute.use(
//     session({
//         secret:randomUUID(),
//         resave:false,
//         saveUninitialized:true,
//     })
// )

// adminRoute.set('view engine','ejs')
adminRoute.set('views','./views/admin')

const auth=require('../middleware/adminAuth')

const { cache } = require('ejs')

//Admin Login Handling
adminRoute.get('/login',adminController.loadLogin);
adminRoute.post('/login',adminController.postLogin)
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


module.exports = adminRoute