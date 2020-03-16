import {runtime} from './base.js';

const getCurrenyConversion = function () {
    return new Promise((resolve, reject) => {
        try {
            $.getJSON("https://api.exchangerate-api.com/v4/latest/USD").then(cur => {
                currConversions = cur;
                resolve(cur);
            });
        } catch (error) {
            reject(error);
        }
    });
};

const getUserPaymentInformation=function(){
    return new Promise((resolve,reject)=>{
        if(Object.keys(userPaymentInformation).length>0 || userPaymentInformation==='customer-not-found'){
            resolve(userPaymentInformation);
        }else{
            //check if customer information exists 
            $.post('/payment/api/customer/get', {
                "registration_number": userInfo.registration_number
            }).done(customer=>{
                userPaymentInformation=customer;
                resolve(userPaymentInformation);

            }).catch(err=>{
                console.log(err);
                reject(err);
            });
        }
        
    });
};

const getPricePerIpLocation=function(appInfo){

    let billingInfo={
        price:0,
        currencyIcon:"",
        merchantAccountId:"",
        planInfo:{}
    }

    if(clientIpLocation.country_code==="US"){
        billingInfo.planInfo=subscriptionPlans.filter(p=>p.id===appInfo.subscriptions.monthly.us)[0];
        billingInfo.merchantAccountId="owninvention";
        billingInfo.currencyIcon=clientIpLocation.currency.symbol;
        billingInfo.price=parseFloat(billingInfo.planInfo.price);

    }else if(clientIpLocation.country_code==="IN"){
        billingInfo.planInfo=subscriptionPlans.filter(p=>p.id===appInfo.subscriptions.monthly.india)[0];
        billingInfo.merchantAccountId="owninvention_India";
        billingInfo.currencyIcon=clientIpLocation.currency.symbol;
        billingInfo.price=parseFloat(billingInfo.planInfo.price);

    }
    
    return billingInfo;
};


/**  GET ALL PLANS */
const getPlans=function(){
    return $.post('/payment/api/plans/getall')
}

//********************** */
/** SUBSCRIBTION */
const createSubscription=function(params){
    return $.post('/payment/api/subscription/create',params);
}

const updateSubscription=function(params){

    //step 1 - update the payment gateway woth subscription information 
    return $.post('/payment/api/subscription/update',params);

    //step 2 - update the subscription is 

};

const cancelSubscription=function(params){
    return $.post('/payment/api/subscription/cancel',params);
};

const getAllSubscriptions=function(){
    return userPaymentInformation.creditCards.map(c=>c.subscriptions).flat();
}

const getUserActiveSubscriptions=function(){

    let subs=getAllSubscriptions();
    let activeSubs=subs.filter(s=>s.status==="Active");

    return activeSubs;
}

//-------- calculate refund or sale for updated subscription -- 
// --- subscription can be updated only if the last trasaction is settled or settling and is NOT a refund trasaction 
// -- if the last trasaction is refund trasaction and is settled - user will be charged for the updated subscription only -- 
const calcProratedAmount=function(currentSubscription,newSubscription){
    
    var td = window.moment();// todays date 

    var currentSubscriptionPrice = parseFloat(currentSubscription.price);
    var currentSubscriptionBalance = parseFloat(currentSubscription.balance);
    var newSubscriptionPrice = parseFloat(newSubscription.price);

    var currentSubscriptionPlanId = currentSubscription.planId;

    //-- calculate the prorated amount -- 
    //prorate calculation = (newSusPrice - currentSubPrice)/ (Number of days left in the billing cycle/Total number of days in the billing cycle)
    //suppose subscription was updated on 3/23/2020.
    //old subscriptin price = 29.99 for month and new subs 59.99 
    //calc -> (59.99-29.99)*(7/30) = -7, $7 will be refunded from transaction and 59.99 will be charged from next month. 
    
    var nxtBd = window.moment(currentSubscription.nextBillingDate);
    var lastMonthDate = window.moment(nxtBd).subtract(1, 'months');// calculate total number of days for subscription

    var diff1 = nxtBd.diff(td, 'days');// Number of days left in the billing cycle
    var diff2 = nxtBd.diff(lastMonthDate, 'days'); //-- Total number of days in the billing cycle             

    var calcProratedAmount = (newSubscriptionPrice - currentSubscriptionPrice) * (diff1 / diff2);

    calcProratedAmount=parseFloat(calcProratedAmount.toFixed(2))

    if (calcProratedAmount > 0) {// -- upgrade amount 
        
        //-- charge/ debit the amount -- 
        //-- if balance exists - The amount of outstanding charges associated with a subscription. 
        //calcProratedAmount = calcProratedAmount+currentSubscriptionBalance ;

        return {
            "action": "charge",
            "outstandingBalance":currentSubscriptionBalance,
            "amount": calcProratedAmount
        };

    } else {
        //-- refund or credit
        return {
            "action": "refund",
            "outstandingBalance":currentSubscriptionBalance,
            "amount": calcProratedAmount
        };
    }
}

