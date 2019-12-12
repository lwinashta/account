//MARK THE SELECTED PAGE
$('#homepg-top-nav a[href="/"] .hpg-menu-item').addClass('hpg-menu-item-sel');

//*** MEHODS */
const setAccountDetails=()=>{

    console.log(runtime);

    const getType=()=>{

        let registrationinfo=runtime.userInfo.registrationinfo[0];
        let payment=runtime.userInfo.payment;

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
        
        }else if(registrationinfo.registrationtype==='oi_standard_monthly'){
            let lastTransaction=runtime.userInfo.transactions[runtime.userInfo.transactions.length-1];
            let lastTransactionEndDate=new Date(lastTransaction.subscription.billingPeriodEndDate);
            let lastTransactionEndDateString=`${runtime.months[lastTransactionEndDate.getMonth()]} ${lastTransactionEndDate.getDate()}, ${lastTransactionEndDate.getFullYear()}`;
            
            return `<div>
                    <div class="info-row-content">
                    <div>Standard Account - Monthly Subscription 
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

}

const setPaymentMethods=()=>{

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

}

/** UPLOAD PROFILE IMAGE */
const uploadProfileImg=()=>{
    let uploadImgForm = document.getElementById('update-profile-img-form');
    if ($(uploadImgForm).length > 0) {
        uploadImgForm.onsubmit = function (e) {
            e.preventDefault();
            let d = new FormData(uploadImgForm);
            $.ajax({
                "url": '/api/global/account/user/upload-profile-image',
                "method": 'post',
                "data": d,
                "processData": false,
                "contentType": false,
            }).done((response) => {
                console.log(response);
                window.location.reload();

            }).fail(function (err) {
                console.log(err);
            });
        };

        $('#update-profile-img-input').on('change', function (e) {
            if ($(this).val().length > 0) {
                $(this).closest('form').submit();
            }
        });
    }
}

$.post('/api/global/account/user/bytoken').then(function(userinfo){

    runtime.userInfo=userinfo;

    if(userinfo.registrationinfo[0].registrationtype!=="oi_standard_free"){
        //-- get the user payment information 
        return $.post('/payment/api/customer/get',{
            "registrationNum": userinfo.registrationnum
        });
    }else{
        runtime.userInfo.paymentDetails=null;
        runtime.userInfo.transactions=null;

        //set accunt detils & payment method
        $('#summary-account-info-container').html(setAccountDetails());
        $('#summary-payment-info-container').html(setPaymentMethods());

        //set payment method to null
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

//TRIGGER FUNCTIONS ON LOAD
uploadProfileImg();