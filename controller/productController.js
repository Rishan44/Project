const Products = require('../models/productModel')
const User = require('../models/userModel')
const Categories = require('../models/categoryModel')
const fs = require('fs')
const path = require('path')

const loadProducts = async(req,res,next)=>{
    try {
        const productData = await Products.find().populate("category")

        res.render('products',{productData,page:'Products'})
    } catch (error) {
        next(error)
    }
}

const loadAddProduct = async(req,res,next)=>{
    try {
        const categories = await Categories.find({})
        res.render('addProduct',{categories,page:'AddProducts'})
    } catch (error) {
        next(error)
    }
}

const addProductDetails = async(req,res,next)=>{
    try {
        const {
            brand, productName,category, check1,check2,
            check3,check4,check5,check6, quantity, price,
            dprice,description
        } = req.body

        // console.log(req.body);

        // console.log(req.files);

        let images =[]
        for(let file of req.files){
            images.push(file.filename)
        }

        let size = []
        if(check1) size.push(check1)
        if(check2) size.push(check2)
        if(check3) size.push(check3)
        if(check4) size.push(check4)
        if(check5) size.push(check5)
        if(check6) size.push(check6)

        const catData = await Categories.find({name:category})
        console.log("category : "+category);
        console.log("catData : "+catData);
        const prodData =await new Products({
            brand, name:productName, description, category:catData[0]._id,
            size,price,discountPrice:dprice, quantity , images,
        }).save();

        res.redirect('/admin/products')

    } catch (error) {
        next(error)
    }
}

const loadEditProduct = async(req,res)=>{
    try {
        const id = req.params.id;
        const pdtData = await Products.findById({_id:id}).populate('category')
        const catData = await Categories.find({})

        res.render('editproduct',{pdtData, catData, page:'Products'})
    } catch (error) {
        next(error)
    }
}

const deleteProduct = async(req,res) => {
    try {
        const id = req.params.id;
        const prodData = await Products.findById({_id:id})
        prodData.isListed = !prodData.isListed
        prodData.save()
        
        res.redirect('/admin/products');
    } catch (error) {
                next(error);
    }
}

const postEditProduct = async(req,res) => {
    try {
        const { 
            id, productName, category,
            check1, check2, check3, check4, check5, check6,
            quantity, price, dprice, description,
        } = req.body

        const brand = req.body.brand.toUpperCase()

        let sizes = []
        if(check1) sizes.push(check1)
        if(check2) sizes.push(check2)
        if(check3) sizes.push(check3)
        if(check4) sizes.push(check4)
        if(check5) sizes.push(check5)
        if(check6) sizes.push(check6)

        if (req.files) {
            let newImages = []
            for (let file of req.files) {
                newImages.push(file.filename)
            }
            console.log('id : '+id);
            await Products.findOneAndUpdate({ _id: id }, { $push: { images: { $each: newImages } } })
        }

        console.log('category : '+category);
        const catData = await Categories.findOne({ name: category })
        console.log(catData);
        await Products.findByIdAndUpdate(
            { _id: id },
            {
                $set:{
                    brand, name:productName, category:catData._id, sizes, quantity,
                    description, price, discountPrice: dprice
                }
            }
        )

        res.redirect('/admin/products')

    } catch (error) {
                next(error);
    }
}

const loadShop = async(req,res)=>{
    try {
        
        const isLoggedIn = Boolean(req.session.userId);

        productData = await Products.find({}).populate('category')
        res.render('shop',{productData,isLoggedIn,page:'Shop'})
    } catch (error) {
       console.log(error.message); 
    }
}

const loadProductOverview = async(req,res,next)=>{
    try {
        const id = req.params.id;
        const userId = req.session.userId
        const isLoggedIn = Boolean(userId)
        const pdtData = await Products.findById({_id:id})


        // if(userId){
        //     const userData= await User.findById({_id:userId})
            
        //     userData.cart.forEach((pdt) =>{
        //         if(pdt.productId == id){
        //             isPdtExistInCart = true
        //         }
        //     })

        // }
        res.render('productOverview',{pdtData, parentPage:'Shop',page:'Product Overview',isLoggedIn})
    } catch (error) {
        console.log(error.message);
    }
}

module.exports ={
    loadProducts,
    loadAddProduct,
    addProductDetails,
    loadEditProduct,
    deleteProduct,
    postEditProduct,
    loadShop,
    loadProductOverview
}