//** Logic looks into which package user has been subscribed and include the apps in the subscriptions accordingly */
const getUserSubscribedAppsPkgs=function(){
    let subscriptions=[];

    let checkIfPkg=new RegExp('\_PKG\_');

    let subscribedPackages=userSubscriptions.filter(s=>checkIfPkg.test(s.planId));
    //console.log(subscribedPackages);

    if(subscribedPackages.length>0){

        subscribedPackages.forEach(pkg=>{

            let pkgInfo=apps.filter(a=>a.type==="package" &&  (a.subscriptions.monthly.india===pkg.planId || a.subscriptions.monthly.us===pkg.planId))[0];

            subscriptions[pkgInfo._id]={
                "planId":pkg.planId,
                "subscriptionId":pkg.id,
                "subscriptionCreatedAt":pkg.createdAt,
                "subscriptionNextBillingDate":pkg.nextBillingDate,
                "type":"package"
            };
    
            //get package details 
            let appsIncluded=pkgInfo.package_details.apps_included;
            
            if(appsIncluded==="all"){
                subscriptions.allAppsIncluded={
                    "planId":pkg.planId,
                    "packageId":pkgInfo._id,
                    "type":"app",
                    "subscriptionId":pkg.id,
                    "subscriptionCreatedAt":pkg.createdAt,
                    "subscriptionNextBillingDate":pkg.nextBillingDate,
                    "includedWithPackage":true
                };
    
            }else if(appsIncluded.length>0){
                appsIncluded.forEach(a=>{
                    subscriptions[a]={
                        "planId":pkg.planId,
                        "type":"app",
                        "packageId":pkgInfo._id,
                        "subscriptionId":pkg.id,
                        "subscriptionCreatedAt":pkg.createdAt,
                        "subscriptionNextBillingDate":pkg.nextBillingDate,
                        "includedWithPackage":true
                    };
                });
            }
        });

    }

    let subscribedApps=userSubscriptions.filter(s=>!(checkIfPkg.test(s.planId)));
    if(subscribedApps.length>0){

        subscribedApps.forEach(app=>{

            let appId=apps.filter(a=>a.type==="app" &&  (a.subscriptions.monthly.india===app.planId || a.subscriptions.monthly.us===app.planId))[0].id;

            subscriptions[appId]={
                "planId":app.planId,
                "nextBillingDate":pkg.nextBillingDate,
                "type":"package"
            };
    
        });

    }

    return subscriptions;

}

