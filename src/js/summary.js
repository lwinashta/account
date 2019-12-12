//MARK THE SELECTED PAGE
$('#homepg-top-nav a[href="/"] .hpg-menu-item').addClass('hpg-menu-item-sel');


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

//INITIAL DATA LOAD 
async function dataLoad(){
    try {
        // get user info 
        runtime.userInfo = await runtime.getUserInfo();

        //check if the user registration type. free registration doesnt require any credit card
        if (runtime.userInfo.registrationinfo[0].registrationtype !== "oi_standard_free") {

            //-- get the user payment information 
            runtime.userInfo.paymentDetails = await runtime.getCustomerInfo();

            runtime.userInfo.transactions=await runtime.getCustomerTransactions();

            $('#summary-account-info-container').html(runtime.setAccountDetails());
            $('#summary-payment-info-container').html(runtime.setPaymentMethods());

        } else {
            runtime.userInfo.paymentDetails = null;
            runtime.userInfo.transactions = null;

            //set accunt detils & payment method
            $('#summary-account-info-container').html(runtime.setAccountDetails());
            $('#summary-payment-info-container').html(runtime.setPaymentMethods());

            //set payment method to null
            throw "no payment method stored";
        }
    } catch (error) {
        console.error(error);
    }
    


}

//TRIGGER FUNCTIONS ON LOAD
uploadProfileImg();

// Trigger data load 
dataLoad();