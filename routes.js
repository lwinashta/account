//const fs=require('fs');
//const path = require('path');
const cookies=require('cookies');
const cookieParser=require('cookie-parser');
const session=require("express-session");

const formidable = require('express-formidable');

//const parser=require('body-parser');
const express = require('express');

const app = express();
const port=8081;

app.use('/src',express.static('src'));
app.use('/node_modules',express.static('node_modules'));
app.use(formidable());

app.set('view engine', 'ejs');

app.get('/',(req,res)=>{
    res.render('pages/home');
});

app.listen(port,console.log("listening port "+port));