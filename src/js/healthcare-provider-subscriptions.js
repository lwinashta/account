
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

const setAppLayout = function (info,details) {
    
    return `<div class="p-3 mt-3 bg-white rounded shadow subscription-tile position-relative border" itemid="${info._id}" itemtype="${info.type}">
        <div>
            <div class="d-inline-block mr-2 align-top">
                <img style="width:30px" class="mx-auto" src="/gfs/apps/icons/${info._id}.png">
            </div>
            <div class="d-inline-block align-top">
                <div>${info.name}</div>
                <div>
                    <b>$${currencyFormat(info.subscriptions.monthly.usd)} or ₹${currencyFormat(Math.round(info.subscriptions.monthly.usd*currConversions.rates.INR))}/ month</b>
                    <b class="dot-seprator">$${currencyFormat(info.subscriptions.yearly.usd)} or ₹${currencyFormat(Math.round(info.subscriptions.yearly.usd*currConversions.rates.INR))}/ year</b>
                </div>
                
            </div>
        </div>

        <div class="push-right">
            <div class="btn btn-primary pointer subscribe-button">
                <label class="m-0 pointer">Subscribe</label>
            </div>
        </div>

        <div class="mt-1 small">
            ${details}    
        </div>
        
    </div>`;
}

const setApps = function () {

    apps.sort(function (a, b) {
        if (a.name > b.name) return -1;
        return 1;
    });

    apps.filter(a => a.user_types.indexOf("healthcare-provider") > -1 && a.type==="app").forEach(async (element, indx) => {

        let details = "";

        try {

            details = await $.get(`/gfs/apps/details/${element._id}.html`);

            let html = setAppLayout(element,details);

            $('#subscriptions-per-app-container').append(html);

        } catch (error) {
            console.log(error);

        }

    });
};

const setPackages=function(){

    let pkgs=apps.filter(a => a.user_types.indexOf("healthcare-provider") > -1 && a.type==="package");

    pkgs.forEach(async (element, indx) => {

        let details = "";

        try {

            details = await $.get(`/gfs/apps/details/${element._id}.html`);

            let html = setAppLayout(element,details);

            $('#subscriptions-per-package-container').append(html);

        } catch (error) {
            console.log(error);

        }

    });
};

const showPaymentMethodEntryPopUp=function(){
    let html=`<div class="p-2 text-center"><img style="width:100px;" src="/gfs/images/payments/payment_method.png"></div>
        <b class="mt-2">No Payment Method found</b>
        <div class="mt-2">
            Click 
            <a href="/payments">here <i class="material-icons small-icon align-middle">launch</i></a> 
            to add payment method, or contact us for any questions.
        </div>`;
    popup.onScreenAllowClose(html);
}

//bind subscribe button 
$('body').on('click','.subscribe-button',function(){
    
    let _id=$(this).closest('.subscription-tile').attr('itemid');
    let info=apps.filter(a=>a._id===_id)[0];    

    popup.onScreen("checking for payment method");

    //check if customer credit information is saved 
    $.post('/payment/api/customer/get', {
        "registration_number": userInfo.registration_number
    }).then(customer=>{
        if(customer==="customer-not-found"){
            popup.remove();

            //if account doesnt exists - point user to payment method page and ask to add payment method 
            showPaymentMethodEntryPopUp();
        }else{
            //show the confirmation messgae on how much amount will be charged 
            showConfirmationChargePopUp();
        }
    }).fail(err=>{
        popup.remove();
    });

});

//********************* */
//EXECUTE METHODS 
var currConversions={};
var apps=[];
var userInfo={};

$.post('/account/api/user/verifytoken').then(user => {
    userInfo=user;
    return getCurrenyConversion();

}).then(curr => {
    return $.getJSON("/gfs/apps/apps.json");

}).then(sysApps => {

    apps = sysApps;

    setApps();
    setPackages();

});

