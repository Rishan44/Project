const isLogin=async(req,res,next)=>{

    try{

        if(req.session.user){
            res.redirect('/home')
        }else if(req.session.admin){
            // res.redirect('/home')
            next()
        }else{
            res.redirect('/admin')
        }
    }catch(error){
        console.log(error.message);
        res.status(500).send("Internal Server Error")
    }
}

const isLogout=async(req,res,next)=>{
    
    try{

        if(req.session.user){
            res.redirect('/')
        }else if(req.session.admin){
            res.redirect('/admin/home')
        }else{
            next()
        }
    
    }catch(error){

        console.log(error.message);

    }
}

module.exports={
    isLogin,
    isLogout
}