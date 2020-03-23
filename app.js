//** IMPORT DEPENDENCIES 
const process=require("process");
const formidable = require('express-formidable');
const express = require('express');
const path=require('path');

const userToken=require('../efs/accountManager/lib/token'); 
const countries=require('../efs/utilities/lib/lists/countries.json');
const degrees=require('../efs/utilities/lib/lists/medical-degrees.json');
const councils=require('../efs/utilities/lib/lists/medical-councils.json');
const languages=require('../efs/utilities/lib/lists/languages.json');

const specialties=require('../efs/healthcare/lib/specialties');

const config = require("../efs/core/config/config.json");
const domains = config.domains;
const efsPaths=config.efsPaths;

//const parser=require('body-parser');

//*** INTIALIZATIONS  */
// const account=new iAccount();
const app = express();
const port=8081;
const os=process.platform;
const efsPath = efsPaths[os];
const _specialties=new specialties();

//** LOCAL ASSIGNEMENTS */
//app.locals.sysSettings=globalSettings;
app.locals.efsPath=efsPath;

//** ASSIGN MIDDLEWARES */
app.use('/src',express.static('src'));
app.use('/efs',express.static(efsPath));
app.use('/node_modules',express.static('node_modules'));
app.use('/layout',express.static('views/partials'));
app.use(formidable());
// app.use(session({secret:'secretkey',saveUninitialized:true,resave:true,cookie:{maxAge:60000,domain:'locahost'}}));

//** SET ENGINES */
app.set('view engine', 'ejs');

//** SET GLOBAL ROUTES */
const googleRoutes = require(efsPath + '/google/routes')(app);
const paymentRoutes=require(efsPath+'/payment/routes')(app);
const accountRoutes=require(efsPath+'/accountManager/routes')(app);
const awsRoutes = require(efsPath + '/aws/routes')(app);

//** MIDDLEWARE USER LOGIN */
app.use('/',async function(req,res,next){

    try {
        //console.log(req);
        //-- get the user info from token ---
        app.locals.user_info=await userToken.verifyToken(req,res);//checks if user token is set
        app.locals.specialties=await _specialties.getAll();
        app.locals.countries=countries;

        if(typeof app.locals.user_info==="undefined" || Object.keys(app.locals.user_info).length===0){
            throw "not-logged-in";
        }

        //check if the account is verified. 
        //If account is not verified send user to verification screen 
        if(!('verified' in app.locals.user_info) || !app.locals.user_info.verified){
            throw "account-not-verified";
        }

        //-- get countries --   
        app.locals.user_info.country_dial_code=countries.filter(c=>c._id===app.locals.user_info.country_code)[0].dial_code;
        app.locals.user_info.specialty=app.locals.specialties.filter(s=>s._id===app.locals.user_info.specialty)[0];

        if("personal_address_country" in app.locals.user_info && app.locals.user_info.personal_address_country.length>0){
            app.locals.user_info.personal_address_country=countries.filter(c=>c._id===app.locals.user_info.personal_address_country)[0];
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
        const fsPath = `../efs/filesystem`;
        app.use('/fs',express.static(path.join(`${fsPath}/${app.locals.user_info.registration_number}`)));

        next();
        
    } catch (error) {
        console.log(error);

        //--- if the error is account-not-verified then navigate to otp verificatin page 
        if(error==='account-not-verified'){
            res.redirect(`${domains[domains.domain].web}/otp-verification/${app.locals.user_info.verification_number}`);
        
        }else{
            let param=encodeURIComponent(`${req.headers.host}${req.path}`);
            res.redirect(`${domains[domains.domain].web}/login?goto=${param}`);
        }
        
    }
    
});

app.get('/',(req,res)=>{
    res.render(`pages/summary/${app.locals.user_info.user_type}`);
});

app.get('/summary',(req,res)=>{
    res.render(`pages/summary/${app.locals.user_info.user_type}`);
});

app.get('/subscriptions',(req,res)=>{
    res.render(`pages/subscriptions/${app.locals.user_info.user_type}`);
});

app.get('/payments',(req,res)=>{
    res.render(`pages/payment`);
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

    app.render(`partials/editForms/${itemname}`,app.locals,function(err, html){
        console.log(err);
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