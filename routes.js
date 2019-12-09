//const fs=require('fs');
//const path = require('path');
const cookies=require('cookies');
const cookieParser=require('cookie-parser');
const session=require("express-session");

const formidable = require('express-formidable');
const systemSettings=require("./config/config.json");

const iAccount=require('@oi/account');
const account=new iAccount();

//const parser=require('body-parser');
const express = require('express');

const app = express();
const port=8081;

app.use('/src',express.static('src'));
app.use('/node_modules',express.static('node_modules'));
app.use('/gfs',express.static(systemSettings.globalFs));

app.use(formidable());

app.set('view engine', 'ejs');

app.use('/',async function(req,res,next){
    app.locals.userInfo=await account.getUserFromToken(req,res);//checks if user token is set 
    next();//got nxt even thoug the token is not set 
});

app.get('/',(req,res)=>{
    res.render('pages/home');
});

app.locals.sysSettings=systemSettings;

app.listen(port,console.log("listening port "+port));