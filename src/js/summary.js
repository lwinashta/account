//MARK THE SELECTED PAGE
$('#homepg-top-nav a[href="/"] .hpg-menu-item').addClass('hpg-menu-item-sel');

var cachedUserInfo={};

$.post('/api/global/account/user/bytoken').then(function(userinfo){

    cachedUserInfo=userinfo;

    if(userinfo.registrationinfo[0].registrationtype!=="oi_standard_free"){
        //-- get the user payment information 
        return $.post('/payment/api/customer/get',{
            "registrationNum": userinfo.registrationnum
        });
    }else{
        throw "no payment method stored";
    }

}).then(function(subscription){
    console.log(subscription);
    if(subscription==="customer-not-found"){
        alert("issue with customer gateway");
    }
}).fail((err)=>{
    console.error(err);
});