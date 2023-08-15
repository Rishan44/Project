const express = require('express');
const adminRoute= express()
const session=require('express-session')
const config = require('../config/config')
const { randomUUID } = require('crypto')
const adminController=require('../controller/adminController')


const nocache=require('nocache')

adminRoute.use(nocache())

adminRoute.use(express.json());
adminRoute.use(express.urlencoded({extended:true}))

adminRoute.use(
    session({
        secret:randomUUID(),
        resave:false,
        saveUninitialized:true,
    })
)

// adminRoute.set('view engine','ejs')
adminRoute.set('views','./views/admin')

const auth=require('../middleware/adminAuth')

const { cache } = require('ejs')


adminRoute.get('/login',adminController.loadLogin);
adminRoute.post('/login',adminController.postLogin)
adminRoute.get('/dashboard',adminController.loadDashboard)
adminRoute.get('/users',adminController.loadUsers)
// adminRoute.get('/products',adminController.)
module.exports = adminRoute