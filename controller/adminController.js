const bcrypt = require('bcrypt')
const Admin = require('../models/adminModel')
const User = require('../models/userModel')





//Load Admin Login
const loadLogin=async(req,res)=>{

    try{
        res.render('adminLogin',{title:'Admin Login', message:''});
    }catch(error){

        console.log(error.message);
    }

}


// const postLogin=async(req,res)=>{

//     try{
//         const { email, password} = req.body

//         // const a = req.body.a
//         const adminData = await Admin.findOne({email:email});
//         // console.log(email);
//         // console.log(password);
//         // console.log(adminData);
//         if(adminData ){
//             if(password == adminData.password){
//                 res.render('dashboard',{page:'Dashboard'})
//             }else{
//                 // console.log('password not matched');
//                 // app.locals.message ='password not matched'
//                 res.render('adminLogin ',{message:'password not matched'})
//             }
//         }else{
//             console.log('email not exist');
//             res.render('adminLogin',{message:'email not exist'})
//         }
//         res.render('adminLogin',{title:'Admin Login'});
//     }catch(error){

//         console.log(error.message);
//     }

// }


const postLogin = async(req,res, next) => {
    try {
        const {email, password} = req.body;
        const adminData = await Admin.findOne({email:email})
        if(adminData){
            
            const passwordMatch = await bcrypt.compare(password, adminData.password)
            console.log(passwordMatch);
            if(passwordMatch){
                req.session.adminId = adminData._id;
                // res.render('dashboard',{page:'Dashboard'})
               
                res.redirect('/admin/dashboard')

            }else{
                console.log('Invalid Password');
                res.render('adminLogin',{message:'Password is not matched'})
            }
        }else{
            console.log("This email doesn't exist");
            res.render('adminLogin',{message:"This email doesn't exist"})
        }

    } catch (error) {
        next(error)
    }
}

const loadDashboard = async(req,res)=>{

    try {

        res.render("dashboard",{ page: 'Dashboard' })
    } catch (error) {
        console.log(error);
    }


}

const loadUsers = async(req,res)=>{

    try{
        const userData= await User.find({})
        res.render("users",{userData:userData, page:"Users",userData})
    } catch(error){
        console.log(error);
    }

}

const adminLogout = async(req,res,next)=>{
    try {
        req.session.adminId = null
        res.redirect('/admin/login')
    } catch (error) {
        next(error)
    }
}

const blockUser = async(req,res, next) => {
    try {
        
        const id = req.params.id
        const user = await User.findById({_id:id})
        user.isBlocked = !user.isBlocked
        await user.save()

        res.redirect('/admin/users')
    } catch (error) {
        next(error)
    }
}



module.exports = {
    loadLogin,
    postLogin,
    loadDashboard,
    loadUsers,
    adminLogout,
    blockUser
}