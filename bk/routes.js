//** IMPORT DEPENDENCIES */
const formidable = require('express-formidable');
const util=require('@oi/utilities');
const db=require('@oi/mongo');//../connect-to-mongodb/index

//** INITALIZATIONS */
//global modules for databse connection
var dbInstance=new db();


//** METHODS */
let accountManagement={
    me:this,
    userInfo:{},
    
    registration:{

        routes:async function(req){

            let self=this;
            let method=req.method;
            let action=req.params.action.toLowerCase();

            //api/registration/get - endpoint
            if(method==="GET" && action==='get'){
                let results = await self.get(req);
                return results;

            }else if(method==="POST" && action==='create'){
                //console.log(req.fields);
                let results=await self.create(req);
                return results;
            }
        },

        create:async function(req){

            let data=req.fields;
            let registrationNum="";

            let params={};

            return new Promise((resolve, reject) => {
                
                //first get the last id from registration table 
                dbInstance.getLastId().then(function (lastId) {
                    
                    registrationNum=`reg-${Math.floor(Math.random() * Math.floor(Date.parse(new Date())))}-${lastId}`;
                    params.registration_number=registrationNum;

                    // params.verification_number=verificationNum;
                    // params.otp=Math.floor(Math.random()*Math.floor(999999));
                    params.email_id=data.email_id;
                    params.user_type=data.user_type;
                    params.createdby="user-signup-page";
                    params.creation_datetime=new Date();
                                        
                    return dbInstance.insertOne(params);

                }).then(function(response){
                    resolve(response.ops[0]);

                }).catch(function(err){
                    reject(err);
                });
            });
        
        }
    },

    user:{
        
        routes:async function(req){

            let self=this;
            let method=req.method;
            let action=req.params.action.toLowerCase();

            //api/user/get - endpoint
            if(method==="GET" && action==='get'){
                let results = await self.get(req);
                return results;

            }else if(method==="POST" && action==='create'){
                //console.log(req.fields);
                let results=await self.create(req);
                return results;

            }else if(method==="POST" && action==='update'){
                //console.log(req.fields);
                let results=await self.update(req);
                return results;

            }else if(method==="POST" && action==='checkpassw'){
                let results=await self.checkPassw(req);
                return results;

            }else if(method==="POST" && action==='updatepassw'){
                let results=await self.updatePassword(req);
                return results;

            }
        },

        create:function(req){
            let self=this;

            let data=req.fields;
            let user_id="";

            return new Promise((resolve, reject)=>{

                dbInstance.getLastId().then(function (lastId) {

                    data.user_id = `user-${data.registration_number}-${lastId}`;

                    return util.generateCryptoString(data.registration_number);

                }).then(function (verification_number) {

                    data.verification_number=verification_number;//get verfication number
                    data.otp=Math.floor(Math.random()*Math.floor(999999));//generate otp
                    data.verified=false;
                    data.enrolled=false;

                    data.user_password = util.generateCryptoPasswString(data.user_password);

                    data.createdby="user-signup-page";
                    data.creation_datetime=new Date();

                    return dbInstance.insertOne(data);

                }).then(function(user_info){
                    resolve(user_info.ops[0]);

                }).catch(function (err) {
                    console.log(err);
                    reject(err);
                });
            });
        },

        get:function(req){

            return new Promise((resolve,reject)=>{

                let query=req.query;

                dbInstance.queryAll(query).then(function(results){
                    resolve(results);
                    
                }).catch(function(err){
                    reject(err);
                });
            });
        },

        update:function(req){
            //console.log(req);
            let fields=req.fields;
            return new Promise(async (resolve, reject) => {
                try {
                    
                    //setting the id value
                    let query={
                        "_id": accountManagement.userInfo._id
                    }

                    //check if query is there in the request and insert in the query object
                    if("query" in fields && Object.keys(fields.query).length>0){
                        Object.assign(query,fields.query);
                    }

                    let setvalues={};
                    if("setvalues" in fields && Object.keys(fields.setvalues).length>0){
                        Object.assign(setvalues,fields.setvalues);
                    }else{
                        setvalues=fields;
                    }
                    
                    console.log(query,setvalues);

                    let updateQ = await dbInstance.updateOne(query,setvalues);

                    resolve("updated");

                } catch (err) {
                    console.log(err);
                    reject(err);
                }
            });

        },   
        
        //-- check passw is correct 
        checkPassw:function(req){
            let data=req.fields;

            return new Promise((resolve,reject)=>{

                //setting the id value
                let query={
                    "_id": accountManagement.userInfo._id,
                    "password":util.generateCryptoPasswString(data.passw)
                }

                dbInstance.queryAll(query).then(function(results){
                    resolve(results);
                    
                }).catch(function(err){
                    reject(err);
                });
            });
        },

        //--- update password --- 
        updatePassword:function(req){
            //console.log(req);
            let data=req.fields;
            return new Promise(async (resolve, reject) => {
                try {
                    
                    let updateQ = await dbInstance.updateOne({
                        "_id": accountManagement.userInfo._id,
                    },{
                        "password":util.generateCryptoPasswString(data.password),
                        "modified_datetime":new Date()
                    });

                    resolve("passw updated");

                } catch (err) {
                    console.log(err);
                    reject(err);
                }
            });
        },
    }

}