//********************** */
/** SET APPS & PACKAGES ON LOAD  */
const setAppLayout = function (info) {

    //GET PLAN DETAILS 
    let usPlanId = info.subscriptions.monthly.us;
    let indiaPlanId = info.subscriptions.monthly.india;
    
    let planInfo = subscriptionPlans.filter(p => p.id === usPlanId || p.id === indiaPlanId);

    //set the price of the plan per the country
    let billing=getPricePerIpLocation(info);

    //console.log(planInfo);
    const getPlanInfo=function(){
        
        //check trial period
        let html=`<div>${planInfo[0].trialPeriod ?
                `<b style="color:dodgerblue">${planInfo[0].trialDuration} ${planInfo[0].trialDurationUnit}</b> free trial. </div>` 
                : ``}`;
        
        if(Object.keys(billing).length===0){
            //No billing info exists - show both us and india prices 
            html+=`<div>
                    <b>$${currencyFormat(parseFloat(planInfo.filter(p=>p.id===usPlanId)[0].price))} / month ${planInfo[0].trialPeriod?`<span> after trial period.</span>`:``}</b>
                    <b class="dot-seprator">₹${currencyFormat(parseFloat(planInfo.filter(p=>p.id===indiaPlanId)[0].price))} / month ${planInfo[0].trialPeriod?`<span> after trial period.</span>`:``}</b>
                </div>`;
        }else{
            html+=`<div>
                    <b>${billing.currencyIcon} ${currencyFormat(billing.price)} / month </b>
                    ${planInfo[0].trialPeriod?`<span> after trial period.</span>`:``}
                </div>`;
        }

        return html;

    };

    //check if user is already subscribed
    const allowSubscriptions=function(){
        if(info._id in userAppsPkgsSubscribed || ("allAppsIncluded" in userAppsPkgsSubscribed && info.type!=="package")){
            //user is already subscribed - show the subscrition info 
            let subsInfo=userAppsPkgsSubscribed.allAppsIncluded?userAppsPkgsSubscribed.allAppsIncluded:userAppsPkgsSubscribed[info._id];
            return `<div>
                <div class="border small p-2 rounded">
                    <div class="d-inline-block align-top">
                        <i class="text-success material-icons align-middle">check_circle</i>
                    </div>
                    <div class="d-inline-block">
                        <div class="text-primary">Subscribed on ${window.moment(subsInfo.subscriptionCreatedAt).format('DD MMM YYYY')}</div>
                        <div class="small text-muted">Next Billing date ${window.moment(subsInfo.subscriptionNextBillingDate).format('DD MMM YYYY')}</div>
                    </div>
                </div>
                ${"includedWithPackage" in subsInfo && subsInfo.includedWithPackage && info.type!=="package"?`<div class="mt-2 small text-muted">
                    Subscription cannot be canceled. Apps subcribed via package.
                </div>`:`<div class="mt-2">
                    <div class="btn btn-danger cancel-subscription-button pointer" subscriptionid="${subsInfo.subscriptionId}">
                        <label class="m-0 pointer">Cancel subscription</label>
                    </div>
                </div>`}
                
            </div>`;
        }else{
            return `<div class="btn btn-primary pointer subscribe-button">
                <label class="m-0 pointer">Subscribe</label>
            </div>`;
        }
    };

    if (planInfo.length > 0 ) {

        return `<div class="p-3 mt-3 bg-white rounded shadow subscription-tile position-relative border" itemid="${info._id}" itemtype="${info.type}">
            <div>
                <div class="d-inline-block mr-2 align-top">
                    <img style="width:30px" class="mx-auto" src="/gfs/apps/icons/${info._id}.png">
                </div>
                <div class="d-inline-block align-top">
                    <div class="text-capitalize">${info.name}</div>
                    <div>
                        ${getPlanInfo()}
                    </div>
                </div>
            </div>

        <div class="push-right">
            ${allowSubscriptions()}
        </div>

        <div class="mt-1 small app-details"></div>
        
    </div>`;
    
    } else {
        return '';
    }
    
}

const setAppDetails=function(appid,container){
     $.get(`/gfs/apps/details/${appid}.html`).done(details=>{
         $(container)
            .find(`.subscription-tile[itemid="${appid}"]`)
            .find('.app-details').html(details); 
     });
     
};

