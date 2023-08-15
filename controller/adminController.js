const Admins = require('../models/adminModel')







//Load Admin Login
const loadLogin=async(req,res)=>{

    try{
        res.render('adminLogin',{title:'Admin Login', message:''});
    }catch(error){

        console.log(error.message);
    }

}


const postLogin=async(req,res)=>{

    try{
        const { email, password} = req.body
        // const a = req.body.a
        const adminData = await Admins.findOne({email});
        // console.log(email);
        // console.log(password);
        // console.log(adminData);
        if(adminData ){
            if(password == adminData.password){
                res.render('dashboard',{page:'Dashboard'})
            }else{
                // console.log('password not matched');
                // app.locals.message ='password not matched'
                res.render('adminLogin ',{message:'password not matched'})
            }
        }else{
            console.log('email not exist');
            res.render('adminLogin',{message:'email not exist'})
        }
        res.render('adminLogin',{title:'Admin Login'});
    }catch(error){

        console.log(error.message);
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
        // const userData= await UserActivation.find({})
        res.render("users",{ page:"Users"})
    } catch(error){
        console.log(error);
    }

}



module.exports = {
    loadLogin,
    postLogin,
    loadDashboard,
    loadUsers
}