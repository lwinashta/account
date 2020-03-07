
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

const getPricePerBillingCountry=function(appInfo){

    let userDefaultCardInfo=userPaymentInformation.paymentMethods.filter(pym=>pym.default===true)[0];
    let userDefaultAddress=userDefaultCardInfo.billingAddress;
    let defaultPaymentBillingCountry=userDefaultAddress.countryCodeAlpha2;

    let billingInfo={
        price:0,
        planId:"",
        currencyIcon:"",
        merchantAccountId:"",
        planInfo:{}
    }

    if(defaultPaymentBillingCountry==="US"){
        billingInfo.planInfo=subscriptionPlans.filter(p=>p.id===appInfo.subscriptions.monthly.us)[0];
        billingInfo.merchantAccountId="owninvention";
        billingInfo.currencyIcon="$";
        billingInfo.price=parseInt(billingInfo.planInfo.price);

    }else if(defaultPaymentBillingCountry==="IN"){
        billingInfo.planInfo=subscriptionPlans.filter(p=>p.id===appInfo.subscriptions.monthly.india)[0];
        billingInfo.merchantAccountId="owninvention_India";
        billingInfo.currencyIcon="₹";
        billingInfo.price=parseInt(billingInfo.planInfo.price);

    }
    
    return billingInfo;
};


/**  GET ALL PLANS */
const getPlans=function(){
    return $.post('/payment/api/plans/getall')
}


/** SUBSCRIBTION */
const createSubscription=function(params){
    return $.post('/payment/api/subscription/create',params);
}

const getUserSubscriptions=function(){

    let subs=userPaymentInformation.creditCards.map(c=>c.subscriptions).flat();
    let activeSubs=subs.filter(s=>s.status==="Active");

    return activeSubs;
}

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


/** SET APPS ON LOAD  */

