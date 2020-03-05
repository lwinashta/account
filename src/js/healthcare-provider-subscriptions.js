
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

var userPaymentInformation={};
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

const getPackages=function(){
    return apps.filter(a => a.user_types.indexOf("healthcare-provider") > -1 && a.type==="package");
}

const getUserSubscriptions=function(){

    let subs=userPaymentInformation.creditCards.map(c=>c.subscriptions).flat();
    let activeSubs=subs.filter(s=>s.status==="Active");

    return activeSubs;
}

const getSubscriptionPlans=function(){
    return $.post('/payment/api/plans/getall')
}

const createSubscription=function(params){
    return $.post('/payment/api/subscription/create',params);
}

const getSubscription=function(params){
    $.post('/payment/api/subscription/get',params).done(function(){

    });
}

const setAppLayout = function (info,details) {

    let setSubscribebuttonLayout=`<div class="btn btn-primary pointer subscribe-button">
            <label class="m-0 pointer">Subscribe</label>
        </div>`;

    let checkSubscription=function(){
        //check if user has any of the package subscriptions 

        //${userSubscriptions.length>0?userSubscriptions.filter(s=>s.planId===info.subscriptions.monthly._id || s.planId===info.subscriptions.yearly._id).length>0?`<div>subscribed</div>`:setSubscribebuttonLayout:setSubscribebuttonLayout}
    };
    
    return `<div class="p-3 mt-3 bg-white rounded shadow subscription-tile position-relative border" itemid="${info._id}" itemtype="${info.type}">
        <div>
            <div class="d-inline-block mr-2 align-top">
                <img style="width:30px" class="mx-auto" src="/gfs/apps/icons/${info._id}.png">
            </div>
            <div class="d-inline-block align-top">
                <div class="text-capitalize">${info.name}</div>
                <div>
                    <b>$${currencyFormat(info.subscriptions.monthly.usd)} or ₹${currencyFormat(Math.round(info.subscriptions.monthly.usd*currConversions.rates.INR))}/ month</b>
                    <b class="dot-seprator">$${currencyFormat(info.subscriptions.yearly.usd)} or ₹${currencyFormat(Math.round(info.subscriptions.yearly.usd*currConversions.rates.INR))}/ year</b>
                </div>
                
            </div>
        </div>

        <div class="push-right">
            ${setSubscribebuttonLayout}
        </div>

        <div class="mt-1 small app-details"></div>
        
    </div>`;
}

const setDetails=function(appid,container){
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

        let details = "";

        try {

            let html = setAppLayout(element);

            $('#subscriptions-per-app-container').append(html);

            setDetails(element._id,$('#subscriptions-per-app-container'));

        } catch (error) {
            console.log(error);

        }

    });
};

