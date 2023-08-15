const User=require('../models/userModel')



const loadHome = async(req,res)=>{
    try {
        // const isLoggedIn = Boolean(req.session.userId)
        
        res.render('home',{page:'Home'})
    } catch (error) {
        console.log(error);
    }
}


const loadLogin = async(req, res) => {
    try {
        res.render('login')
    } catch (error) {
        console.log(error);
    }
}

const loadRegister = async(req,res)=>{
    try {
        res.render('register')
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    loadHome,
    loadLogin,
    loadRegister
}