const setAppLayout = function (info) {

    //GET PLAN DETAILS 
    let usPlanId = info.subscriptions.monthly.us;
    let indiaPlanId = info.subscriptions.monthly.india;
    
    let planInfo = subscriptionPlans.filter(p => p.id === usPlanId || p.id === indiaPlanId);

    //set the price of the plan per the country
    let billing=getPricePerBillingCountry(info);

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
                    <b>${billing.currencyIcon}${currencyFormat(billing.price)} / month </b>
                    ${planInfo[0].trialPeriod?`<span> after trial period.</span>`:``}
                </div>`;
        }

        return html;

    };

    //check if user is already subscribed
    const allowSubscriptions=function(){
        if(info._id in userAppsPkgsSubscribed){
            //user is already subscribed - show the subscrition info 
            let subsInfo=userAppsPkgsSubscribed[info._id];
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
                ${"includedWithPackage" in subsInfo && subsInfo.includedWithPackage?`<div class="mt-2 small text-muted">
                    Subscription cannot be canceled. Apps subcribed via package.
                </div>`:`<div class="mt-2" subscriptionid="${subsInfo.subscriptionId}">
                    <div class="btn btn-danger cancel-subscription pointer">
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

const calcProratedAmount=function(oldSub,newSub){
    
    var td = window.moment();// todays date 
    var nxtMonthBillDate = window.moment();

    nxtMonthBillDate.add(0, 'days');// change the next bill date to be today+1 day 

    var currentSubscriptionPrice = CacheSelectedValues.subscriptionDetails.price;
    var currentSubscriptionBalance = parseFloat(CacheSelectedValues.subscriptionDetails.balance);
    var updatedSubscriptionPrice = parseFloat(CacheSelectedValues.planPrice);

    var currentSubscriptionPlanId = CacheSelectedValues.subscriptionDetails.planId;

    if (currentSubscriptionPlanId !== CacheSelectedValues.planId) {// --- check if selected plan is not same as previous plan -- 
        //-- calculate the prorated amount -- 
        var nxtBd = window.moment(CacheSelectedValues.subscriptionDetails.nextBillingDateUnformated.date);
        var lastMonthDate = window.moment(nxtBd).subtract(1, 'months');// calculate total number of days for subscription

        var diff1 = nxtBd.diff(td, 'days');// Number of days left in the billing cycle
        var diff2 = nxtBd.diff(lastMonthDate, 'days'); //-- Total number of days in the billing cycle             

        var calcProratedAmount = (updatedSubscriptionPrice - currentSubscriptionPrice) * (diff1 / diff2);

        if (calcProratedAmount > 0) {// -- upgrade amount 
            //-- charge/ debit the amount -- 
            //-- if balance exists and balance is less than the charge a

            if (currentSubscriptionBalance >= calcProratedAmount) {
                calcProratedAmount = currentSubscriptionBalance - calcProratedAmount;
            }

            var chargeImmediately = updatedSubscriptionPrice > currentSubscriptionPrice ? true : false;

            return {
                "updateSubscriptionAction": "charge",
                "proratedAmount": calcProratedAmount.toFixed(2),
                "chargeImmediately": chargeImmediately
            };

        } else {
            //-- refund or credit
            return {
                "updateSubscriptionAction": "refund",
                "proratedAmount": calcProratedAmount.toFixed(2),
                "chargeImmediately": false
            };
        }

    } else {
        return {
            "updateSubscriptionAction": "notallowed"
        };
    }
}

const showConfirmationChargePopUp=function(info){

    let billing=getPricePerBillingCountry(info);
    let planInfo=billing.planInfo;

    let isPkgSubscribed=Object.keys(userAppsPkgsSubscribed).filter(k=>userAppsPkgsSubscribed[k].type==="package");
    let subscribedPkgInfo=isPkgSubscribed.length>0?apps.filter(a=>a._id===isPkgSubscribed[0])[0]:null;
    let subscriptionInfo=userSubscriptions.filter(u=>u.planId===userAppsPkgsSubscribed[isPkgSubscribed[0]].planId)[0];

    console.log(subscriptionInfo);

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
            ${subscriptionInfo.transactions.length>0?`<div>calcuateprorated amount </div>`:`<div>The trail period is still in progress for your subscription. 
            The next billing date will be <b style="color:coral">${window.moment(subscriptionInfo.nextBillingDate).format('DD MMM YYYY')}</b> for  amount <b style="color:red">${billing.currencyIcon}${currencyFormat(billing.price)}</b> for new subscription</div>`}
        </div>`:`<div class="mt-2 p-3 border-top" id="selected-subscription-details">
            <div>${planInfo.trialPeriod ? `<b style="color:dodgerblue">${planInfo.trialDuration} ${planInfo.trialDurationUnit}</b> free trial and after that you will be charged` : `You will be charged `}  
                <b style="color:red">${billing.currencyIcon}${currencyFormat(billing.price)}</b>. 
                The subscription amount of ${billing.currencyIcon}${currencyFormat(billing.price)} will be automatically deducted on <b style="color:coral">${window.moment().add(1,'month').format('DD MMM YYYY')}</b>. 
            </div>
        </div>`} 
        <div class="mt-2 p-3 border-top">
            <input type="checkbox" id="terms-conditions-agreement">
            <label for="terms-conditions-aggreement" style="text-transform:inherit">Agree with subscription terms and condition. Click <a href="#">here</a> to read more.</label>
        </div>`;

    $('#subscribe-confirmation-modal').find('.modal-body').html(html);

    $('#subscribe-confirmation-modal').modal({
        backdrop:'static'
    });

    $('#subscribe-confirmation-modal #subscribe-button').unbind('click');
    $('#subscribe-confirmation-modal').on('click','#subscribe-button',async function(){
        
        popup.onScreen("Subscribing...");
    
        try {
            let userDefaultCardInfo=userPaymentInformation.paymentMethods.filter(pym=>pym.default===true)[0];
            let token=userDefaultCardInfo.token;
    
            let subscribed=await createSubscription({
                "planId":planId,
                "paymentMethodToken":token,
                "merchantAccountId":merchantAccountId
            });
    
            console.log(subscribed);
    
            popup.remove();
            popup.onBottomCenter(`<div>
                    <i class="material-icons text-success align-middle mr-2">check_circle</i>
                    <span class="align-middle"> Successfully subscribed </span>
                </div>`);
            
            $('#subscribe-confirmation-modal').modal('hide')
            
        } catch (error) {
            console.log(err);
            popup.remove();
            popup.onScreenAllowClose(`<div> 
                    <i class='material-icons align-middle text-danger'>error</i> 
                    <span>Error occured while subscribing. Please try again or contact us.</span>
                </div>`);
    
            $('#subscribe-confirmation-modal').modal('hide')
        }
    
    
    });
    
};

//bind subscribe button 
$('body').on('click','.subscribe-button',function(){
    
    let _id=$(this).closest('.subscription-tile').attr('itemid');
    let info=apps.filter(a=>a._id===_id)[0];    

    popup.onScreen("Checking for payment method");

    //check if customer credit information is saved
    getUserPaymentInformation().then(pym=>{
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

popup.onScreen("Loading...");

$.post('/account/api/user/verifytoken').then(user => {
    userInfo=user;

    return $.when(getUserPaymentInformation(),$.getJSON("/gfs/apps/apps.json"),getPlans());

}).then((userPym,sysApps,plans) => {
    subscriptionPlans=plans[0].plans;

    console.log(subscriptionPlans);
    apps = sysApps[0].filter(a=>a.active);

    userSubscriptions=getUserSubscriptions(userPym);

    userAppsPkgsSubscribed=getUserSubscribedAppsPkgs();

    setApps();
    setPackages();

    popup.remove();

}).fail(err => {

    console.log(err);
    popup.remove();


});

//------------------------------
//-------- calculate refund or sale for updated subscription -- 
// --- subscription can be updated only if the last trasaction is settled or settling and is NOT a refund trasaction 
// -- if the last trasaction is refund trasaction and is settled - user will be charged for the updated subscription only -- 

