const process = require("process");
const express = require('express');
const user = require('../efs/accountManager/lib/user');
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

accountRouter.get('/subscriptions',(req,res)=>{
    res.render(`pages/subscriptions/${accountRouter.locals.user_info.user_type}`);
});

accountRouter.get('/payments',(req,res)=>{
    res.render(`pages/payment`);
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
accountRouter.get('/fs/:filename', (req, res) => {
    //get the information about the 
    //console.log(req.params.filename);
    let fi = new filesystem();

    fi.getFileInfo({
        filename: req.params.filename
    }).then(info => {
        //console.log(info);

        //find the req-number
        let registration_number = info[0].destinationFolder.match(/reg-+\d+\-\d/)[0];

        //Serving static files using the static express path from the server
        let src = path.join(__dirname, `${fsPath}/${registration_number}/${req.params.filename}`);

        if (fs.existsSync(src)) {
            res.sendFile(src);
        } else {
            res.sendFile(path.join(__dirname, '../efs/core/images/core/noimage.png'));
        }

    }).catch(err => {
        console.log(err);

    });

});

module.exports=accountRouter;
