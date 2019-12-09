//** IMPORT DEPENDENCIES 
const process=require("process");
const formidable = require('express-formidable');
const globalSettings=require("../global-modules/sys-settings/config/config.json");
const express = require('express');
const iAccount=require('@oi/account');
//const parser=require('body-parser');

//*** INTIALIZATIONS  */
const account=new iAccount();
const app = express();
const port=8081;
const os=process.platform;
const globalFsPath=globalSettings.globalFs[os];

//** LOCAL ASSIGNEMENTS */
app.locals.sysSettings=globalSettings;
app.locals.globalFsPath=globalFsPath;

//** ASSIGN MIDDLEWARES */
app.use('/src',express.static('src'));
app.use('/gfs',express.static(globalFsPath));
app.use('/node_modules',express.static('node_modules'));
app.use(formidable());
// app.use(session({secret:'secretkey',saveUninitialized:true,resave:true,cookie:{maxAge:60000,domain:'locahost'}}));

//** SET ENGINES */
app.set('view engine', 'ejs');

//** SET ROUTES */
const globalRoutes=require(globalFsPath+'/routes')(app);
const paymentRoutes=require(globalFsPath+'/payment/routes')(app);

//** MIDDLEWARE USER LOGIN */
app.use('/',async function(req,res,next){
    app.locals.userInfo=await account.getUserFromToken(req,res);//checks if user token is set 
    console.log(app.locals.userInfo);
    if(Object.keys(app.locals.userInfo).length===0){
        let param=encodeURIComponent(`${req.headers.host}${req.path}`);
        res.redirect(`${globalSettings.website}/login?goto=${param}`);
    } else{
        next();//got to next if user is already logged
    }
});

app.get('/',(req,res)=>{
    res.render('pages/summary');
});

app.listen(port,console.log("listening port "+port));