import {healthcareProviderActions as actions} from './healthcare-provider-form-actions.js';
import {formjs} from '/efs/utilities/lib/js/form.js';

var userPaymentInformation={};
var userInfo={};
var paymentInstance={};

const _formjs=new formjs();

const refreshPaymentMethods=function(){
    return new Promise((resolve,reject)=>{
        //check if customer information exists 
        $.post('/payment/api/customer/get', {
            "registration_number": userInfo.registration_number
        }).done(customer=>{
            userPaymentInformation=customer;

            if(userPaymentInformation==="customer-not-found"){
                resolve(userPaymentInformation);
                return false;
            }

            //-- push the default credit card on top 
            let getDefaultCCIndx=userPaymentInformation.creditCards.findIndex(cc=>cc.default===true);
            let getDefaultCCInfo=userPaymentInformation.creditCards.filter(cc=>cc.default===true)[0];

            userPaymentInformation.creditCards.splice(getDefaultCCIndx,1);
            userPaymentInformation.creditCards.splice(0,0,getDefaultCCInfo);

            resolve(userPaymentInformation);

        }).catch(err=>{
            console.log(err);
            reject(err);
        });
    });
};

const createUserPaymentGateway=function(data){
    return $.post('/payment/api/customer/create', {
        "id": userInfo.registration_number,
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
};

const getUserMatchingAddress=function(currentBilling,existingAddresses){
    let matchingAddress=[];
    existingAddresses.forEach(addr=>{

        if(addr.streetAddress===currentBilling.streetAddress 
            && addr.locality===currentBilling.locality 
            && addr.region===currentBilling.region 
            && addr.postalCode===currentBilling.postalCode 
            && addr.countryCodeAlpha2===currentBilling.countryCodeAlpha2){
                
                matchingAddress.push(addr);
        }

    });

    return matchingAddress;
};

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
        "paymentMethodNonce": data.nonce,
        "billingAddressId": data.addressId
    });
}

const markAsDefaultPaymentMethod=function(data){
    return $.post('/payment/api/paymentmethod/markasdefault', {
        "token": data.token
    });
}

const deletePaymentMethod=function(data){
    return $.post('/payment/api/paymentmethod/delete', {
        "token": data.token
    });
}

