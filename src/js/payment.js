import {healthcareProviderActions as actions} from './healthcare-provider-form-actions.js';
import {formjs} from '/gfs/utilities/lib/js/form.js';

var userPaymentInformation={};
var userInfo={};
var paymentInstance={};

const _formjs=new formjs();


const getUserPaymentInformation=function(){

    return new Promise((resolve,reject)=>{
        
        if(Object.keys(userPaymentInformation).length>0){
            resolve(userPaymentInformation);

        }else{
            //check if customer information exists 
            $.post('/payment/api/customer/get', {
                "registration_number": userInfo.registration_number
            }).done(customer=>{
                if(customer==="customer-not-found"){
                    resolve("customer-not-found");
                }else{
                   userPaymentInformation=customer;
                    resolve(userPaymentInformation); 
                }
            });
        }
    });
    
};

const createUserPaymentGateway=function(data){
    return $.post('/payment/api/customer/create', {
        "id": userInfo.registration_number,
        "paymentMethodNonce": data.nonce,
        "firstName": data.first_name,
        "lastName": data.last_name,
        "email": userInfo.email_id
    });
};

const getUserBillingAddress=function(data){
    let address={};
    if($('#same-as-address-personal-address').prop('checked')){
        address.streetAddress=userInfo.personal_address_street_address_1;
        address.locality=userInfo.personal_address_city;
        address.region=userInfo.personal_address_state;
        address.postalCode=userInfo.personal_address_zip_code;
        address.countryCodeAlpha2=userInfo.personal_address_country;
    }else{
        address.streetAddress=data.billing_address_street_address_1;
        address.locality=data.billing_address_city;
        address.region=data.billing_address_state;
        address.postalCode=data.billing_address_zip_code;
        address.countryCodeAlpha2=data.billing_address_country;
    }

    return address;
}

const createUserBillingAddress=function(data){
    //create customer address 
    //check if personal address same as billing address 
    let address=getUserBillingAddress(data);

    return $.post('/payment/api/address/create', {
        "customerId": userInfo.registration_number,
        "firstName": data.first_name,
        "lastName": data.last_name,
        "streetAddress": address.streetAddress,
        "locality": address.locality,
        "region": address.region,
        "postalCode": address.postalCode,
        "countryCodeAlpha2": address.countryCodeAlpha2
    });
};  

const createNewPaymentMethod=function(data){
    return $.post('/payment/api/paymentmethod/create', {
        "customerId": userInfo.registration_number,
        "paymentMethodNonce": data.nonce
    });
    
}



const setPaymentMethodsLayout=function(data){
    let html="";
    if(data==="customer-not-found"){
        html=`<div class="mt-3 text-center">
            <img style="width:100px;" src="/gfs/images/payments/payment_method.png">
            <div class="mt-3">
                <div class="text-medium">No Payment Methods are associated to your account. </div>
                <div class="btn btn-primary mt-2 add-payment-method switch-pg-section"
                    showel="add-payment-method-container">
                    <label class="m-0 pointer">Add Payment Method</label>
                </div>
            </div>
        </div>`;
    }else{
        data.creditCards.forEach(element => {
           html=`<div class="shadow rounded p-3 border bg-white mt-3 position-relative">
                <div>
                    <div class="d-inline-block">
                        <img style="width: 80px;" src="${element.imageUrl}" 
                        aria-hidden="true">
                    </div>
                    <div class="d-inline-block ml-3 align-top">
                        <div class="text-medium">${element.cardType} •••• ${element.last4}</div>
                        <div class="text-small text-muted">Expires ${element.expirationMonth}/${element.expirationYear}</div>
                    </div>
                </div>
                <div class="push-right">
                    <div class="btn btn-link mr-2">
                        <label class="m-0 pointer">Remove</label>
                    </div>
                    ${element.default?``:`<div class="btn btn-warning">
                        <label class="m-0 pointer">Make Default</label>
                    </div>`}
                </div>
                ${element.default?`<div class="mt-2 pt-2 border-top text-muted text-small"> 
                    <i class="material-icons align-middle font-weight-bold mr-2" style="color:darkgreen">check</i>This is default card. This card will be used for any subscriptions or future transactions with us.
                </div>`:''}
            </div>`;     
        });
    }

    $('#payment-method-content-outer-container').html(html);

};

