//MARK THE SELECTED PAGE
$('#homepg-top-nav a[href="/"] .hpg-menu-item').addClass('hpg-menu-item-sel');

const runtime={
    "userInfo":{},
    "months":['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
};

$.post('/api/global/account/user/bytoken').then(function(userinfo){

    runtime.userInfo=userinfo;

    if(userinfo.registrationinfo[0].registrationtype!=="oi_standard_free"){
        //-- get the user payment information 
        return $.post('/payment/api/customer/get',{
            "registrationNum": userinfo.registrationnum
        });
    }else{
        runtime.userInfo.transactions=null;
        throw "no payment method stored";
    }

}).then(function(customerInfo){

    runtime.userInfo.paymentDetails=customerInfo;

    return $.post('/payment/api/customer/transactions',{
        "registrationNum": runtime.userInfo.registrationnum
    });

}).then(function(transactions){

    console.log(transactions);

    runtime.userInfo.transactions=transactions;

    $('#summary-account-info-container').html(setAccountDetails());
    $('#summary-payment-info-container').html(setPaymentMethods());

}).fail((err)=>{
    console.error(err);
});

const setAccountDetails=()=>{

    console.log(runtime);

    const getType=()=>{

        let registrationinfo=runtime.userInfo.registrationinfo[0];
        let payment=runtime.userInfo.payment;

        if(registrationinfo.registrationtype==='oi_standard_free' 
            && !registrationinfo.expired){
            
            return `<div class="info-row-content">
                <div>30 days free trial <span class="dot-seprator">Expiring on: <b style="color:red"> ${registrationinfo.expirationDate}</b></span></div>
                <div class="text-muted sm-txt">
                    Your registration will expire on <b>${registrationinfo.expirationDate}</b>. 
                    Please update your registration type to standard or business type to avoid any downtime.</div>
            </div>`;

        }else if(registrationinfo.registrationtype==='oi_standard_free' 
            && registrationinfo.expired){
                return `<div>
                    Your registration was expired on 
                    <b style="color:red"> ${registrationinfo.expirationDate}</b>. 
                    Click on update button to change your registration to standard or business type. </div>`
        
        }else if(registrationinfo.registrationtype==='oi_standard_monthly'){
            let lastTransaction=runtime.userInfo.transactions[runtime.userInfo.transactions.length-1];
            let lastTransactionEndDate=new Date(lastTransaction.subscription.billingPeriodEndDate);
            let lastTransactionEndDateString=`${runtime.months[lastTransactionEndDate.getMonth()]} ${lastTransactionEndDate.getDate()}, ${lastTransactionEndDate.getFullYear()}`;
            
            return `<div class="info-row-content">
                <div>Standard Account - Monthly Subscription 
                    <span class="dot-seprator">
                        Next Payment on: <b style="color:red">${lastTransactionEndDateString}</b>
                    </span>
                </div>
                <div class="text-muted sm-txt">Next payment of ${lastTransaction.currencyIsoCode} ${lastTransaction.amount} will deducted on 
                    <b>${lastTransactionEndDateString}</b>
                    . click update if you would like to update your subscription, payment method or frequency of your payments. </div>
            </div>`;
        }
    }

    return `<div class="info-row info-row-bor-t">
        <div class="info-row-icon">
            <i class="material-icons align-middle">verified_user</i>
        </div>
        ${getType()}
        <a href="/update-registrationtype" class="txt-col-dblue">
            <div class="info-row-action">Update →</div>
        </a>
    </div>`;

}

const setPaymentMethods=()=>{

    let paymentMethods=runtime.userInfo.paymentDetails.paymentMethods;
    let html='';
    paymentMethods.forEach(element => {
        html+=`<div class="info-row info-row-bor-t">
            <div class="info-row-icon">
                <img src="${element.imageUrl}">
            </div>
            <div class="info-row-content" style="margin-left:50px;">
                <div>${element.cardType} ending with ${element.last4} 
                    ${element.default?' <span style="color:coral"> (This is default card) </span>':''}
                </div>
                <div class="sm-txt text-muted">Expiration: ${element.expirationDate}</div>
            </div>
        </div>`;
    });

    return html;

}