const setUserCreditCardsLayout=function(data){
    let html="";
    if(data==="customer-not-found"){
        html=`<div class="mt-3 text-center">
            <img style="width:100px;" src="/efs/core/images/payments/payment_method.png">
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
           html+=`<div class="shadow rounded p-3 border bg-white mt-3 position-relative cc-row" 
                    globalId="${element.globalId}">
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
                    <div class="btn btn-link mr-2 remove-payment-method">
                        <label class="m-0 pointer">Remove</label>
                    </div>
                    ${element.default?``:`<div class="btn btn-warning mark-default-payment-method">
                        <label class="m-0 pointer">Make Default</label>
                    </div>`}
                </div>
                ${element.default?`<div class="mt-2 pt-2 border-top text-muted text-small"> 
                    <i class="material-icons align-middle font-weight-bold mr-2" style="color:darkgreen">check</i>This is default card. This card will be used for any subscriptions or future transactions.
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

    const refreshCC=function(){
    
        refreshPaymentMethods().then(pym=>{
    
            setUserCreditCardsLayout(pym);
    
            popup.remove();
            goBackToPaymentMethods();
    
            popup.onRightTop("Payment method was added successfully");
            
        });
    };

    //-- get the payment request method ---
    paymentInstance.requestPaymentMethod(async function (err, payload) {

        try {

            popup.onScreen("Saving Payment Information");

            if (validation > 0 || err) throw "validation error";

            let customer = await userPaymentInformation;

            let formData = {};
            $(form).find('.entry-field').each(function () {
                formData = Object.assign(formData, _formjs.getFieldData(this));
            });

            formData.nonce=payload.nonce;

            //customer-not-found = customer doesnt exists in payment gateway
            if (customer === "customer-not-found") {
                //if customer doesnt exists add customer information and get customer id 
                //once we get customer id add customer cc information 

                //add new customer
                let newCustomer=await createUserPaymentGateway(formData);

                //add customer address
                let newCustomerAddress=await createUserBillingAddress(formData);

                console.log(newCustomerAddress);

                //create customer payment methods using payment nonce
                formData.addressId=newCustomerAddress.address.id;
                let newCustomerPaymentMethod=await createNewPaymentMethod(formData);

            } else {
                //check if customer address alreay exists 
                //if yes - dont add new address. If no add new address 
                let address=getUserBillingAddress(formData);

                //check if user 
                let getMatchingAddr=getUserMatchingAddress(address,customer.addresses);

                //check if address exists 
                if(getMatchingAddr.length>0){
                    formData.addressId=getMatchingAddr[0].id;
                    let newCustomerPaymentMethod=await createNewPaymentMethod(formData);

                }else{
                    //insert new address 
                    //add customer address
                    let newCustomerAddress=await createUserBillingAddress(formData);

                    //create customer payment methods
                    formData.addressId=newCustomerAddress.address.id;
                    let newCustomerPaymentMethod=await createNewPaymentMethod(formData);
                }
                
            }

            refreshCC();

        } catch (error) {
            console.log(error);
            popup.remove();
        }

    });
    

});

//REMOVE THE PAYMENT METHOD 
$('#payment-method-content-outer-container').on('click','.remove-payment-method',function(){
    let globalId=$(this).closest('.cc-row').attr('globalId');
    let ccInfo=userPaymentInformation.creditCards.filter(cc=>cc.globalId===globalId)[0];
    let token=ccInfo.token;

    const showConfirmation = function () {
        //show confirmation id user want to delete the payment method 
        popup.messageBox({
            message: "Are you sure to remove the payment method?",
            buttons: [{
                    "label": "Yes",
                    "class": "btn-danger",
                    "id": "yes-button",
                    "callback": function () {
                        popup.remove(); //remove the confirmation pop up 
                        popup.onScreen("Deleting Payment Method");
                        deletePaymentMethod({
                            token: token
                        }).then(item => {
                            console.log(item);
                            return refreshPaymentMethods();

                        }).then(cc => {
                            setUserCreditCardsLayout(cc);
                            popup.remove();
                            popup.onRightTop("Payment method removed");

                        }).fail(err => {
                            console.log(err);
                        });
                    }
                },
                {
                    "label": "No",
                    "class": "btn-link",
                    "id": "no-button",
                    "callback": function () {
                        popup.remove(); //remove the confirmation pop up 
                    }
                }
            ]
        });
    }

    //check if cc has any associated subscriptions. If yes user cannot delete the credit card. 
    if (ccInfo.subscriptions.length > 0) {
        popup.messageBox({
            message: `<i class="material-icons align-middle" style="color:red">report_problem</i>Payment Method is associated to subscriptions 
                <div class='small'>
                     Please add another default payment method to avoid your subscriptions to be canceled.
                     If you <b>PROCEED</b>, all associated subscriptions will be <b>CANCELED</b>.
                     <div>Please click here to view our subscription policy.</div> 
                </div>`,
            buttons: [{
                    "label": "Proceed",
                    "class": "btn-danger",
                    "id": "yes-button",
                    "callback": function () {
                        popup.remove();
                        showConfirmation();
                    }
                },
                {
                    "label": "No",
                    "class": "btn-link",
                    "id": "no-button",
                    "callback": function () {
                        popup.remove(); //remove the confirmation pop up 
                    }
                }
            ]
        });
    }else{
        showConfirmation();
    } 
    
});

//MAKE AS DEFAULT PAYMENT TYPE 
$('#payment-method-content-outer-container').on('click','.mark-default-payment-method',function(){
    
    let globalId=$(this).closest('.cc-row').attr('globalId');
    let token=userPaymentInformation.creditCards.filter(cc=>cc.globalId===globalId)[0].token;

    //show confirmation id user want to delete the payment method 
    popup.messageBox({
        message:"Are you sure to mark it as default payment method?",
        buttons:[{
                "label":"Yes",
                "class":"btn-danger",
                "id":"yes-button",
                "callback":function(){
                    popup.remove();//remove the confirmation pop up 
                    popup.onScreen("Updating Payment Method");
                    
                    markAsDefaultPaymentMethod({
                        token:token
                    }).then(item=>{
                        //console.log(item);
                        return refreshPaymentMethods();
                
                    }).then(cc=>{
                        setUserCreditCardsLayout(cc);
                        popup.remove();
                        popup.onRightTop("Payment method updated");

                    }).fail(err=>{
                        console.log(err);
                    });
                }
            },
            {
                "label":"No",
                "class":"btn-link",
                "id":"no-button",
                "callback":function(){
                    popup.remove();//remove the confirmation pop up 
                }
            }
        ]
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
    setUserCreditCardsLayout(paymentMethods);
    popup.remove();

}).fail(err=>{
    console.log(err);
    popup.remove();
});
