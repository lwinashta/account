
export const getStoredUserAccountSubscriptions=(regNum="",subscriptionName="elite subscription")=>{
    return $.getJSON('/account/api/subscription/get',{
        "registration_number":regNum,
        "subscription_name":subscriptionName
    });
};

export const checkIfCachedSubsciptionIsValid=(regNum="",subscriptionName="elite subscription",cachedValue=[])=>{
    return new Promise((resolve,reject)=>{
        getStoredUserAccountSubscriptions(regNum,subscriptionName).then((response)=>{
            console.log(response,cachedValue);

            if(response.length===cachedValue.length && response.length===0){
                console.log("length");
                resolve("match");

            }else if(response.length===cachedValue.length && response.length > 0 
                && JSON.stringify(response[0])===JSON.stringify(cachedValue[0])){
                
                console.log("string matches");
                resolve("match");

            }else{
                reject("error in data integrity");
            }
        })
    });
}

export const getPlans=function () {
    return $.post('/payment/plans/getall');
};

export const getUserPaymentAccount=(regNum)=>{
    return $.post('/payment/customer/get', {
        "registration_number": regNum
    });
};

//Transaction is voided or refunded depending on the status 
//If transaction status in not settled, the transaction can be voided and whole refund is provided to the user 
//If trasaction is already settled, the remaing balance amount is refunded 
export const voidTransaction=(transactionId) => {
    return $.post('/payment/transaction/void', {
        "transactionId": transactionId
    });
};

export const refundTransaction=(transactionId, amount) => {
    return $.post('/payment/transaction/refund', {
        "transactionId": transactionId,
        "amount": amount.toString()
    });
};

