import express from 'express';
import dotenv from 'dotenv';
import http from 'http';

import config from './config.js';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';


import userRouter from './routers/userRouter.js'


const mongodbUrl = config.MONGODB_URL;

const client = mongoose.connect(mongodbUrl,{ useNewUrlParser: true, useUnifiedTopology: true })
.then( () => {
    console.log('Connected to database ');
   //loadData();
   // var products = Product.find({});
  //  console.log(products);
})
.catch( (err) => {
    console.error(`Error connecting to the database. \n${err}`);
 });


 const app = express();
 app.use(cors());

app.use(function (req, res, next) {
    //  console.log(req.originalUrl);
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Origin', 'http://localhost:3030');
    res.header("Access-Control-Allow-Origin", "https://contactclub.vercel.app");
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header("Access-Control-Allow-Methods", "GET", "PUT", "POST", "DELETE", "OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-client-key, x-client-token, x-client-secret");
    next();
  });
  app.use(bodyParser.json());
  app.get("/", (req, res) => {
    res.send("Welcome to a basic express App");
  });
  app.get("/test", (req, res) => {
    res.send("Welcome to a test express App");
  });
//     // app.use('/api/products', productRouter);
  app.use('/api/users', userRouter);
//   app.use('/api/design', designRouter);
//   app.use('/api/stock', stockRouter);
//   app.use('/api/invoice', invoiceRouter);

  // app.use('/api/orders', orderRouter);
  // app.use('/api/uploads', uploadRouter);
 
app.listen(3000,()=>{
  
    console.log("server started http://localhost:3000")
  
  });
  