exports.getUserFromToken=function(req,res,dbInstance){
    
    return new Promise((resolve, reject)=>{
            
        const cookies = new Cookies(req, res);
        let token = cookies.get("token");
        
        //check if token exists in cookie
        if (typeof token !== "undefined" && token.length > 0) {

            dbInstance.connect("check-token").then(function (client) {

                dbInstance.db = client.db("accounts");
                dbInstance.collection = "tokens";

                return dbInstance.queryAll({
                    "token": token,
                    "status": "active"
                });

            }).then(function (r1) {
                //console.log(r1);

                if (r1.length > 0) {
                    dbInstance.collection = "users";
                    return dbInstance.aggregateMatchQuery({
                        "emailid": r1[0].emailid,
                        "userid": r1[0].userid
                    },{
                        from: 'registration',
                        localField: 'registrationnum',
                        foreignField: 'registrationnum',
                        as: 'registrationinfo'
                      });

                    //return dbInstance.queryAll();
                } else {
                    throw "token not found";
                }

            }).then(function (r2) {

                let userInfo=r2[0];

                //set fullname 
                userInfo.fullname=`${userInfo.firstname} ${userInfo.lastname}`;

                let reg=/\b\w/gi;

                //convert fullname to capitalize text 
                userInfo.fullnameLowerCased=userInfo.fullname.toLowerCase();
                
                //set initals 
                userInfo.initials=userInfo.fullname.match(reg);

                if(userInfo.initials!==null){
                    userInfo.initials=userInfo.initials.join("");
                }

                //-- check if the standard account has been expired 
                let registrationinfo=userInfo.registrationinfo[0];
                if(registrationinfo.registrationtype==="oi_standard_free"){
                    let cd=moment(registrationinfo.creation_datetime).add(1, 'months');
                    let td=moment();

                    userInfo.registrationinfo[0].expired=cd.isBefore(td);
                    userInfo.registrationinfo[0].expirationDate=cd.format('DD MMM YYYY');

                }

                resolve(userInfo);

            }).finally(function () {
                resolve({});
                
            }).catch(function(err){
                console.log(err);
                reject(err);
            });

        } else {
            resolve({});
        }
    });
}

//*** ROUTES ***/
module.exports=function(app){

    app.all('/account/api/:db/:action',(req,res)=>{

        let params=req.params;
        let db=params.db.toLowerCase();

        accountManagement.userInfo=app.locals.userInfo;
        
        //console.log(req);
        switch (db){
            case 'registration':

                //checks the connection is already established.
                dbInstance.connect("registration").then(function(client){
                    
                    dbInstance.db=client.db("accounts");
                    dbInstance.collection="registration";

                    return accountManagement.registration.routes(req);

                }).then(function(results){
                    res.status(200);
                    res.send(results);

                }).catch(function(err){
                    console.error(`${err}`);
                    console.error(req);
                    res.status(500).send(`server connection error ${JSON.stringify(req)}`);
                });
            break;

            case 'user':
                


                dbInstance.connect("users").then(function(client){
                    
                    dbInstance.db=client.db("accounts");
                    dbInstance.collection="users";

                    return accountManagement.user.routes(req);

                }).then(function(results){
                    res.send(results);

                }).catch(function(err){
                    console.error(`${err}`);
                    console.error(req);
                    res.status(500).send(`server connection error}`);
                });

            break;
        }
    });
}