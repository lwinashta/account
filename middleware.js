const path=require('path');
const express = require('express');
const session=require('express-session');

const formidable = require('express-formidable');

const googleRouter=require('../efs/google/router');
const awsRouter=require('../efs/aws/router');
const pokitdotRouter=require('../efs/pokitdot/router');
const appointmentRouter=require('../efs/appointments/router');
const accountRouter=require('./router');
const paymentRouter=require('../efs/payment/router');
const reviewRouter=require('../efs/reviews/router');
const globalRouter=require('../efs/router/global');

const userToken=require('../efs/accountManager/lib/token'); 

const config = require("../efs/core/config/config.json");
const domains = config.domains;
const efsPaths=config.efsPaths;

const os = process.platform;
const efsPath = efsPaths[os];

module.exports = function (app) {

    //** SET ENGINES */
    app.set('view engine', 'ejs');   

    //** ASSIGN MIDDLEWARES */
    app.use('/src',express.static('src'));
    app.use('/efs',express.static(efsPath));
    app.use('/node_modules',express.static('node_modules'));

    // const fsPath = `../efs/filesystem`;
    // app.use(`/fs`, express.static(path.join(fsPath)));

    app.use(formidable());

    //app.use(session({secret:'secretkey',saveUninitialized:true,resave:true,cookie:{maxAge:60000,domain:'locahost'}}));
    app.use(session({ secret: 'secretkey', saveUninitialized: true, resave: true }));

    //** MIDDLEWARE USER LOGIN CHECK */
    
    app.use('/',async function(req,res,next){
        
        app.locals.domainPath=encodeURIComponent(`${req.protocol}://${req.headers.host}${req.originalUrl}`);

        try {

            app.locals.userInfo=await userToken.verifyToken(req,res);//checks if user token is set
            
            if(typeof app.locals.userInfo==="undefined" || Object.keys(app.locals.userInfo).length===0){
                throw "not-logged-in";
            }

            //check if the account is verified. 
            //If account is not verified send user to verification screen 
            if(!('verified' in app.locals.userInfo) || !app.locals.userInfo.verified){
                throw "account-not-verified";
            }

            //set user profile image - for quick profile image for ejs pages 
            if('files' in app.locals.userInfo && app.locals.userInfo.files.length>0  
                && app.locals.userInfo.files.filter(f=>f.field_name==="personal_profile_image").length>0){
                let profilePics=app.locals.userInfo.files.filter(f=>f.field_name==="personal_profile_image");
                app.locals.userInfo.profile_pic='/g/fs/'+profilePics.pop()._id;
            }

            next();
            
        } catch (error) {
            console.log(error);

            //--- if the error is account-not-verified then navigate to otp verificatin page 
            if(error==='account-not-verified'){
                res.redirect(`${req.protocol}://${domains[config.host][config.env].web}/otp-verification/${app.locals.user_info.verification_number}`);
            
            }else{
                let param=encodeURIComponent(`${req.headers.host}${req.path}`);
                res.redirect(`${req.protocol}://${domains[config.host][config.env].web}/login?goto=${app.locals.domainPath}`);
            }
        }
        
    });

    app.locals.config=config;

    const accountManagementRoutes=require(efsPath+'/accountManager/routes')(app);
    const healthcareRoutes = require(efsPath + '/healthcare/routes')(app);

    /** Routers */
    app.use('/google',googleRouter);
    app.use('/aws',awsRouter);
    app.use('/pokitdot',pokitdotRouter);
    app.use('/appointments',appointmentRouter);
    app.use('/payment',paymentRouter);
    app.use('/review',reviewRouter);
    app.use('/g',globalRouter);
    app.use('/',accountRouter);

}