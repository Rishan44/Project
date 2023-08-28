const Categories = require('../models/categoryModel')
const Products = require('../models/productModel')
const flash =require('express-flash')

const loadCategories = async(req,res,next)=>{
    try {
        const categories = await Categories.find({})
        const offerData = []
        res.render('categories',{categories, page:'Categories'})
    } catch (error) {
            next(error)
        }
}



const addCategory =async(req,res,next)=>{
    try {
        const categoryName = req.body.categoryName.toUpperCase()
        if(categoryName){

            const isExistCategory= await Categories.findOne({name:categoryName})

            if(isExistCategory){
                console.log('Category Already Exist');
                
                res.redirect('/admin/categories')
            }else{
                await new Categories({name:categoryName}).save()
                res.redirect('/admin/categories')
            }
        }else{
            console.log('Enter Category Name');
            res.redirect('/admin/categories')
        }
    } catch (error) {
        next(error)
    }
}

const editCategory = async(req,res,next)=>{
    try {
        console.log('on edit category controller its working!');
        const id = req.body.categoryId
        const newName = req.body.categoryName.toUpperCase()

        const isCategoryExist = await Categories.findOne({name:newName})

        if(req.file){
            console.log('req. file is there');
            console.log(req.file);
            const image = req.file.filename
            if(!isCategoryExist || isCategoryExist._id == id){
                await Categories.findByIdAndUpdate({_id:id},{$set :{name:newName, image:image}})
            }
        }else{
            console.log('no req.file');
              if(!isCategoryExist){
                await Categories.findByIdAndUpdate({_id:id},{$set :{name:newName}})
            }
        }

        res.redirect('/admin/categories')
    } catch (error) {
        console.log(error.message);
    }
}

const listCategory = async(req,res,next)=>{
    try {
        const id =req.params.id;
        const categoryData = await Categories.findById({_id:id})

        if(categoryData){
            categoryData.isListed = !categoryData.isListed
            await categoryData.save()
        }
        res.redirect('/admin/categories')
    } catch (error) {
        next(error)
    }
}





module.exports = {
    loadCategories,
    addCategory,
    editCategory,
    listCategory
}