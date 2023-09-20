const User = require('../models/userModel')
const Products = require('../models/productModel')
const Addresses = require('../models/addressModel')
const Orders = require('../models/orderModel')
const { request } = require('express')

require('dotenv').config()


const loadCheckout = async(req,res,next)=>{
    try {
        const userId = req.session.userId
        const userAddress = await Addresses.findOne({userId:userId})
        const userData = await User.findOne({_id: userId}).populate('cart.productId')
        const cart = userData.cart

        if(!cart){
            return redirect('/shoppingCart')
        }

        

        res.render('checkout',{isLoggedIn : true,page:'Checkout',userId,userAddress,cart})
    } catch (error) {
        next(error)
    }
} 



const placeOrder = async(req,res,next)=>{
    try {

        //getting details needed
        const addressId = req.body.address
        const paymentMethod  = req.body.payment
        const userId = req.session.userId
        // console.log(addressId+'add');
        // console.log(paymentMethod+'pm');
        
        //getting selected address
        const userAddress = await Addresses.findOne({userId})
        const address = userAddress.addresses.find(obj => obj._id.toString() === addressId)
        req.session.deliveryAddress = address
        
        // console.log(req.session.deliveryAddress+'ua');
        //getting cart Items
        const userData = await User.findOne({_id:userId}).populate('cart.productId');
        const cart = userData.cart

        req.session.cart = cart;

        let products = []

        cart.forEach((pdt)=>{
            const product = {
                productId : pdt.productId._id,
                productName : pdt.productId.name,
                productPrice : pdt.productPrice,
                quantity : pdt.quantity,
                totalPrice: pdt.quantity*pdt.productId.price,
                status:'Order Confirmed'
            }
            products.push(product)
        })
        let totalPrice = 0;
        for(let i=0;i<products.length;i++){
            totalPrice += products[i].totalPrice
        }

        req.session.products = products
        if(paymentMethod === 'COD'){

            await new Orders({
                userId,
                deliveryAddress:address,
                totalPrice,
                products,
                paymentMethod,
                status:'Order Confirmed'
            }).save()
        }


        //Reducing quantity/stock of purchased products from products collection
        for(const{productId,quantity}of cart){
            await Products.updateOne(
                { _id:productId._id },
                { $inc: {quantity: -quantity} }
            );
        }


        //Deleting Cart from user collection
        await User.findByIdAndUpdate(
            { _id:userId},
            {
                $set:{
                    cart:[]
                }
            }
        )
        req.session.cartCount = 0;
        res.json({status : 'COD'})

    } catch (error) {
        next(error)
    }
}

const orderSuccess = async(req,res,next)=>{
    try{
        const result = req.query.result;
        const isLoggedIn = Boolean(req.session.userId)
        req.session.cartCount=0
        res.render('orderSuccess',{isLoggedIn,result})
    } catch(error){
        next(error)
    }
}

const loadMyOrders = async(req,res,next)=>{
    try {
        const userId = req.session.userId;
        const orderData = await Orders.find({userId}).populate('products.productId').sort({createdAt: -1})
        res.render('myOrders',{isLoggedIn:true,page:'My Orders', parentPage:'Profile',orderData})
    } catch (error) {
        next(error)
    }
}

const loadViewOrderDetails = async(req,res,next)=>{
    try {
        const orderId = req.params.orderId
        const userId = req.session.userId

        const orderData = await Orders.findById({_id:orderId}).populate('products.productId')
        console.log('Data==='+orderData);

        let status ;
        switch(orderData.status){
            case 'Order Confirmed':
                status = 1
                break;
            case 'Shipped':
                status = 2
                break;
            case 'Out of Delivery':
                status = 3
                break;
            case 'Delivered':
                status = 4
                break;
            case 'Cancelled':
                status = 5
                break;
            case 'Cancelled By Admin':
                status = 6
                break;
            case 'Pending Return Approval':
                status = 7
                break;
            case 'Returned':
                status = 8
                break;

        }

        res.render('orderDetails',{isLoggedIn:true,page:'Order Details',parentPage:'My Orders',status,orderData})

    } catch (error) {
        next(error)   
    }
}