const setPackages=function(){

    let pkgs=getPackages();

    pkgs.forEach(async (element, indx) => {

        try {        

            let html = setAppLayout(element);

            $('#subscriptions-per-package-container').append(html);

            setDetails(element._id,$('#subscriptions-per-package-container'));

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

const showConfirmationChargePopUp=function(info){
    console.log(info);
    console.log(userPaymentInformation);

    let userDefaultCardInfo=userPaymentInformation.paymentMethods.filter(pym=>pym.default===true)[0];
    let userDefaultAddress=userDefaultCardInfo.billingAddress;
    let defaultPaymentBillingCountry=userDefaultAddress.countryCodeAlpha2;

    let monthlyCharge=0;
    let yearlyCharge=0;
    let currencyIcon="";

    if(defaultPaymentBillingCountry==="US"){
        monthlyCharge=info.subscriptions.monthly.usd;
        yearlyCharge=info.subscriptions.yearly.usd;
        currencyIcon="$";

    }else if(defaultPaymentBillingCountry==="IN"){
        monthlyCharge=Math.round(info.subscriptions.monthly.usd*currConversions.rates.INR);
        yearlyCharge=Math.round(info.subscriptions.yearly.usd*currConversions.rates.INR);
        currencyIcon="₹";
    }

    let html=`<div class="text-center p-2 mt-2">
            <div>
                <img src="/gfs/apps/icons/${info._id}.png" style="width:80px">
            </div>
            <div class="mt-2 text-medium">${info.name} (${info.type})</div>
        </div>
        <div class="mt-2 p-2 border-top">
            <label>Select the subscription frequency</label>
            <div class="mt-2 subscription-frequency-container">
                <div>
                    <input id="monthly-subscription" class="align-top monthly-subscription" value="${info.subscriptions.monthly._id}" type="radio" name="subscription-frequency">
                    <label for="monthly-subscription" style="font-size:1rem;margin-top: -4px;">
                        <div>${currencyIcon}${currencyFormat(monthlyCharge)}/ month</div> 
                    </label>
                </div>
                <div>
                    <input id="yearly-subscription" class="align-top yearly-subscription" value="${info.subscriptions.monthly._id}" type="radio" name="subscription-frequency">
                    <label for="yearly-subscription" style="font-size:1rem;margin-top: -4px;">
                        <div><div>${currencyIcon}${currencyFormat(yearlyCharge)}/ yearly</div> </div>
                        <div class="small text-muted">10% discount for yearly susbcriptions</div>
                    </label>
                </div>
            </div> 
        </div>
        <div class="mt-2 p-3 border-top" id="selected-subscription-details"></div>`;

    $('#subscribe-confirmation-modal').modal({
        backdrop:'static'
    });

    $('#subscribe-confirmation-modal').find('.modal-body').html(html);

    //disable subscribe button on load 
    $('#subscribe-confirmation-modal')
        .find('#subscribe-button')
        .attr('disabled','disabled')
        .addClass('btn-light')
        .removeClass('btn-primary');

    $('#subscribe-confirmation-modal')
        .find('input[name="subscription-frequency"]')
        .change(function(){

        if($(this).prop('checked')){
            //update the html for the  
            let html="";
            let val=$(this).val();

            //let info=apps.filter(a=>a._id===_id)[0];   
            
            if($(this).hasClass('yearly-subscription')){        
                html=`<div>
                    <div>You will be charged <b style="color:red">${currencyIcon}${currencyFormat(yearlyCharge)}</b> yearly. This amount will be charged immediately to activate your subscription.
                    The next billing date will be <b style="color:coral">${window.moment().add(1,'year').format('DD MMM YYYY')}</b>
                    </div>
                </div>`;

            }else if($(this).hasClass('monthly-subscription')){
                html=`<div>
                    <div>You will be charged <b style="color:red">${currencyIcon}${currencyFormat(monthlyCharge)}</b> monthly. This amount will be charged immediately to activate your subscription.
                        The next billing date will be <b style="color:coral">${window.moment().add(1,'month').format('DD MMM YYYY')}</b>
                    </div>
                </div>`;
            }
            $('#subscribe-confirmation-modal')
                .find('#subscribe-button')
                .removeAttr('disabled')
                .removeClass('btn-light')
                .addClass('btn-primary')
                .find('label').addClass('pointer');

            $('#subscribe-confirmation-modal')
                .find('#selected-subscription-details')
                .html(html);
        }
    });

    $('#subscribe-confirmation-modal').on('click','#subscribe-button',function(){
        
        let id=$('#subscribe-confirmation-modal').find('input[name="subscription-frequency"]:checked').val();
        let userDefaultCardInfo=userPaymentInformation.paymentMethods.filter(pym=>pym.default===true)[0];
        let token=userDefaultCardInfo.token;

        popup.onScreen("Subscribing...");

        createSubscription({
            "planId":"APP_MO_US_1499",
            "paymentMethodToken":token,
            "billingCycle":2
        }).then(subscribed=>{
            console.log(subscribed);
            popup.remove();
            popup.onScreenAllowClose("<div>Successfully subscribed </div>");
        
        }).fail(err=>{
            console.log(err);
            popup.remove();
            popup.onScreenAllowClose("<div> Error occured while subscribing. Please try again or contact us.</div>");
        });

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
var currConversions={};
var apps=[];
var userInfo={};
var userSubscriptions=[];

$.post('/account/api/user/verifytoken').then(user => {
    userInfo=user;

    return $.when(getCurrenyConversion(),getUserPaymentInformation(),$.getJSON("/gfs/apps/apps.json"),getSubscriptionPlans());

}).then((curr,userPym,sysApps,plans) => {

    console.log(plans);
    apps = sysApps[0];

    userSubscriptions=getUserSubscriptions(userPym);


    setApps();
    setPackages();

}).fail(err => {

    console.log(err);

});

