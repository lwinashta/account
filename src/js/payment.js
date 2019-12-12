//MARK THE SELECTED PAGE
$('#homepg-top-nav a[href="/payment"] .hpg-menu-item').addClass('hpg-menu-item-sel');

//INITIAL DATA LOAD 
const dataLoad=async function(){

    this.loadContent=()=>{
        //set accunt detils & payment method
        $('#account-info-container').html(runtime.setAccountDetails());
        $('#payment-method-info-container').html(runtime.setPaymentMethods());
        $('#payment-transactions-info-container').html(runtime.setTransactions());
    }

    try {
        // get user info 
        runtime.userInfo = await runtime.getUserInfo();

        //check if the user registration type. free registration doesnt require any credit card
        if (runtime.userInfo.registrationinfo[0].registrationtype !== "oi_standard_free") {

            //-- get the user payment information 
            runtime.userInfo.paymentDetails = await runtime.getCustomerInfo();

            runtime.userInfo.transactions=await runtime.getCustomerTransactions();

            this.loadContent();

        } else {
            runtime.userInfo.paymentDetails = null;
            runtime.userInfo.transactions = null;

            this.loadContent();

            //set payment method to null
            throw "no payment method stored";
        }
    } catch (error) {
        console.error(error);
    }
};

//EXECUTION 
dataLoad();