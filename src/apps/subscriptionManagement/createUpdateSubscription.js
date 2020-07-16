import React, { useEffect, useState, useContext } from "react";
import { UserInfo } from "../../contexts/userInfo";
import { Modal, ConfirmationBox } from "@oi/reactcomponents";
const moment=require('moment');

export const CreateUpdateSubscription=({planBillingFrequency="",subscriptionName=""})=>{
    
    let contextValues=useContext(UserInfo);

    const [showNewSubscriptionConfirmationBox,setNewSubscriptionConfirmationBoxFlag]=useState(false);
    const [showNoPaymentMethodPopup,setNoPaymentMethodPopupFlag]=useState(false);
    
    const [canceledButValidSubscription,setCanceledButValidSubscription]=useState({});
    
    const [selectedPlan, setSelectedPlan] = useState({});
    const [selectedSubscription, setSelectedSubscription] = useState({});

    const [trialPeriod,setTrialPeriod]=useState(null);
    const [firstBillingDate,setFirstBillingDate]=useState(null);

    const [downgradeOrUpgrade,setDowngradeOrUpgrade]=useState(null);

    /**
     * @Create New Subscription
     * @Creat New Subscription No Trial: If user has already subscribed, then cancels the subscription and then tries to subscribe again
     */
    //Step 1:
    const handleNewSubscriptionClick=(params)=>{

        //check if payment exists for the user. If yes go next otherwise show error message
        if(contextValues.userPaymentAccount.paymentMethods.length===0){
            setNoPaymentMethodPopupFlag(true);
        }else{

            if("trialPeriod" in params){
                setTrialPeriod(params.trialPeriod);
            }

            if('firstBillingDate' in params){
                setFirstBillingDate(params.firstBillingDate)
            }

            let getValidCanceledSubscription=checkIfCanceledSubcriptionStillValid();
            let newSubscriptionPlan=contextValues.subscriptionPlanByCountry[planBillingFrequency];

            setCanceledButValidSubscription(getValidCanceledSubscription);
            setSelectedPlan(newSubscriptionPlan);
            setSelectedSubscription(params.subscriptionInfo);

            //check if its downgrade or upgrade 
            let currentStoredSubscriptionPlanId=contextValues.storedUserAccountSubscriptions.length>0?contextValues.storedUserAccountSubscriptions[0].plan_id:null;
            let currentSubscriptionPlan=currentStoredSubscriptionPlanId!==null?contextValues.subscriptionPlans.filter(p=>p.id===currentStoredSubscriptionPlanId)[0]:null;

            //-- check the subscriptin change 
            if(currentStoredSubscriptionPlanId!==null 
                && currentSubscriptionPlan.billingFrequency>newSubscriptionPlan.billingFrequency 
                && currentSubscriptionPlan.price > newSubscriptionPlan.price){
                    //downgrade  
                    console.log('downgrade');
                    setDowngradeOrUpgrade("downgrade");

            }else if(currentStoredSubscriptionPlanId!==null 
                && currentSubscriptionPlan.billingFrequency<newSubscriptionPlan.billingFrequency 
                && currentSubscriptionPlan.price < newSubscriptionPlan.price){
                    //updgrade - With current subscription plans. 
                    //We just have set the firstBillingDate to be subscription end date
                    console.log("upgrade");
                    setDowngradeOrUpgrade("upgrade");

            }else {
                console.log('same/new');
            }

            setNewSubscriptionConfirmationBoxFlag(true);

        }
        
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

    const calcDiscountAmount=()=>{
        
        //Calc # of months remaining in billing cycle: E.g., 8m / cost per mont ~ $26
        let today=moment();
        let billingEndDate=moment(selectedSubscription.nextBillingDate);

        let remainingMonths=billingEndDate.diff(today,'months');
        let billingFrequency= contextValues.subscriptionPlans.filter(p=>p.id===subscriptionInfo.planId)[0].billingFrequency;

        let costPerMonth=parseFloat(selectedSubscription.price)/billingFrequency;

        //Cost for new Subscription = $30
        let newSubscriptionCost=selectedPlan.price;

        //Cost owe to customer = 8 * 26 = 208
        let costOwe=remainingMonths*costPerMonth;

        //Discount to be added = 208 - 30 = 178 in discounts
        //Discounts will be used till the discount is zero 
        return costOwe;
    }

    //Step 2: Creation
    const createNewSubscription=(params)=>{

        popup.onScreen("Subscribing...");

        //** New Subscription**
        let subscriptionPayload = {
            "planId": selectedPlan.id,
            "paymentMethodToken": contextValues.userPaymentAccount.paymentMethods.filter(p => p.default)[0].token,
            "merchantAccountId": contextValues.subscriptionPlanByCountry.merchantAccountId,
        };

        //** Cancel Trial Period */
        if (!trialPeriod) {
            subscriptionPayload.trialPeriod=false;
            subscriptionPayload.trialDuration=0;
        }

        //** Renew Subscription from end of sub cancellation date  */
        if(firstBillingDate!==null){
            subscriptionPayload.firstBillingDate=new Date(firstBillingDate)
        }

        /** If the downgradeOrUpgrade=== "downgrade"; 
         * create subscription with the discount */
        if(downgradeOrUpgrade==="downgrade"){
            let discountAmount=calcDiscountAmount();
            subscriptionPayload.discounts={
                "add":[
                    {
                        inheritedFromId: "by3g",
                        amount: "20.00"
                      }
                ]
            }
        }

        $.ajax({
            "url":'/payment/subscription/create',
            data:JSON.stringify(subscriptionPayload),
            method:"POST",
            processData:false,
            contentType:"application/json; charset=utf-8"
        }).then(subscribed=>{
            
            //console.log(subscribed);
            if(!subscribed.success) throw 'error';

            $.ajax({
                url:'/account/api/subscription/create',
                method:"POST",
                processData:false,
                contentType:"application/json; charset=utf-8",
                data:JSON.stringify({
                    "registration_number":contextValues.userInfo.registration_number,
                    "subscription_id":subscribed.subscription.id,
                    "subscription_name":subscriptionName,
                    "plan_id":subscribed.subscription.planId,
                    "status":subscribed.subscription.status,
                    "subscription_end_date":null,
                    "history":[
                        {
                            "subscription_id":subscribed.subscription.id,
                            "plan_id":subscribed.subscription.planId,
                            "status":subscribed.subscription.status,
                            "subscription_end_date":null
                        }
                    ]
                })
            });

        }).then(dbResponse=>{
            console.log(dbResponse)
            setNewSubscriptionConfirmationBoxFlag(false);

            popup.remove();
            popup.onBottomCenterSuccessMessage("Subscribed.");

            window.location.reload();

        }).catch(function(error){
            console.log(error);
            popup.onBottomCenterErrorOccured("Error occured while subscribing");

        });
    }
    
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
                                    <div>Subscription will renew automatically from <b>{moment(checkIfCanceledSubcriptionStillValid().subscription_end_date).format('DD MMM YYYY')}</b></div>
                                    <div>Previous subscription is still valid.</div>
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
                                        <div>Subscription will automatically start from {moment(getSubscriptionEndDate()).format('DD MMM YYYY')}</div>
                                        <div>Previous subscription is still valid.</div>
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
                        <ConfirmationBox >
                                <div className="p-2">
                                    <h4>Confirm Subscription</h4>
                                    <div className="mt-2 text-capitalize">{selectedPlan.name}</div>
                                    <div className="mt-2 text-left">
                                        <div>
                                            {   
                                                //if trialPeriod is not allowed
                                                !trialPeriod?
                                                <div>
                                                    <div>
                                                        You are not eligible for trial period. You will be charged the subscription amount of 
                                                        <span className="text-danger"> {userCurentLocationByIp.currency.native} {selectedPlan.price}</span>  
                                                        <b className="text-success ml-1">
                                                            {firstBillingDate!==null?
                                                                <span>
                                                                    on {moment(firstBillingDate).format('DD MMM YYYY')}
                                                                </span>:
                                                                <span> today {moment().format('DD MMM YYYY')}</span>
                                                            }
                                                        </b>
                                                    </div>
                                                    <div className="mt-2 small">Feel free to contact us for any concerns or question.</div>
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
                                            <div className="small">
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
                            </ConfirmationBox> : null
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