const setApps = function () {

    apps.sort(function (a, b) {
        if (a.name > b.name) return -1;
        return 1;
    });

    apps.filter(a => a.user_types.indexOf("healthcare-provider") > -1 && a.type==="app").forEach((element, indx) => {

        try {

            let html = setAppLayout(element);

            $('#subscriptions-per-app-container').append(html);

            setAppDetails(element._id,$('#subscriptions-per-app-container'));

        } catch (error) {
            console.log(error);

        }

    });
};

const getPackages=function(){
    return apps.filter(a => a.user_types.indexOf("healthcare-provider") > -1 && a.type==="package");
}

const setPackages=function(){

    let pkgs=getPackages();

    pkgs.forEach(async (element, indx) => {

        try {        

            let html = setAppLayout(element);

            $('#subscriptions-per-package-container').append(html);

            setAppDetails(element._id,$('#subscriptions-per-package-container'));

        } catch (error) {
            console.log(error);

        }

    });
};



//********************** */
//*** pop ups */
const showNoPaymentMethodPopUp = function () {
    let html = `<div class="p-2 text-center"><img style="width:100px;" src="/gfs/images/payments/payment_method.png"></div>
                <b class="mt-2">No Payment Method found</b>
                <div class="mt-2">
                    Click 
                    <a href="/payments">here <i class="material-icons small-icon align-middle">launch</i></a> 
                    to add payment method, or contact us for any questions.
                </div>`;

    popup.onScreenAllowClose(html);

};

