const process = require("process");
const express = require('express');
const userToken=require('../efs/accountManager/lib/token'); 
const fs=require('fs');
const filesystem = require('../efs/utilities/lib/js/filesystem');
const path=require('path');

const config = require("../efs/core/config/config.json");
const efsPaths=config.efsPaths;
const efsPath = efsPaths[process.platform];

const fsPath = `../efs/filesystem`;

const accountRouter=express.Router();

accountRouter.get('/',(req,res)=>{
    res.render(`pages/profile`);
});

accountRouter.get('/practice-management',(req,res)=>{
    res.render(`pages/practice-management`);
});

accountRouter.get('/subscription-management',(req,res)=>{
    res.render(`pages/subscription-management`);
});

accountRouter.get('/payment-management',(req,res)=>{
    res.render(`pages/payment-management`);
});

accountRouter.get('/edit/:edititem',(req,res)=>{

    //let itemname = req.params.edititem.toLowerCase(); 

    // app.render(`partials/editForms/${itemname}`,app.locals,function(err, html){
    //     //console.log(err);
    //     if(err) res.status('404').send('layout not found');
    //     res.status(200).send(html);
    // });

});

/**
 * IMAGE Source
 */
accountRouter.get('/fs/:fileid', (req, res) => {
    //get the information about the 
    //console.log(req.params.filename);
    let fi = new filesystem();

    //Get the file information and user information 
    Promise.all([fi.getFileInfo({
        "_id.$_id": req.params.fileid
    }),userToken.verifyToken(req,res)]).then(values => {
        
        //console.log(info);
        let fileInfo=values[0];
        let userInfo=values[1];

        if(Object.keys(userInfo).length===0){
            throw new Error("unauthorized user");
        }

        if(fileInfo.length===0){
            throw new Error("file not found ");
        }

        //find the req-number
        let registration_number = userInfo.registration_number;
        let filename=fileInfo[0].file_name;

        //Serving static files using the static express path from the server
        let src = path.join(__dirname, `${fsPath}/${registration_number}/files/${filename}`);

        if (fs.existsSync(src)) {
            res.sendFile(src);
        } else {
            res.sendFile(path.join(__dirname, '../efs/core/images/core/noimage.png'));
        }

    }).catch(err => {
        console.log(err);
        res.status(404).send(err);
    });

});

module.exports=accountRouter;
