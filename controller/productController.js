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
        console.log(error);
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

        let page = 1 
        if(req.query.page){
            page = req.query.page
        }

        let limit = 9;

        let minPrice = 1;
        let maxPrice = Number.MAX_VALUE;

        if(req.query.minPrice && parseInt(req.query.minPrice)){
            minPrice = parseInt(req.query.minPrice)
        }
        if(req.query.maxPrice && parseInt(req.query.maxPrice)){
            maxPrice = parseInt(req.query.maxPrice)
        }

        let search = ''
        if(req.query.search){
            search = req.query.search
        }

        //finding all categories that matches the search query
        async function getCategoryIds(search){
            const categories = await Categories.find(
                {
                    name:{
                        $regex: '.*' +search+'.*',
                        $options:'i'
                    }
                }
            )
            return categories.map(category => category._id)
        }

        //Declaring a common query object to find products
        const  query = {
            isListed:true,
            $or:[
                {
                    name:{
                        $regex: '.*' +search+ '.*',
                        $options: 'i'
                    }
                },
                {
                    brand:{
                        $regex: '.*' +search + '.*',
                        $options:'i'
                    }
                }
            ],
            price:{
                $gte:minPrice,
                $lte:maxPrice
            }
        }

        if(req.query.search){
            search = req.query.search;
            query.$or.push({
                'category' : {
                    $in: await getCategoryIds(search)
                }
            });
        };

        //add category to query to filter based on category
        if(req.query.category){
            query.category = req.query.category
        };

        //add category to query to filter based on brand
        if(req.query.brand){
            query.brand = req.query.brand
        };

        let sortValue = 1;
        if(req.query.sortValue){
            sortValue = req.query.sortValue;
        }

        let productData;
        if(sortValue == 1){
            productData = await Products.find(query).populate('category').sort({createdAt:-1}).limit(limit*1).skip((page - 1)*limit);

        }else{
            productData = await Products.find(query).populate('category');

            productData = productData.slice((page - 1)*limit,page *limit);
        }

        const categoryNames = await Categories.find({});
        const brands = await Products.aggregate([{
            $group:{
                _id :'$brand'
            }
        }]);

        let totalProductsCount = await Products.find(query).count()
        let pageCount = Math.ceil(totalProductsCount / limit);

        let removeFilter  ='false'
        if(req.query && !req.query.page){
            removeFilter  ='true'
        };


        // productData = await Products.find({}).populate('category')
        

        let userData;
        let wishlist;
        let cart;

        if(req.session.userId){
            userData = await User.findById({_id:req.session.userId})
            wishlist = userData.wishlist
            cart = userData.cart.map(item => item.productId.toString())
        }

        res.render('shop',{
            productData,
            userId:req.session.userId,
            isLoggedIn,
            page:'Shop',
            wishlist,
            cart,
            categoryNames,
            brands,
            pageCount,
            currentPage:page,
            sortValue,
            category:req.query.category,
            minPrice:req.query.minPrice,
            maxPrice:req.query.maxPrice,
            brand:req.query.brand,
            search:req.query.search,
            removeFilter
        })
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

        let isPdtExistInCart = false;

        if(userId){
            const userData= await User.findById({_id:userId})
            
            userData.cart.forEach((pdt) =>{
                if(pdt.productId == id){
                    isPdtExistInCart = true
                }
            })

        }
        res.render('productOverview1',{pdtData, parentPage:'Shop',page:'Product Overview',isLoggedIn,isPdtExistInCart})
    } catch (error) {
        console.log(error.message);
    }
}

const deleteImage = async(req,res, next) => {
    try {
        const id = req.params.id;
        const imageURL = req.query.imageURL;

        await Products.findOneAndUpdate( { _id: id }, {$pull:{ images : imageURL }})


        console.log('imageURL :  '+imageURL+'type :'+typeof imageURL);

        const imgFolder = path.join(__dirname,'../public/assets/images/product')

        const files = fs.readdirSync(imgFolder);

        for (const file of files) {

            if(file === imageURL){
                const filePath = path.join(imgFolder, file);
                fs.unlinkSync(filePath);
                break;
            }
        }
        
        res.redirect(`/admin/products/editProduct/${id}`);

    } catch (error) {
                next(error);
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
    deleteImage,
    loadProductOverview
}