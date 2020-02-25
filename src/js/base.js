export var runtime={
    "userInfo":{},
    "months":['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
    "registrationtypes":[{
        "code":"oi_standard_free",
        "name":"30 days free trial "
    },{
        "code":"oi_standard_monthly",
        "name":"Standard Account - Monthly Subscription"
    },{
        "code":"oi_standard_yearly",
        "name":"Standard Account - Yearly Subscription"
    },{
        "code":"oi_enterprise_yearly",
        "name":"Enterprise Account - Yearly Subscription"
    },{
        "code":"oi_enterprise_monthly",
        "name":"Enterprise Account - Monthly Subscription"
    }],
    "getSysSettings":()=>{
        return $.getJSON('/gfs/sys-settings/config/config.json');
    },
    "getUserInfo":()=>{
        return $.post('/account/api/user/verifytoken');
    },
    "getCustomerInfo":()=>{
        if(Object.keys(runtime.userInfo).length===0) throw 'user information not found';
        return $.post('/payment/api/customer/get',{
            "registrationNum": runtime.userInfo.registrationnum
        });
    },
    "getCustomerTransactions":()=>{
        if(Object.keys(runtime.userInfo).length===0) throw 'user information not found';
        return $.post('/payment/api/customer/transactions',{
            "registrationNum": runtime.userInfo.registrationnum
        });
    },
    "setAccountDetails":()=>{

        console.log(runtime);
    
        const getType=()=>{
    
            let registrationinfo=runtime.userInfo.registrationinfo[0];
    
            if(registrationinfo.registrationtype==='oi_standard_free' 
                && !registrationinfo.expired){
                
                return `<div>
                        <div class="info-row-content">
                        <div>30 days free trial <span class="dot-seprator">Expiring on: <b style="color:red"> ${registrationinfo.expirationDate}</b></span></div>
                        <div class="text-muted sm-txt">
                            Your registration will expire on <b>${registrationinfo.expirationDate}</b>. 
                            Please update your registration type to standard or business type to avoid any downtime.</div>
                    </div>
                </div>`;
    
            }else if(registrationinfo.registrationtype==='oi_standard_free' 
                && registrationinfo.expired){
                    return `<div>
                        Your registration was expired on 
                        <b style="color:red"> ${registrationinfo.expirationDate}</b>. 
                        Click on update button to change your registration to standard or business type. </div>`
            
            }else {
    
                let lastTransaction=runtime.userInfo.transactions[runtime.userInfo.transactions.length-1];
                let lastTransactionEndDate=new Date(lastTransaction.subscription.billingPeriodEndDate);
                let lastTransactionEndDateString=`${runtime.months[lastTransactionEndDate.getMonth()]} ${lastTransactionEndDate.getDate()}, ${lastTransactionEndDate.getFullYear()}`;
                
                return `<div>
                        <div class="info-row-content">
                        <div>
                            <span>${runtime.registrationtypes.filter(r=>r.code===registrationinfo.registrationtype)[0].name}</span> 
                            <span class="dot-seprator">
                                Next Payment on: <b style="color:red">${lastTransactionEndDateString}</b>
                            </span>
                        </div>
                        <div class="text-muted sm-txt">Next payment of ${lastTransaction.currencyIsoCode} ${lastTransaction.amount} will deducted on 
                            <b>${lastTransactionEndDateString}</b>
                            . click update if you would like to update your subscription, payment method or frequency of your payments. </div>
                    </div>
                </div>`;
            }
        }
    
        return `<div>
            <div class="info-row info-row-bor-t">
            <div class="info-row-icon">
                <i class="material-icons align-middle">verified_user</i>
            </div>
            ${getType()}
            <a href="/update-registrationtype" class="txt-col-dblue">
                <div class="info-row-action">Update →</div>
            </a>
        </div>
        </div>`;
    
    },
    "setPaymentMethods":function(){

        let html='';
    
        if(runtime.userInfo.paymentDetails!==null){
            let paymentMethods=runtime.userInfo.paymentDetails.paymentMethods;
            paymentMethods.forEach(element => {
                    html+=`
                        <div class="info-row info-row-bor-t">
                        <div class="info-row-icon">
                            <img src="${element.imageUrl}">
                        </div>
                        <div>
                            <div class="info-row-content" style="margin-left:50px;">
                                <div>${element.cardType} ending with ${element.last4} 
                                    ${element.default?' <span style="color:coral"> (This is default card) </span>':''}
                                </div>
                                <div class="sm-txt text-muted">Expiration: ${element.expirationDate}</div>
                            </div>
                        </div>
                    </div>`;
                });
        }else{
            return `<div class="text-muted pad-10"> No payment method found.</div>`;
        }
    
        return html;
    
    },
    "setTransactions":()=>{
        let html="";
        if(runtime.userInfo.transactions!==null){
            let transactions=runtime.userInfo.transactions;
            transactions.forEach(element => {
                html+=`<div class="inline-dataview">
                        <div class="inline-label font-b fieldname="status">
                            <span class="pad-5 bg-dblue d-inline-block text-capitalize bor-Rad-S">${element.status}</span>
                        </div> 
                        <div class="inline-value">
                            <div>
                                <span fieldname="currencyIsoCode"><b>${element.currencyIsoCode}</b></span> 
                                <span fieldname="amount">${element.amount}</span>
                            </div>
                            <div class="text-muted sm-txt">
                                <span fieldname="id"><b>Transaction id:</b> ${element.id}</span>
                                <span class="dot-seprator" fieldname="createdAt"><b>Charged on:</b> ${window.moment(element.createdAt).format('DD MMM, YYYY')}</span>
                            </div>
                        </div> 
                    </div>`;
            });
        }else{
            return `<div class="text-muted pad-10"> No transactions found.</div>`;
        }
    
        return html;
    }
};

$('document').ready(function(){
    $('#app-header-user-info-container').hideOffFocus();

    //--- bind logout button 
    $('#app-header-logout').click(function(){
        $.post('/account/api/user/logout').done(loggedout=>{
            window.location.reload();
        });
    });
});