const showConfirmationChargePopUp=function(info){

    let billing=getPricePerIpLocation(info);
    let planInfo=billing.planInfo;
    let wasUserSubscribed= getAllSubscriptions().filter(s=>s.planId===planInfo.id).length>0;

    let isPkgSubscribed=Object.keys(userAppsPkgsSubscribed).filter(k=>userAppsPkgsSubscribed[k].type==="package");
    let subscribedPkgInfo=isPkgSubscribed.length>0?apps.filter(a=>a._id===isPkgSubscribed[0])[0]:null;
    let subscriptionInfo=userSubscriptions.filter(u=>u.planId===userAppsPkgsSubscribed[isPkgSubscribed[0]].planId)[0];

    const updatePackageChargesLayout=function(){
        
        let proratedAmount=calcProratedAmount(subscriptionInfo,planInfo);
        let outstanding=proratedAmount.amount+proratedAmount.outstandingBalance;

        return `<div>
            <h4>Charges:</h4>
            <div class="border-bottom pt-2 pb-2">
                <div>
                    ${proratedAmount.action==="refund"?`<div>
                        <div class="position-relative mt-2">
                            <div class="text-danger d-inline-block">
                                <b>Refund</b>
                            </div>
                            <div class="text-muted w-75 small">Refund will be adjusted in the next billing cycle</div>
                            <div class="push-right t-0">${billing.currencyIcon}${proratedAmount.amount}</div>
                    </div>`:`<div>
                    <div class="position-relative mt-2">
                        <div class="text-danger d-inline-block">
                            <b>Additonal Charges</b>
                        </div>
                        <div class="text-muted w-75 small">Balance amount will be charged today: <b>${window.moment().format('DD MMM YYYY')}</b>.</div>
                        <div class="push-right t-0">${billing.currencyIcon}${proratedAmount.amount}</div>
                </div>`} 
                <div class="position-relative mt-2">
                    <div class="text-danger d-inline-block">
                        <b>Current Subscription Balance</b>
                    </div>
                    <div class="text-muted w-75 small">The amount of outstanding charges associated with current subscription.</div>
                    <div class="push-right t-0">${billing.currencyIcon}${proratedAmount.outstandingBalance}</div>
                </div>
                <div class="position-relative bottom-top pb-2 mt-2">
                    <div class="text-danger d-inline-block">
                        <b class="text-success">Total</b>
                    </div>
                    <div class="text-muted w-75 small">Total amount to be ${proratedAmount.action==="refund"?' refunded. Refund takes 3-5 business days to show up on your statement.':' charged'}</div>
                    <div class="push-right t-0">${billing.currencyIcon}${outstanding}</div>
                </div>
                </div>
            </div>
        </div>`;

    };

    const updatePackageWithNoTransactionsLayout=function(){
        return `<div>
            <h4>Charges:</h4>
            <div>The trail period is still in progress for your subscription.</div>
            <div class="position-relative">
                <div class="text-danger">Payment</div>
                <div class="w-75 text-muted">You account will be charged on next billing cycle <b style="color:coral">${window.moment(subscriptionInfo.nextBillingDate).format('DD MMM YYYY')}</b> for new subscription</div>
                <div class="push-right t-0">${billing.currencyIcon}${currencyFormat(billing.price)}</div>
            </div>`;
    };  

    const newSubscriptionLayout=function(){
        return `<div>
            <h4>Charges:</h4>
            <div class="position-relative">
                <div class="w-75 text-muted">
                    ${planInfo.trialPeriod && !wasUserSubscribed ? 
                        `<b style="color:dodgerblue">${planInfo.trialDuration} ${planInfo.trialDurationUnit}</b> 
                        free trial and after that you will be charged` 
                        : `You will be charged `}
                    the subscription amount. 
                    <div>You next billing date -  
                        <b style="color:coral">${planInfo.trialPeriod && !wasUserSubscribed?`${window.moment().add(1,'months').format('DD MMM YYYY')}`:` today, ${window.moment().format('DD MMM YYYY')}`}</b>
                    </div>
                </div>
                <div class="push-right t-0">${billing.currencyIcon}${currencyFormat(billing.price)}</div>
            </div>`;
    }; 

    try {

        let html=`<div class="text-center p-2 mt-2">
            <div>
                <img src="/gfs/apps/icons/${info._id}.png" style="width:80px">
            </div>
            <div class="mt-2 text-medium">${info.name} (${info.type})</div>
        </div>

        ${info.type==="package" && isPkgSubscribed.length>0?`<div class="mt-2 p-3 border-top position-relative">
            <div class="pull-left" style="top:inherit;">
                <i class="text-danger material-icons align-middle">warning</i>
            </div>
            <div class="ml-4">
                <span>Your account is already subscribed to <span class="text-primary">${subscribedPkgInfo.name}</span> package. 
                Subscribing to this package will cancel your subscription for ${subscribedPkgInfo.name} package and replace it with <span class="text-sucess">${info.name}</span></span>
                <div class="mt-2">
                    <div class="font-weight-bold">Please Note: </div>
                    <ul>
                        <li>By subscribing, you will NOT recieve additional 1 month of free trial for new subscription.  </li>
                        <li>Next month's bill is calculated per the balance or refund on your account. 
                            If amount is zero you dont owe us anything for next bill, due to the adjustments. 
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="mt-2 p-3 border-top" id="selected-subscription-details">
            ${subscriptionInfo.transactions.length>0?`<div>${updatePackageChargesLayout()} </div>`:`${updatePackageWithNoTransactionsLayout()}`}
        </div>`:`<div class="mt-2 p-3 border-top" id="selected-subscription-details">
            ${newSubscriptionLayout()}
        </div>`}`;

        $('#subscribe-confirmation-modal').find('.modal-body').html(html);

    } catch (error) {
        console.log(error);
    }
    
    $('#subscribe-confirmation-modal').modal({
        backdrop:'static'
    });

    $('#subscribe-confirmation-modal').on('click','#subscribe-button',async function(){
        
        try {

            if(!($('#terms-conditions-agreement').prop('checked'))){
                throw "agreement-not-checked";
            }

            popup.onScreen("Subscribing...");

            //charge the default payment method 
            let userDefaultCardInfo=userPaymentInformation.paymentMethods.filter(pym=>pym.default===true)[0];
            let token=userDefaultCardInfo.token;
            let subscribed={};
            
            if(isPkgSubscribed.length>0){
                //update the subscriptions instead of creating new 
                //once subscribed the charge will be executed autmatically by the gateway
                //if the charge is to be issued - transaction will be created for that amount 
                //if refund needs to be done, refund will be processed for the transaction 
                subscribed=await updateSubscription({
                    "subscriptionId":subscriptionInfo.id,
                    "planId":planInfo.id,
                    "price":planInfo.price,
                    "paymentMethodToken":token,
                    "merchantAccountId":billing.merchantAccountId
                });

            }else if (wasUserSubscribed){
                //was user subscribed for the subscription in past and perhaps canceled the request
                //if yes - 1 month free trial is not allowed for these users
                subscribed=await createSubscription({
                    "planId":planInfo.id,
                    "paymentMethodToken":token,
                    "merchantAccountId":billing.merchantAccountId,
                    "trialPeriod":false,
                    "trialDuration":0
                });

            }else{
                subscribed=await createSubscription({
                    "planId":planInfo.id,
                    "paymentMethodToken":token,
                    "merchantAccountId":billing.merchantAccountId
                });
            }
            
            console.log(subscribed);
    
            popup.remove();
            popup.onBottomCenter(`<div>
                    <i class="material-icons text-success align-middle mr-2">check_circle</i>
                    <span class="align-middle"> Successfully subscribed </span>
                </div>`);
            
            $('#subscribe-confirmation-modal').modal('hide')
            
        } catch (error) {
            if(error==="agreement-not-checked"){
                $('#terms-conditions-agreement').closest('.form-group').append('<div class="required-error text-danger font-weight-bold text-uppercase small">* Please agree to our subscription terms & conditions</div>');
            }else{
                console.log(error);
                popup.remove();
                popup.onScreenAllowClose(`<div> 
                        <i class='material-icons align-middle text-danger'>error</i> 
                        <span>Error occured while subscribing. Please try again or contact us.</span>
                    </div>`);
        
                $('#subscribe-confirmation-modal').modal('hide');
            }
            
        }
    
    
    });
    
};

