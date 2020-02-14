import {
    runtime
} from "./base.js";

const getUserPractices=function(){

    return $.ajax({
        "url":'/account/api/practice/getbyuser',
        "processData": true,
        "contentType": "application/json; charset=utf-8",
        "data":{"user_mongo_id":runtime.userInfo._id},
        "method":"GET"
    });
}

const setUserPracticeRow=function(info){

};

//INITIAL DATA LOAD 
async function dataLoad() {
    try {
        // get user info 
        runtime.userInfo = await runtime.getUserInfo();

        let practices=await getUserPractices();
        
        

                
    } catch (error) {
        console.error(error);
    }
}




$('document').ready(function () {
    //Initial Data Load 
    dataLoad().then(r1=>{
        
    });    
});
