const Categories = require('../models/categoryModel')
const Products = require('../models/productModel')
const Offers = require('../models/offerModel')
const flash =require('express-flash')

const loadCategories = async(req,res,next)=>{
    try {
        var categoryMessage = req.app.locals.specialContext;
        req.app.locals.specialContext = null;
        const categories = await Categories.find({}).populate('offer')
        const offerData = await Offers.find({ $or: [
            {status : 'Starting Soon'},
            {status : 'Available'}
        ]})
        res.render('categories',{categories, page:'Categories',categoryMessage,offerData})
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
                req.app.locals.specialContext = 'Category already exists';
                res.redirect('/admin/categories')
            }else{
                await new Categories({name:categoryName}).save()
                req.app.locals.specialContext = 'Category added successfully';
                res.redirect('/admin/categories')
            }
        }else{
            console.log('Enter Category Name');
            req.app.locals.specialContext = 'Enter the Category Name'
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

const applyCategoryOffer = async(req, res, next)=>{
    try {
        const { offerId, categoryId, override } = req.body

         //Setting offerId to offer field of category
         await Categories.findByIdAndUpdate(
            {_id:categoryId},
            {
                $set:{
                    offer: offerId
                }
            }
        );

        const offerData = await Offers.findById({_id:offerId})
        const products = await Products.find({category: categoryId})

        //applying offer to every product in the same category
        for(const pdt of products){

            const actualPrice = pdt.price - pdt.discountPrice;
            
            let offerPrice = 0;
            if(offerData.status == 'Available'){
                offerPrice = Math.round( actualPrice - ( (actualPrice*offerData.discount)/100 ))
            }
    
            if(override){
                await Products.updateOne(
                    { _id: pdt._id },
                    {
                        $set:{
                            offerPrice,
                            offerType: 'Offers',
                            offer: offerId,
                            offerAppliedBy: 'Category'
                        }
                    }
                );
            }else{
                await Products.updateOne(
                    {
                        _id: pdt._id,
                        offer: { $exists: false }
                    },
                    {
                        $set:{
                            offerPrice,
                            offerType: 'Offers',
                            offer: offerId,
                            offerAppliedBy: 'Category'
                        }
                    }
                );
            }

        }

        res.redirect('/admin/categories')

    } catch (error) {
        next(error)
    }

    
}


const removeCategoryOffer = async(req, res, next) => {
    try {
        const { catId } = req.params

        await Categories.findByIdAndUpdate(
            {_id:catId},
            {
                $unset: {
                    offer:''
                }
            }
        );

        //Unsetting every prodects that matches catId
        await Products.updateMany(
            {
                category: catId,
                offerAppliedBy: 'Category'
            },
            {
                $unset:{
                    offer:'',
                    offerType: '',
                    offerPrice:'',
                    offerAppliedBy:''
                }
            }
        );
        
        res.redirect('/admin/categories')

    } catch (error) {
        next(error)
    }
}





module.exports = {
    loadCategories,
    addCategory,
    editCategory,
    listCategory,

    applyCategoryOffer,
    removeCategoryOffer
}