const setPaymentDropIn = function () {
    var paymentInstance = {};
    return new Promise((resolve,reject)=>{
        $.post('/payment/api/token/get').then(function (token) {
            braintree.dropin.create({
                authorization: token,
                selector: '#payment-dropin-container'
            }, function (err, instance) {
                if (err) throw err;
                paymentInstance = instance;
                resolve(paymentInstance);
            });
        }).fail(function (err) {
            alert("error in initalizing payment gateway");
            reject(err);
            console.error(err);
        });
    });
};

const goBackToPaymentMethods=function(){
    $('.pg-section').addClass('d-none');
    $('#payment-dropin-container').html('');
    $('#associated-payment-methods-container').removeClass('d-none');
};

const refreshPaymentMethods=function(){
    return new Promise((resolve,reject)=>{
        getUserPaymentInformation().then(paymentmethods=>{
            console.log(paymentmethods);
            setPaymentMethodsLayout(paymentmethods);
            resolve('payment methods refreshed');
        }).catch(err=>{
            console.log(err);
            reject(err);
        });
    });
};



/**
 * BINDEVENTS
 */

 //** Switch between (show / hide) the page sections on button click */
$('body').on('click','.switch-pg-section',function(){
    let showel=$(this).attr('showel');
    $('.pg-section').addClass('d-none');
    $('#'+showel).removeClass('d-none');
});

// Add Payment Button - Navigates to payment method form
$('body').on('click','.add-payment-method',function(){
    popup.onScreen("Loading...");
    setPaymentDropIn().then(instance=>{
        paymentInstance=instance;
        popup.remove(); 
    }).catch(err=>{
        console.log(err);
        popup.remove();
    });
});

//--- BIND THE CONUNTRY DROP DOWN 
actions.bindFields.setCountryDropDownField($('.country-name-option-list'));

//-- BILLING ADDRESS SAME AS PERSONAL ADDRESS
$('#same-as-address-personal-address').change(function(){

    if($(this).prop('checked')){
        $('#billing-address').find('input,select')
            .attr('disabled','disabled').attr('data-required','0');

    }else{
        $('#billing-address').find('input,select')
            .removeAttr('disabled')
            .not('[name="billing_address_street_address_2"]')
            .attr('data-required','1');
    }
});

//Cancel payment method - on the payment method form pgsection
$('#cancel-payment-method').click(e=>{
    goBackToPaymentMethods();
});

//SAVE payment method 
$('#save-payment-method').click(function(e){

    let form = $('#add-payment-method-container');

    //--- validate the form -- 
    let validation = _formjs.validateForm(form, 'entry-field');

    //-- get the payment request method ---
    paymentInstance.requestPaymentMethod(async function (err, payload) {

        try {

            popup.onScreen("Saving Payment Information");

            if (validation > 0 || err) throw "validation error";

            let customer = await getUserPaymentInformation();

            let formData = {};
            $(form).find('.entry-field').each(function () {
                formData = Object.assign(formData, _formjs.getFieldData(this));
            });

            formData.nonce = payload.nonce;

            //customer-not-found = customer doesnt exists in payment gateway
            if (customer === "customer-not-found") {
                //if customer doesnt exists add customer information and get customer id 
                //once we get customer id add customer cc information 

                //add new customer
                let newCustomer=await createUserPaymentGateway(formData);

                //add customer address
                let newCustomerAddress=await createUserBillingAddress(formData);

                popup.remove();

                popup.onRightTop("Payment method was added successfully");

                goBackToPaymentMethods();

            } else {
                //check if customer address alreay exists 
                //if yes - dont add new address. If no add new address 
                let address=getUserBillingAddress(data);

                //check if address exists 
                if(customer.streetAddress===address.streetAddress 
                        && customer.locality===address.locality 
                        && customer.region===address.region 
                        && customer.postalCode===address.postalCode 
                        && customer.countryCodeAlpha2===address.countryCodeAlpha2){
                            console.log('address exists ');
                }else{
                    //insert new address 
                }
                
                //add customer card 

            }

        } catch (error) {
            console.log(error);
            popup.remove();
        }

    });
    

});

//******************* */
//EXECUTE METHODS 
popup.onScreen("Loading...");
$.post('/account/api/user/verifytoken').then(user => {
    userInfo=user;
    //get payment methods

    return refreshPaymentMethods();

}).then(paymentMethods => {

    console.log(paymentMethods);
    popup.remove();

}).fail(err=>{
    console.log(err);
    popup.remove();
});