const loadOrdersList = async(req,res,next)=>{
    try {
       
        let pageNum = 1;
        if(req.query.pageNum){
            pageNum = parseInt(req.query.pageNum)
        }

        let limit = 10;
        if(req.query.limit){
            limit = parseInt(req.query.limit)
        }

        const totalOrderCount = await Orders.find({}).count()
        let pageCount = Math.ceil( totalOrderCount / limit)

        const ordersData = await Orders.find({}).populate('userId').populate('products.productId').sort({createdAt: -1}).skip((pageNum -1 )*limit).limit(limit)

        res.render('ordersList',{ordersData,page:'Orders List',pageCount,pageNum, limit})
    } catch (error) {
        next(error)
    }
}

const changeOrderStatus = async(req,res,next)=>{
    try {
        const orderId = req.body.orderId
        const status = req.body.status
        const orderData = await Orders.findById({_id:orderId})
        for (const pdt of orderData.products){

            if(pdt.status !== 'Delivered' &&
            pdt.status !== 'Pending Return Approval' &&
            pdt.status !== 'Cancelled' &&
            pdt.status !== 'Cancelled By Admin' &&
            pdt.status !== 'Returned' 
            ){
                pdt.status = status
            }
        }
        console.log('orderData saving');
        await orderData.save();
        await updateOrderStatus(orderId, next);

        res.redirect('/admin/ordersList')

    } catch (error) {
        next(error)
    }
}


const cancelOrder = async(req,res, next) => {
    try {
        const orderId = req.params.orderId
        const cancelledBy = req.query.cancelledBy
        const orderData = await Orders.findById({_id:orderId})
        const userId = orderData.userId


        // console.log(cancelledBy);
        let refundAmount = 0;
        if(cancelledBy == 'user'){

            for (const pdt of orderData.products){

                if(pdt.status !== 'Delivered' && 
                    pdt.status !== 'Pending Return Approval' &&
                    pdt.status !== 'Cancelled' && 
                    pdt.status !== 'Cancelled By Admin' && 
                    pdt.status !== 'Returned'
                ){
                    pdt.status = 'Cancelled'
                    refundAmount = refundAmount + pdt.totalPrice

                    //Incrementing Product Stock
                    await Products.findByIdAndUpdate(
                        {_id: pdt.productId},
                        {
                            $inc:{
                                quantity: pdt.quantity
                            }
                        }
                    );

                    console.log('pdt.status set to Cancelled');
                }

            };

            await orderData.save();
            await updateOrderStatus(orderId, next);


        }else if(cancelledBy == 'admin'){

            for (const pdt of orderData.products){

                if(pdt.status !== 'Delivered' && 
                    pdt.status !== 'Pending Return Approval' &&
                    pdt.status !== 'Cancelled' && 
                    pdt.status !== 'Cancelled By Admin' && 
                    pdt.status !== 'Returned'
                ){
                    pdt.status = 'Cancelled By Admin'
                    refundAmount = refundAmount + pdt.totalPrice

                    //Incrementing Product Stock
                    await Products.findByIdAndUpdate(
                        {_id: pdt.productId},
                        {
                            $inc:{
                                quantity: pdt.quantity
                            }
                        }
                    );

                }

            };

        }

        await orderData.save();
        await updateOrderStatus(orderId, next);

        //Updating wallet if order not COD
        if(orderData.paymentMethod !== 'COD'){
            await updateWallet(userId, refundAmount, 'Refund of Order Cancellation' )
        }

        if(cancelledBy == 'user'){
            res.redirect(`/viewOrderDetails/${orderId}`)
        }else if(cancelledBy == 'admin'){
            res.redirect('/admin/ordersList')
        }

    } catch (error) {
                next(error);
    }
}


