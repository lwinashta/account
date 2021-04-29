const path=require('path');
const express = require('express');
const session=require('express-session');

const formidable = require('express-formidable');

const _token=require('../efs/accountManager/lib/auth/token/utils'); 

const googleRouter=require('../efs/google/router');
const awsRouter=require('../efs/aws/router');
const pokitdotRouter=require('../efs/pokitdot/router');
const appointmentRouter=require('../efs/appointments/router');
const accountManagementRoutes=require('../efs/accountManager/routes');
const accountRouter=require('./router');
const paymentRouter=require('../efs/payment/router');
// const reviewRouter=require('../efs/reviews/router');
const fileRouter=require('../efs/fileManagement/router');

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
        
        try {
            //check if cookie exists 
            if(req.headers.cookie.length===0) throw 'no_cookie_set';

            //get userToken from cookie
            let tokenFromCookie=_token.getTokenFromCookie(req);

            //Get user information from the token 
            let userInfo={};

            //check if app.local variable is set for the user verification 
            //console.log(req.session.userTokenVerified);
            if(req.session.userTokenVerified===undefined){
                userInfo=await _token.verifyToken(tokenFromCookie);//checks if user token is set
                
                req.session.userTokenVerified=true;
                req.session.userInfo=userInfo;
            }

            next();
            
        } catch (error) {
            //console.log(error);
            let param=encodeURIComponent(`${req.headers.host}${req.path}`);
            res.redirect(`${req.protocol}://${domains[config.host][config.env].web}/login?goto=${app.locals.domainPath}`);
        }
        
    });

    app.locals.config=config;

    const healthcareRoutes = require(efsPath + '/healthcare/routes')(app);

    /** Routers */
    app.use('/google',googleRouter);
    app.use('/aws',awsRouter);
    app.use('/pokitdot',pokitdotRouter);
    app.use('/appointments',appointmentRouter);
    app.use('/payment',paymentRouter);
    //app.use('/review',reviewRouter);
    app.use('/file',fileRouter);
    app.use('/account/api',accountManagementRoutes);
    app.use('/',accountRouter);

}