/**
 * 
 * @param {*} subscriptionInfo - Subscription info
 * @param {*} proratedAmount 
 */
const showCancelSubscriptionPopUp=function(subscriptionInfo,appInfo,proratedAmount){
    let billing=getPricePerIpLocation(appInfo);
    try {

        let html=`<div class="text-center p-2 mt-2">
            <div>
                <img src="/gfs/apps/icons/${appInfo._id}.png" style="width:80px">
            </div>
            <div class="mt-2 text-medium">${appInfo.name} (${appInfo.type})</div>
        </div>

        <div class="mt-2 p-3 border-top position-relative text-center">
            <h3>We are sorry to see you go. Please read following before canceling your subscription.</h3>
        </div>

        <div class="mt-2 p-3 border-top position-relative">
            <div class="pull-left" style="top:inherit;">
                <i class="text-danger material-icons align-middle">warning</i>
            </div>
            <div class="ml-4">
                <div>Cancellation Terms: </div>
                <ul>
                    <li>Cancellation of <span class="text-primary">${appInfo.name}</span> 
                        will become effective at the end of your current monthly billing period. 
                        You will NOT receive a refund; however your subscription access and privileges will continue for the remainder of the current monthly billing period
                    </li>
                    <li>All future charges associated with future months of your subscription will be cancelled</li>
                    <li>If you wish to subscribe for the services again in future, 
                        you will not recieve additional 1 month of free trial for new subscription</li>
                    <li>Canceled subscriptions cannot be reactivated. If you like to subscribe again new subscription will be created. </li>
                </ul>
            </div>
        </div>`;

        $('#subscribe-cancellation-confirmation-modal').find('.modal-body').html(html);

    } catch (error) {
        console.log(error);
    }
    
    $('#subscribe-cancellation-confirmation-modal').modal({
        backdrop:'static'
    });

    $('#subscribe-cancellation-confirmation-modal').on('click','#subscription-cancel-button',async function(){
        
        try {
            
            if(!($('#terms-conditions-agreement').prop('checked'))){
                throw "agreement-not-checked";
            }

            popup.onScreen("Cancelling Subscription...");

            let canceled=await cancelSubscription({
                "subscriptionId":subscriptionInfo.id
            });
            
            console.log(canceled);
    
            popup.remove();
            popup.onBottomCenter(`<div>
                    <i class="material-icons text-success align-middle mr-2">check_circle</i>
                    <span class="align-middle"> Subscription Cancelled </span>
                </div>`);
            
            $('#subscribe-cancellation-confirmation-modal').modal('hide');
            
        } catch (error) {
            if(error==="agreement-not-checked"){
                $('#terms-conditions-agreement').closest('.form-group').append('<div class="required-error text-danger font-weight-bold text-uppercase small">* Please agree to our subscription terms & conditions</div>');
            }else{
                console.log(error);
                popup.remove();
                popup.onScreenAllowClose(`<div> 
                        <i class='material-icons align-middle text-danger'>error</i> 
                        <span>Error occured while cacnelling the subscription. Please try again or contact us.</span>
                    </div>`);
        
                $('#subscribe-cancellation-confirmation-modal').modal('hide'); 
            }
            
        }
    
    
    });
};


