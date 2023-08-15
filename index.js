const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/Ecommerce")
const express=require("express")
require('dotenv').config()
const path = require('path')
const userRoute=require("./routes/userRoute")
const adminRoute= require('./routes/adminRoute'); 
const app=express()

const nocache = require('nocache')
const PORT = process.env.PORT

app.set('view engine', 'ejs')

app.use('/static',express.static(path.join(__dirname,'public')))
app.use('/assets',express.static(path.join(__dirname,'/public/assets')));
app.use(express.json())
app.use(nocache())


/** For Admin Route */

app.use('/admin',adminRoute);
app.use('/',userRoute);   

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))