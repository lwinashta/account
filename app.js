//** IMPORT DEPENDENCIES 
const process=require("process");
const formidable = require('express-formidable');
const globalSettings=require("../global-modules/sys-settings/config/config.json");
const express = require('express');
const userToken=require('@oi/account/lib/token'); 
const path=require('path');

const countries=require('@oi/utilities/lib/lists/countries.json');
const specialties=require('@oi/utilities/lib/lists/medical-specialties.json');
const degrees=require('@oi/utilities/lib/lists/medical-degrees.json');
const councils=require('@oi/utilities/lib/lists/medical-councils.json');
const languages=require('@oi/utilities/lib/lists/languages.json');

//const parser=require('body-parser');

//*** INTIALIZATIONS  */
// const account=new iAccount();
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

//** SET GLOBAL ROUTES */
const globalRoutes=require(globalFsPath+'/routes')(app);
const googleRoutes = require(globalFsPath + '/google-services/routes')(app);
const paymentRoutes=require(globalFsPath+'/payment/routes')(app);
const accountRoutes=require(globalFsPath+'/account/routes')(app);
const awsRoutes = require(globalFsPath + '/aws/routes')(app);

//** MIDDLEWARE USER LOGIN */
app.use('/',async function(req,res,next){

    try {
        //console.log(req);
        //-- get the user info from token ---
        app.locals.user_info=await userToken.verifyToken(req,res);//checks if user token is set

        if(typeof app.locals.user_info==="undefined" || Object.keys(app.locals.user_info).length===0){
            throw "no user logged in";
        }

        //check if the account is verified. 
        //If account is not verified send user to verification screen 
        if(!('verified' in app.locals.user_info) || !app.locals.user_info.verified){
            res.redirect(`${globalSettings.website}/otp-verification/${app.locals.user_info.verification_number}`);
        }

        //-- get countries --   
        app.locals.user_info.country_dial_code=countries.filter(c=>c._id===app.locals.user_info.country_code)[0].dial_code;
        app.locals.user_info.specialty=specialties.filter(s=>s._id===app.locals.user_info.specialty)[0];

        if("personal_address_country" in app.locals.user_info){
            app.locals.user_info.personal_address_country=countries.filter(c=>c._id===app.locals.user_info.personal_address_country)[0]
        }
        
        if("medical_degree" in app.locals.user_info && app.locals.user_info.medical_degree.length>0){
            app.locals.user_info.medical_degree=app.locals.user_info.medical_degree.map(d=>{
                return degrees.filter(deg=>deg._id===d)[0];
            });
        }

        if("medical_registration_council" in app.locals.user_info && app.locals.user_info.medical_registration_council.length>0){
            app.locals.user_info.medical_registration_council=app.locals.user_info.medical_registration_council.map(c=>{
                return councils.filter(council=>council._id===c)[0];
            });
        }

        if("known_languages" in app.locals.user_info && app.locals.user_info.known_languages.length>0){
            app.locals.user_info.known_languages=app.locals.user_info.known_languages.map(c=>{
                return languages.filter(lng=>lng._id===c)[0];
            });
        }

        process.env["user_info"]=JSON.stringify(app.locals.user_info);

        //Serving static files using the static express path from the server
        app.use('/fs',express.static(path.join(`../filesystem/${app.locals.user_info.registration_number}`)));

        next();
        
    } catch (error) {
        console.log(error);

        let param=encodeURIComponent(`${req.headers.host}${req.path}`);
        res.redirect(`${globalSettings.website}/login?goto=${param}`);
    }
    

});

app.get('/',(req,res)=>{
    res.render(`pages/summary/${app.locals.user_info.user_type}`);
});

app.get('/summary',(req,res)=>{
    res.render(`pages/summary/${app.locals.user_info.user_type}`);
});

app.get('/practices',(req,res)=>{
    res.render(`pages/practices`);
});

app.get('/enroll/:accounttype/:accountid',(req,res)=>{

    let accounttype = req.params.accounttype.toLowerCase(); 
    let accountid = req.params.accountid.toLowerCase(); 

    switch (accounttype) {
        case 'healthcare_provider':
            //get the provider information using the account id
            res.render(`pages/enrollment/healthcare-provider`);
            break;
        
        case 'healthcare_facility':
                break;
        default:
            break;
    }
});

app.get('/edit/:edititem',(req,res)=>{

    let itemname = req.params.edititem.toLowerCase(); 

    app.locals.countries=countries;
    app.locals.specialties=specialties;

    app.render(`partials/editForms/${itemname}`,app.locals,function(err, html){
        if(err) res.status('404').send('layout not found');
        res.status(200).send(html);
    });

});

app.listen(port,console.log("listening port "+port));


// app.get('/',(req,res)=>{
//     res.render('pages/qualification');
// });

// app.get('/profile',(req,res)=>{
//     res.render('pages/profile');
// });

// app.get('/payment',(req,res)=>{
//     res.render('pages/payment');
// });

// app.get('/reset-passw',(req,res)=>{
//     res.render('pages/reset-passw');
// });