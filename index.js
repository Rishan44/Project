const mongoose = require("mongoose");
// mongoose.connect("mongodb://127.0.0.1:27017/Ecommerce") 
const express=require("express")
require('dotenv').config()
const path = require('path')
const userRoute=require("./routes/userRoute")
const adminRoute= require('./routes/adminRoute'); 
const app=express()
const session = require("express-session")
const {mongoConnect, secretKey} = require('./config/config')
const nocache = require('nocache')
const flash= require('express-flash')
const { err404, err500 } = require('./middleware/errorHandler')
mongoConnect()

const PORT = process.env.PORT

app.set('view engine', 'ejs')

app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 30 * 24 * 60 * 1000}     //30 days
}))

app.use('/static',express.static(path.join(__dirname,'public')))
app.use('/assets',express.static(path.join(__dirname,'/public/assets')));
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(nocache())


/** For Admin Route */

app.use('/admin',adminRoute);
app.use('/',userRoute);   



app.set('views','./views/errors');

app.use(err404)
app.use(err500)

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))