//********************** */
//*** BIND EVENTS */
//bind subscribe button 
$('body').on('click','.subscribe-button',function(){
    
    let _id=$(this).closest('.subscription-tile').attr('itemid');
    let info=apps.filter(a=>a._id===_id)[0];    

    popup.onScreen("Checking for payment method");

    //-- Get subscribtion popup 
    $.get('/layout/subscription/subscribe-popup.html').then(ly=>{
        $('body').append(ly);
        return getUserPaymentInformation();//check if customer credit information is saved

    }).then(pym=>{
        popup.remove();
        if(pym==="customer-not-found"){   

            //if account doesnt exists - point user to payment method page and ask to add payment method 
            showNoPaymentMethodPopUp();

        }else{
            //show the confirmation message on how much amount will be charged 
            showConfirmationChargePopUp(info);
        }

    }).catch(err=>{
        popup.remove();
    });

});

$('body').on('click','.cancel-subscription-button',function(){

    //get subscription id 
    let subscriptionid =$(this).attr('subscriptionid');
    let subscriptionInfo=userSubscriptions.filter(s=>s.id===subscriptionid)[0];

    let appId=$(this).closest('.subscription-tile').attr('itemid');
    let appInfo=apps.filter(a=>a._id===appId)[0];

    console.log(subscriptionInfo,appInfo);
    
    $.get('/layout/subscription/subscription-cancellation-popup.html').done(ly=>{
        $('body').append(ly);
        showCancelSubscriptionPopUp(subscriptionInfo,appInfo);

    }).catch(err=>{
        popup.remove();
    });
        
});



//********************* */
//EXECUTE METHODS 
//var currConversions={};
//getCurrenyConversion(),
var apps=[];
var userInfo={};
var userSubscriptions=[];
var userAppsPkgsSubscribed=[];
var subscriptionPlans=[];
var userPaymentInformation={};
var clientIpLocation={};

popup.onScreen("Loading...");

$.post('/account/api/user/verifytoken').then(user => {
    userInfo=user;

    return $.when(runtime.getIpLocation(),getUserPaymentInformation(),$.getJSON("/gfs/apps/apps.json"),getPlans());

}).then((ipLocation,userPym,sysApps,plans) => {

    clientIpLocation=ipLocation[0];
    subscriptionPlans=plans[0].plans;

    apps = sysApps[0].filter(a=>a.active);

    if(userPym!=="customer-not-found"){
        userSubscriptions=getUserActiveSubscriptions(userPym);
        console.log(userPym,subscriptionPlans);

        userAppsPkgsSubscribed=getUserSubscribedAppsPkgs();
    }

    setApps();
    setPackages();

    popup.remove();

}).fail(err => {

    console.log(err);
    popup.remove();


});

