const express = require('express');

const accountRouter=express.Router();

accountRouter.get('/*',(req,res)=>{
    res.render(`pages/app`);
});

// accountRouter.get('/home',(req,res)=>{
//     res.render(`pages/profile`);
// });

// accountRouter.get('/practice-management',(req,res)=>{
//     res.render(`pages/practice-management`);
// });

// accountRouter.get('/subscription-management',(req,res)=>{
//     res.render(`pages/subscription-management`);
// });

// accountRouter.get('/payment-management',(req,res)=>{
//     res.render(`pages/payment-management`);
// });

// accountRouter.get('/appointments',(req,res)=>{
//     res.render(`pages/appointments`);
// });

// accountRouter.get('/edit/:edititem',(req,res)=>{

//     //let itemname = req.params.edititem.toLowerCase(); 

//     // app.render(`partials/editForms/${itemname}`,app.locals,function(err, html){
//     //     //console.log(err);
//     //     if(err) res.status('404').send('layout not found');
//     //     res.status(200).send(html);
//     // });

// });

module.exports=accountRouter;