const cancelSinglePdt = async(req, res, next) => {
    try {
        const { orderId, pdtId } = req.params
        const { cancelledBy } = req.query
        const orderData = await Orders.findById({_id: orderId})
        const userId = orderData.userId
        
        let refundAmount;
        for( const pdt of orderData.products){

            if(pdt._id == pdtId){

                if(cancelledBy == 'admin'){
                    pdt.status = 'Cancelled By Admin'
                }else if(cancelledBy == 'user'){
                    pdt.status = 'Cancelled'
                }
                
                refundAmount = pdt.totalPrice

                //Incrementing Product Stock
                await Products.findByIdAndUpdate(
                    {_id: pdt.productId},
                    {
                        $inc:{
                            quantity: pdt.quantity
                        }
                    }
                );

                break;
            }
        }

        await orderData.save()
        await updateOrderStatus(orderId, next);
        // await updateWallet(userId, refundAmount, 'Refund of Order Cancellation')

        if(cancelledBy == 'admin'){
            res.redirect(`/admin/ordersList`)
        }else if(cancelledBy == 'user'){
            res.redirect(`/viewOrderDetails/${orderId}`)

        }

    } catch (error) {
        next(error)
    }
}

const updateOrderStatus = async(orderId,next)=>{
    try {
        

        let statusCounts = []
        const orderData = await Orders.findById({_id:orderId})
        orderData.products.forEach((pdt) => {
            let eachStatusCount = {
                status: pdt.status,
                count: 1,
            };

            let existingStatusIndex = statusCounts.findIndex(
                (item) => item.status === pdt.status
            )
            if(existingStatusIndex !== -1){
                statusCounts[existingStatusIndex].count += 1;
            } else{
                statusCounts.push(eachStatusCount)
            }
        })

        if(statusCounts.length ===1){
            orderData.status = statusCounts[0].status
            await orderData.save()
            return
        }

        let isOrderConfirmedExists = false;
            let isShippedExists = false;
            let isOutForDeliveryExists = false;
            let isDeliveredExists = false;
            let cancelledByUserCount; 
            let cancelledByAdminCount;
            let returnApprovalCount;
            let returnedCount;
            statusCounts.forEach((item) => {

                if(item.status === 'Order Confimed'){
                    isOrderConfirmedExists = true
                }

                if(item.status === 'Shipped'){
                    isShippedExists = true
                }

                if(item.status === 'Out For Delivery'){
                    isOutForDeliveryExists = true
                }

                if(item.status === 'Delivered'){
                    isDeliveredExists = true
                }

                if(item.status === 'Cancelled'){
                    cancelledByUserCount = item.count
                }

                if(item.status === 'Cancelled By Admin'){
                    cancelledByAdminCount = item.count
                }

                if(item.status === 'Pending Return Approval'){
                    returnApprovalCount = item.count
                }

                if(item.status === 'Returned'){
                    returnedCount = item.count
                }
                
            });


            if(isOrderConfirmedExists){
                orderData.status = 'Order Confirmed'
                await orderData.save()
                return
            }
            
            if(isShippedExists){
                orderData.status = 'Shipped'
                await orderData.save()
                return
            }
    
            if(isOutForDeliveryExists){
                orderData.status = 'Out For Delivery'
                await orderData.save()
                return
            }
    
    
            if(isDeliveredExists){
                orderData.status = 'Delivered'
                await orderData.save()
                return
            }

            let cancelledCount = 0;
            if(cancelledByUserCount){
                cancelledCount += cancelledByUserCount
            }
            if(cancelledByAdminCount){
                cancelledCount += cancelledByAdminCount
            }

            if(cancelledByUserCount === orderData.products.length || cancelledCount === orderData.products.length){
                orderData.status = 'Cancelled'
                await orderData.save()
                return;
            }
            
            if(cancelledByAdminCount === orderData.products.length){
                orderData.status = 'Cancelled By Admin'
                await orderData.save()
                return;
            }

            if( cancelledCount + returnApprovalCount + returnedCount === orderData.products.length){
                orderData.status = 'Pending Return Approval'
                await orderData.save()
                return;
            }
    
            if( cancelledCount + returnedCount === orderData.products.length){
                orderData.status = 'Returned'
                await orderData.save()
                return;
            }
    } catch (error) {
        next(error)
    }
}

module.exports = {
    loadCheckout,
    placeOrder,
    orderSuccess,
    loadMyOrders,
    loadViewOrderDetails,
    loadOrdersList ,
    changeOrderStatus,
    cancelOrder,
    cancelSinglePdt
    


}