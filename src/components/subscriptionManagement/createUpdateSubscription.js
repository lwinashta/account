import React, { useEffect, useState, useContext } from "react";
import { UserInfo } from "../../contexts/userInfo";
import { Modal, ConfirmationBox } from "@oi/reactcomponents";
import * as PaymentFunctions from "../reusable/paymentFunctions";
const moment=require('moment');

export const CreateUpdateSubscription=({planBillingFrequency="",subscriptionName=""})=>{
    
    let contextValues=useContext(UserInfo);

    const [showNewSubscriptionConfirmationBox,setNewSubscriptionConfirmationBoxFlag]=useState(false);
    const [showNoPaymentMethodPopup,setNoPaymentMethodPopupFlag]=useState(false);
    
    const [canceledButValidSubscription,setCanceledButValidSubscription]=useState({});
    
    const [selectedPlan, setSelectedPlan] = useState({});
    const [currentSelections, setCurrentSelections] = useState({});

    const [trialPeriod,setTrialPeriod]=useState(null);
    const [firstBillingDate,setFirstBillingDate]=useState(null);


    /**
     * @Create New Subscription
     * @Creat New Subscription No Trial: If user has already subscribed, then cancels the subscription and then tries to subscribe again
     * 1. Check 
     */
    //Step 1:
    const handleNewSubscriptionClick = (params) => {

        //Retrieve user stored information again and check the selected plan isnot already canceled 
        //if selected plan is already canceled, refresh the page
        PaymentFunctions.checkIfCachedSubsciptionIsValid(contextValues.userInfo.registration_number, "elite subscription",contextValues.storedUserAccountSubscriptions).then(response => {
           
            console.log(response);
            //check if the status for the selected plan is active
            //To cancel subscription the rpevious value must active or pending 
            //check if payment exists for the user. If yes go next otherwise show error message
            if (Object.keys(contextValues.userPaymentAccount).length === 0 || contextValues.userPaymentAccount.paymentMethods.length === 0) {
                setNoPaymentMethodPopupFlag(true);
            } else {

                if ("trialPeriod" in params) {
                    setTrialPeriod(params.trialPeriod);
                }

                if ('firstBillingDate' in params) {
                    setFirstBillingDate(params.firstBillingDate)
                }

                let planChangeType = "";
                let getValidCanceledSubscription = checkIfCanceledSubcriptionStillValid();
                let newSubscriptionPlan = contextValues.subscriptionPlanByCountry[planBillingFrequency];

                setCanceledButValidSubscription(getValidCanceledSubscription);
                setSelectedPlan(newSubscriptionPlan);

                //check if its downgrade or upgrade 
                let _currentSubscription = contextValues.storedUserAccountSubscriptions.length > 0 ? contextValues.storedUserAccountSubscriptions[0] : null;
                let currentSubscriptionPlan = _currentSubscription !== null ? contextValues.subscriptionPlans.filter(p => p.id === _currentSubscription.plan_id)[0] : null;
                let _setCurrentSelections = {};

                //-- check the subscriptin change 
                if (currentSubscriptionPlan !== null
                    && currentSubscriptionPlan.billingFrequency > newSubscriptionPlan.billingFrequency
                    && currentSubscriptionPlan.price > newSubscriptionPlan.price) {
                    //downgrade  
                    console.log('downgrade');
                    planChangeType = "downgrade";

                    _setCurrentSelections = {
                        "storedSubscription": _currentSubscription,
                        "gatewaySubscription": contextValues.userSubscriptions.subscriptions.filter(s => s.id === _currentSubscription.subscription_id),
                        "currentPlan": currentSubscriptionPlan,
                        "newPlan": newSubscriptionPlan,
                    };


                } else if (currentSubscriptionPlan !== null
                    && currentSubscriptionPlan.billingFrequency < newSubscriptionPlan.billingFrequency
                    && currentSubscriptionPlan.price < newSubscriptionPlan.price) {
                    //updgrade - With current subscription plans. 
                    //We just have set the firstBillingDate to be subscription end date
                    console.log("upgrade");
                    planChangeType = "upgrade";
                    _setCurrentSelections = {
                        "storedSubscription": _currentSubscription,
                        "gatewaySubscription": contextValues.userSubscriptions.subscriptions.filter(s => s.id === _currentSubscription.subscription_id),
                        "currentPlan": currentSubscriptionPlan,
                        "newPlan": newSubscriptionPlan,
                    };

                } else {
                    console.log('same/new');
                    planChangeType = null;
                    _setCurrentSelections = {
                        "storedSubscription": _currentSubscription,
                        "gatewaySubscription": contextValues.userSubscriptions.subscriptions.length > 0 && _currentSubscription!==null?
                            contextValues.userSubscriptions.subscriptions.filter(s => s.id === _currentSubscription.subscription_id) : null,
                        "currentPlan": currentSubscriptionPlan,
                        "newPlan": newSubscriptionPlan,
                    };
                }
                console.log(_setCurrentSelections);

                let _downgradeUpgradeParams = setDowngradeUpgradeParams(planChangeType, _setCurrentSelections);

                if (planChangeType === "upgrade" && _downgradeUpgradeParams.recentTransactionState !== "void_current_transaction") {

                    let setUpgradeBillinDate = _setCurrentSelections.storedSubscription.subscription_end_date !== null ?
                        _setCurrentSelections.storedSubscription.subscription_end_date :
                        _setCurrentSelections.gatewaySubscription[0].nextBillingDate;

                    setFirstBillingDate(setUpgradeBillinDate);

                    //If the current trasaction can be voided the billing date should be todays date
                } else if (planChangeType === "upgrade" && _downgradeUpgradeParams.recentTransactionState === "void_current_transaction") {
                    setFirstBillingDate(null);
                }

                setCurrentSelections(Object.assign(_setCurrentSelections, _downgradeUpgradeParams));

                setNewSubscriptionConfirmationBoxFlag(true);

            }

        }).catch(err => {
            console.log(err);
            popup.onBottomCenterErrorOccured("Error Occured. Reloading App.");
            contextValues.refreshApp();
        });

    }

    const setDowngradeUpgradeParams=(planChangeType,_currentSelections)=>{
        let _checkRecentTransactionState=checkRecentTransactionState(_currentSelections);
        let amount=0;
        
        if(planChangeType==="downgrade" 
            && (_checkRecentTransactionState.state==="execute_next_step" 
                || _checkRecentTransactionState.state==="subscription_with_balance_no_transactions")){
            //calc downgrade amount 
            amount=calcDiscountAmount(_currentSelections);

        }else if(planChangeType==="upgrade" 
            && (_checkRecentTransactionState.state==="execute_next_step" 
            || _checkRecentTransactionState.state==="subscription_with_balance_no_transactions")){
            //No upgrade amount. 
            //firstBillinDate will be adjusted
            amount=calcUpgradeAmount(_currentSelections);
        }

        return {
            planChangeType:planChangeType,
            recentTransactionState:_checkRecentTransactionState.state,
            recentTransaction:_checkRecentTransactionState.recentTransaction,
            amount:amount
        }
    }

    const checkRecentTransactionState=(params)=>{

        let _gatewaySubscription=params.gatewaySubscription!==null 
            && params.gatewaySubscription.length>0?params.gatewaySubscription[0]:null;
        let state="";
        let recentTransaction=params.gatewaySubscription!==null 
                && _gatewaySubscription.transactions.length >0 
                ? _gatewaySubscription.transactions[_gatewaySubscription.transactions.length-1]
                :null;

        //Downgrade or upgrade can happen only if the current trasaction is valid and is settled.
        //Otherwise transaction can be voided or if no transaction subscription can be updaged without any discounts or add-ons
        if(params.gatewaySubscription!==null 
            && recentTransaction!==null 
            && (recentTransaction.status==="settling" 
            || recentTransaction.status==="settled")) {

            //calculate Discount/Upgrade amount
            state= "execute_next_step";

        }else if(params.gatewaySubscription!==null 
            && recentTransaction!==null 
            && (recentTransaction.status==="submitted_for_settlement" 
            || recentTransaction.status==="settlement_pending")) {
            
            state= "void_current_transaction";

        }else if(params.gatewaySubscription!==null 
            && _gatewaySubscription.transactions.length ===0 
            && parseFloat(_gatewaySubscription.amount)===0){
            
            state= "in_trial_period";

        }else if(params.gatewaySubscription!==null 
            && _gatewaySubscription.transactions.length ===0 
            && parseFloat(_gatewaySubscription.amount)<0){

            state= "subscription_with_balance_no_transactions";

        }else{
            state= "new_transaction";
        }

        return {
            state:state,
            recentTransaction:recentTransaction
        }
    }

    const calcUpgradeAmount=(params)=>{
        
        //Calc # of months remaining in billing cycle: E.g., 8m / cost per mont ~ $26
        let today=moment();
        let gatewaySubscription=params.gatewaySubscription[0];

        let balance=parseFloat(gatewaySubscription.balance);
        let newPlanPrice=parseFloat(params.newPlan.price);

        let amount=newPlanPrice+balance;
        
        return amount;
    }

    const calcDiscountAmount=(params)=>{
        
        //Calc # of months remaining in billing cycle: E.g., 8m / cost per mont ~ $26
        let today=moment();
        let gatewaySubscription=params.gatewaySubscription[0];
        let balance=parseFloat(gatewaySubscription.balance);

        //Current subscription information 
        let billingEndDate=moment(gatewaySubscription.nextBillingDate);

        let remainingMonths=billingEndDate.diff(today,'months');
        let currentPlan= contextValues.subscriptionPlans.filter(p=>p.id===gatewaySubscription.planId)[0];
        
        let billingFrequency=currentPlan.billingFrequency;

        let costPerMonth=parseFloat(currentPlan.price)/billingFrequency;

        //Cost owe to customer = 8 * 26 = 208
        let costOwe=-(remainingMonths*costPerMonth)+balance;
        
        console.log(costOwe);

        //Discount to be added = 208 - 30 = 178 in discounts
        //Discounts will be used till the discount is zero 
        return costOwe;
    }

    const checkIfCanceledSubcriptionStillValid=function(planId=""){
        let today=moment();
        let isValid={};
        contextValues.storedUserAccountSubscriptions.forEach((ci,indx)=>{
            if("subscription_end_date" in ci && ci.status==="Canceled"  && (planId.length>0?ci.plan_id===planId:true)){
                if(moment(ci.subscription_end_date).diff(today,'days')>0){
                    isValid=ci;
                }
            }
        });
        //console.log(isValid);
        return isValid;
    };

    const getSubscriptionEndDate=function(planId=""){
        let storedSubscriptionIsValid=checkIfCanceledSubcriptionStillValid(planId);

        if(Object.keys(storedSubscriptionIsValid).length>0 && 'subscription_end_date' in storedSubscriptionIsValid){
            return storedSubscriptionIsValid.subscription_end_date;
        }else{
            return null
        }
    }

    //Step 2: Creation
    const createNewSubscription = async (params) => {
        try {
            popup.onScreen("Subscribing...");

            //** New Subscription**
            let subscriptionPayload = {
                "planId": selectedPlan.id,
                "paymentMethodToken": contextValues.userPaymentAccount.paymentMethods.filter(p => p.default)[0].token,
                "merchantAccountId": contextValues.subscriptionPlanByCountry.merchantAccountId,
            };

            //** Cancel Trial Period */
            if (!trialPeriod) {
                subscriptionPayload.trialPeriod = false;
                subscriptionPayload.trialDuration = 0;
            }

            //** Renew Subscription from end of sub cancellation date  */
            if (firstBillingDate !== null) {
                subscriptionPayload.firstBillingDate = new Date(firstBillingDate);
            }

            /** If the currentSelections.planChangeType=== "downgrade"; 
             * create subscription with the discount */
            if ((currentSelections.planChangeType === "downgrade" || currentSelections.planChangeType === "upgrade")
                && currentSelections.amount!==0 
                && currentSelections.amount<0) {
                    
                        subscriptionPayload.discounts = {
                            "add": [
                                {
                                    inheritedFromId: "by3g",
                                    amount: Math.abs(currentSelections.amount.toFixed(2))
                                }
                            ]
                }

            } else if((currentSelections.planChangeType === "downgrade" || currentSelections.planChangeType === "upgrade")
                && currentSelections.amount!==0 
                && currentSelections.amount>0){
                    subscriptionPayload.addOns = {
                        "add": [
                            {
                                inheritedFromId: "t3km",
                                amount: Math.abs(currentSelections.amount).toFixed()
                            }
                        ]
                    }

            }
            
            if (currentSelections.recentTransactionState === "void_current_transaction") {
                //void current transaction and create new susbcription 
                let _voidTransaction=await PaymentFunctions.voidTransaction(currentSelections.recentTransaction.id);
                console.log(_voidTransaction);
                if(_voidTransaction.success) throw new Error('trasaction did not void');
            }

            //cancel the previous subscription if exists 
            if(currentSelections.gatewaySubscription!==null 
                && currentSelections.gatewaySubscription[0].status!=="Canceled"
                && currentSelections.newPlan!==null ){
                let cancelCurrentSubscription=await $.post('/payment/subscription/cancel', {
                    "subscriptionId": currentSelections.gatewaySubscription[0].id
                });
                if(!cancelCurrentSubscription.success) throw new Error('subscription failed',subscribed);
            }

            //Subscribe new subscription 
            let subscribed = await $.ajax({
                "url": '/payment/subscription/create',
                data: JSON.stringify(subscriptionPayload),
                method: "POST",
                processData: false,
                contentType: "application/json; charset=utf-8"
            });

            console.log(subscribed);
            if (!subscribed.success) throw new Error('subscription failed');

            let storedSubscription=await $.ajax({
                url: '/account/api/subscription/create',
                method: "POST",
                processData: false,
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify({
                    "registration_number": contextValues.userInfo.registration_number,
                    "subscription_id": subscribed.subscription.id,
                    "subscription_name": subscriptionName,
                    "plan_id": subscribed.subscription.planId,
                    "status": subscribed.subscription.status,
                    "subscription_end_date": null,
                    "history": [
                        {
                            "subscription_id": subscribed.subscription.id,
                            "plan_id": subscribed.subscription.planId,
                            "status": subscribed.subscription.status,
                            "subscription_end_date": null
                        }
                    ]
                })
            });

            console.log(storedSubscription);

            setNewSubscriptionConfirmationBoxFlag(false);

            popup.remove();
            popup.onBottomCenterSuccessMessage("Subscribed.");

            contextValues.refreshApp();

        } catch (error) {
            console.log(error);
            popup.onBottomCenterErrorOccured("Error occured while subscribing");

        }

    }

    //get details to be displayed on the confirmation box and also in the email 
    const getTransactionConfirmationDetails=()=>{
        //console.log(currentSelections);
        let currency=contextValues.userCurentLocationByIp.currency.native;
        let selectedPlanPrice=parseFloat(selectedPlan.price);
        let balance=currentSelections.gatewaySubscription!==null && currentSelections.gatewaySubscription.length>0?
            parseFloat(currentSelections.gatewaySubscription[0].balance):0;

        if(currentSelections.recentTransactionState==="void_current_transaction"){
            return <div>
                <div className="position-relative border-bottom mt-2">
                    <div className="w-75 d-inline-block">Subscription charge </div>
                    <div className="push-right text-primary t-0"> {currency} {selectedPlanPrice}</div>
                </div>
                <div className="position-relative mt-2">
                    <div className="w-75 d-inline-block">Total </div>
                    <div className="push-right text-danger t-0"> {currency} {selectedPlanPrice}</div>
                </div>
                <div className="text-muted mt-2">
                    Please note, your recent transaction of amount <span className="ml-1 text-danger">{currency}{currentSelections.recentTransaction.amount}</span> still not processed, we will be voiding you current transaction and new subscription will be created with new charges.
                </div>

            </div>
        
        } else if (currentSelections.planChangeType === "downgrade" && currentSelections.amount !== 0) {

            let prefixNeg = currentSelections.amount < 0 ? "-" : "";
            let amountInString=Math.abs(currentSelections.amount).toFixed(2);
            let total = (selectedPlanPrice + currentSelections.amount).toFixed(2);

            return <div>
                <div className="position-relative border-bottom mt-2">
                    <div className="w-75 d-inline-block">Subscription charge </div>
                    <div className="push-right text-primary t-0"> {currency} {selectedPlanPrice}</div>
                </div>
                {
                    currentSelections.amount < 0 ?
                        <div className="position-relative border-bottom mt-2">
                            <div className="w-75 d-inline-block">
                                <div>Downgrade/Discount Amount </div>
                                {
                                    balance !== 0 ?
                                        <div className="small text-muted">Includes subscription balance of ({balance})</div> : null
                                }
                            </div>
                            <div className="push-right text-primary t-0">{prefixNeg} {currency} {amountInString}</div>
                        </div> :
                        <div className="position-relative border-bottom mt-2">
                            <div className="w-75 d-inline-block">Add On charges</div>
                            <div className="push-right text-primary t-0">{prefixNeg} {currency} {amountInString}</div>
                        </div>
                }
                <div className="position-relative mt-2">
                    <div className="w-75 d-inline-block">Total </div>
                    <div className="push-right text-danger t-0"> {total < 0 ? "-" : ""} {currency} {Math.abs(total)}</div>
                </div>
            </div>

        } else if (currentSelections.planChangeType === "upgrade" && currentSelections.amount !== 0) {
            
            let total=(balance+selectedPlanPrice).toFixed(2);

            return <div className="small">
                    <div className="position-relative border-bottom mt-2">
                        <div className="w-75 d-inline-block">Subscription charge </div>
                        <div className="push-right text-primary t-0"> {currency} {selectedPlanPrice}</div>
                    </div>
                    {
                        balance!==0?
                        <div className="position-relative border-bottom mt-2">
                            <div className="w-75 d-inline-block">
                                <div>Subscription balance </div>
                                <div className="push-right text-primary t-0">
                                    {balance<0?"-":""}
                                    {currency} 
                                    {Math.abs(balance)}
                                </div>
                            </div>
                        </div>:null
                    }
                    <div className="position-relative mt-2">
                        <div className="w-75 d-inline-block">Total charges</div>
                        <div className="push-right text-danger t-0">
                            {total<0?"-":""}
                            {currency} 
                            {Math.abs(total)}
                        </div>
                    </div>
                </div>  
        }else{
            return <div>
                <div className="position-relative border-bottom">
                    <div className="w-75 d-inline-block ">Subscription charge </div>
                    <div className="push-right text-primary t-0"> {currency} {selectedPlanPrice}</div>
                </div>
                <div className="position-relative mt-2">
                    <div className="w-75 d-inline-block">Total </div>
                    <div className="push-right text-danger t-0"> {currency} {selectedPlanPrice}</div>
                </div>
            </div>
        }
        
    };
    
    //Step 3: Clean up on mondal/confirmation box close 
    useEffect(()=>{
        if(!showNewSubscriptionConfirmationBox){
            setSelectedPlan({});
            setTrialPeriod(null);
        }

    },[showNewSubscriptionConfirmationBox]);

    return (
        <UserInfo.Consumer>
            {({
                subscriptionPlanByCountry={},
                userPaymentAccount={},
                userSubscriptions={},
                userCurentLocationByIp={},
                storedUserAccountSubscriptions=[]
            })=>{
                return <div className="text-center">
                    {
                        //No Active Subscriptions or transactions. New User.
                        //Subscription with trial
                        userSubscriptions.subscriptions.length===0?
                            <div className="btn btn-sm btn-success pointer" 
                                onClick={()=>{handleNewSubscriptionClick({
                                    "mode":"new"
                                })}}>  Try with 1 Month free  </div>
                        :
                        //No Active Subscriptions Exists in Gateway. For the current package
                        //check the storedUserSubscription, if canceled subscription is still valid  
                        //Renewal of new subscription will startr after the subscription cancellation date of the cancelled subscription
                        userSubscriptions.subscriptions.filter(s => (s.status === "Active" || s.status === "Pending") && s.planId === subscriptionPlanByCountry[planBillingFrequency].id).length===0 
                            && Object.keys(checkIfCanceledSubcriptionStillValid(subscriptionPlanByCountry[planBillingFrequency].id)).length>0?
                            <div>
                                <div className="small text-muted">
                                    <div>Previous subscription is still valid.</div>
                                    <div>If you renew, the subscription will renew automatically from <b>{moment(checkIfCanceledSubcriptionStillValid().subscription_end_date).format('DD MMM YYYY')}</b></div>
                                </div>
                                <div className="btn btn-sm btn-info pointer mt-2" onClick={()=>{
                                    handleNewSubscriptionClick({
                                        "trialPeriod":false,
                                        "firstBillingDate":getSubscriptionEndDate(subscriptionPlanByCountry[planBillingFrequency].id)
                                    })
                                }}>Renew Subscription</div>
                            </div>
                        :
                        //No Active subscriptions for the selected plan
                        //The stored current subscription is with same plan id. OR if the current subscription is with sam eplan id the subscription is already ended.
                        userSubscriptions.subscriptions.filter(s => (s.status === "Active" || s.status === "Pending") && s.planId === subscriptionPlanByCountry[planBillingFrequency].id).length===0 
                        && (Object.keys(checkIfCanceledSubcriptionStillValid(subscriptionPlanByCountry[planBillingFrequency].id)).length===0 || 
                            (storedUserAccountSubscriptions.length>0 
                                    && storedUserAccountSubscriptions[0].plan_id!==subscriptionPlanByCountry[planBillingFrequency].id)) ?
                        <div className="w-75 mx-auto">
                            {
                                getSubscriptionEndDate()!==null?
                                    <div className="small text-muted">
                                        <div>Previous subscription is still valid.</div>
                                        <div>If you subscribe, the subscription will automatically start from {moment(getSubscriptionEndDate()).format('DD MMM YYYY')}</div>
                                    </div>:
                                null
                            }
                            <div className="btn btn-sm btn-success pointer mt-2" onClick={()=>{
                                handleNewSubscriptionClick({
                                    trialPeriod:false,
                                    firstBillingDate:getSubscriptionEndDate()
                                })
                            }}> Subscribe Today </div>
                        </div>
                        :
                        //No scenario matches for the creation of new subscription
                        null
                    }
                    {
                       showNewSubscriptionConfirmationBox? 
                        <Modal header={<h4>Confirm Subscription</h4>} 
                        onCloseHandler={()=>{setNewSubscriptionConfirmationBoxFlag(false)}}>
                                <div className="p-2">
                                    <div className="mt-2 text-capitalize">{selectedPlan.name}</div>
                                    <div className="mt-2 text-left">
                                        <div>
                                            {   
                                                //if trialPeriod is not allowed
                                                !trialPeriod?
                                                <div>
                                                    <div>
                                                        <div>You are not eligible for trial period.</div>
                                                        <div className="mt-2">
                                                            {firstBillingDate!==null?
                                                                <span>
                                                                    You will be charged on 
                                                                    <span className="ml-1 text-success"> {moment(firstBillingDate).format('DD MMM YYYY')} </span>
                                                                </span>:
                                                                <span> You will be charged today 
                                                                    <span className="ml-1 text-success"> {moment().format('DD MMM YYYY')}</span>
                                                                </span>
                                                            }
                                                        </div>   
                                                        <div className="mt-3 mb-3">
                                                            <div className="text-primary font-weight-bold">Transaction Details</div>
                                                            <div className="ml-2 mr-2">{getTransactionConfirmationDetails()}</div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2">Feel free to contact us for any concerns or question.</div>
                                                </div>:
                                                <div>
                                                    <b className="text-primary">{selectedPlan.trialDuration} {selectedPlan.trialDurationUnit}</b>
                                                        <span className="ml-1">
                                                            free trial and after that you will be charged the subscription amount of <span className="text-danger">{userCurentLocationByIp.currency.native} {selectedPlan.price}</span> on
                                                        <b className="text-success ml-1">{moment().add(selectedPlan.trialDuration, "months").format('DD MMM YYYY')}</b>
                                                        </span>
                                                </div>
                                            }
                                            
                                        </div>
                                        <div className="text-left mt-2">
                                            <div>
                                                Your default payment method will be used for this subscription. 
                                                If you would like to change the default payment method, click <a href="/payment-management">here</a> to manage your payments.  
                                            </div>
                                                {
                                                    userPaymentAccount.paymentMethods.filter(p=>p.default).map(pym=>{
                                                        return  <div key={pym.globalId} className="d-flex mt-2">
                                                            <div>
                                                                <img style={{ width: "80px" }} src={pym.imageUrl} aria-hidden="true" />
                                                            </div>
                                                            <div className="ml-3 align-top">
                                                                <div>{pym.cardType} •••• {pym.last4}</div>
                                                                <div className="text-small text-muted">Expires {pym.expirationMonth}/{pym.expirationYear}</div>
                                                            </div>
                                                        </div>
                                                    })
                                                }
                                                
                                        </div>
                                        <div className="text-right mt-2">
                                            <div className="d-inline-block btn btn-primary btn-sm pointer" onClick={()=>{createNewSubscription()}}> Subscribe </div>
                                            <div className="d-inline-block ml-2 btn-sm btn-link pointer" onClick={()=>{setNewSubscriptionConfirmationBoxFlag(false)}}> Cancel</div>
                                        </div>
                                    </div>
                                </div>
                            </Modal> : null
                    }

                    {
                        showNoPaymentMethodPopup?
                        <ConfirmationBox>
                            <div className="p-2">
                                <h4>No Payment Method</h4>
                                <div className="mt-2 text-muted">
                                    There is no payment method associated to your account. 
                                    Please add payment method before susbcribing for our services.
                                </div>
                                <div className="text-right mt-2">
                                    <a href="/payment-management">
                                        <div className="d-inline-block btn-sm btn btn-primary">Add Payment Method</div>
                                    </a>
                                    <div className="d-inline-block ml-3 btn-link pointer small" onClick={()=>{setNoPaymentMethodPopupFlag(false)}}>Cancel</div>
                                </div>
                            </div>
                        </ConfirmationBox>:null
                    }
                </div>
                
            }}
        </UserInfo.Consumer> 
    );
}