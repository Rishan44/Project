require('dotenv').config()
const mongoose = require('mongoose')
const crypto = require('crypto')


// const sessionSecret="mysitesessionsecret";


let mongoConnect = () => mongoose.connect(process.env.MONGO_URL,console.log('Database Connected'))
const secretKey = crypto.randomBytes(32).toString('hex')

module.exports={
    secretKey,
    mongoConnect
    // sessionSecret
}