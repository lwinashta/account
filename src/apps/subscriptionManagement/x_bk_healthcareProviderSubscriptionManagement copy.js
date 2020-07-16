import React, { useEffect, useState, useContext } from "react";
import { UserInfo } from "../../contexts/userInfo";
import { Modal, ConfirmationBox } from "@oi/reactcomponents";
const moment=require('moment');

export const HealthcareProviderSubscriptionManagement=()=>{
    
    let contextValues=useContext(UserInfo);

    const [showNewSubscriptionConfirmationBox,setNewSubscriptionConfirmationBoxFlag]=useState(false);
    const [showCancelSubscriptionConfirmationBox,setCancelSubscriptionConfirmationBoxFlag]=useState(false);
    const [showNoPaymentMethodPopup,setNoPaymentMethodPopupFlag]=useState(false);
    const [showCanceledSubscriptionsIsValidBox,setShowCanceledSubscriptionsIsValidBoxFlag]=useState(false);
    //const [showUpgradeSubscriptionConfirmationBox,setNoTrialSubscriptionConfirmationBoxFlag]=useState(false);

    const [selectedPlan,setSelectedPlan]=useState({});
    const [selectedSubscription,setSelectedSubscription]=useState({});
    const [subscriptionUpdateMode,setSubscriptionUpdateMode]=useState({});

    const [canceledButValidSubscription,setCanceledButValidSubscription]=useState({});
    
    const [merchantAccountId,setMerchantAccountId]=useState("");
    const [trialPeriod,setTrialPerid]=useState(null);

    /**
     * @Create New Subscription
     * @Creat New Subscription No Trial: If user has already subscribed, then cancels the subscription and then tries to subscribe again
     */
    //Step 1:
    const handleNewSubscriptionClick=(params)=>{

        //check if payment exists for the user. If yes go next otherwise show error message
        if(params.paymentInfo.length===0){
            setNoPaymentMethodPopupFlag(true);
        }else{

            setMerchantAccountId(params.subscriptionPlanByCountry[params.billingFrequency].merchantAccountId)
            setSelectedPlan(params.subscriptionPlanByCountry[params.billingFrequency]);

            if("trialPeriod" in params){
                setTrialPerid(params.trialPeriod);
            }

            //Check if user still has active susbcription 
            $.getJSON('/account/api/subscription/get',{
                registration_number:contextValues.userInfo.registration_number
            
            }).then(subscriptions=>{
                //console.log(subscriptions);
                if(subscriptions.length>0 ){
                    let checkIfCanceledButValid=checkIfCancellationDatePast(subscriptions);

                    if(checkIfCanceledButValid.length>0){
                        //show confirmation box for user to decide if they still wana subcribe for the services
                        setCanceledButValidSubscription(checkIfCanceledButValid[0]);
                        setShowCanceledSubscriptionsIsValidBoxFlag(true);
                    }else{
                        setNewSubscriptionConfirmationBoxFlag(true);
                    }
                    
                }else{
                    setNewSubscriptionConfirmationBoxFlag(true);
                }

            });

        }
        
    }

    const checkIfCancellationDatePast=function(subscriptions){
        let today=moment();
        return subscriptions.reduce((acc,ci)=>{
            if("subscription_cancellation_date" in ci){
                if(moment(ci.subscription_cancellation_date).diff(today,'days')>0){
                    acc.push(ci);
                }
            }
            return acc;
        },[])
    };

    //Step 2: Creation
    const createNewSubscription=(params)=>{

        popup.onScreen("Subscribing...");
        let susbcriptionStartDate=new Date();

        //** New Subscription**
        let subscriptionPayload = {
            "planId": selectedPlan.id,
            "paymentMethodToken": params.paymentInfo.filter(p => p.default)[0].token,
            "merchantAccountId": merchantAccountId,
        };

        if (!trialPeriod) {
            subscriptionPayload.trialPeriod=false;
            subscriptionPayload.trialDuration=0;
        }

        if(Object.keys(canceledButValidSubscription).length>0){
            subscriptionPayload.firstBillingDate=new Date(canceledButValidSubscription.subscription_cancellation_date)
            susbcriptionStartDate=subscriptionPayload.firstBillingDate;
        }

        $.post('/payment/subscription/create',subscriptionPayload).then(subscribed=>{
            
            //console.log(subscribed);
            if(!subscribed.success) throw 'error';

            return $.post('/account/api/subscription/create',{
                "registration_number":contextValues.userInfo.registration_number,
                "subscription_id":subscribed.subscription.id,
                "plan_id":subscribed.subscription.planId,
                "status":subscribed.subscription.status,
                "subscription_start_date":susbcriptionStartDate
            });

        }).then(dbResponse=>{

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
        if(!showNewSubscriptionConfirmationBox && !showCancelSubscriptionConfirmationBox){
            setSelectedPlan({});
            setSelectedSubscription({});
            setMerchantAccountId("");
            setTrialPerid(null);
            setCanceledButValidSubscription({});
            setSubscriptionUpdateMode("");
        }

    },[showNewSubscriptionConfirmationBox,showCancelSubscriptionConfirmationBox]);

    /**
     * @Cancel Subscription
     */
    //Step 1:
    const handleCancelSubscriptionClick=(params)=>{

        //check if payment exists for the user. If yes go next otherwise show error message
        setSelectedPlan(params.subscriptionPlanByCountry[params.billingFrequency]);
        setSelectedSubscription(params.subscriptionInfo);
        setCancelSubscriptionConfirmationBoxFlag(true);
    }

    // Cancels the subscription and updates the subscription status 
    // and cancellation date in the application db
    const cancelSubscription=function(cancellationDate=""){
        let subscriptionId=selectedSubscription.id;
        popup.onScreen("Cancelling Subscription...");
        
        $.post('/payment/subscription/cancel',{
            "subscriptionId":subscriptionId

        }).then(function(canceledSubscription){
            //console.log(canceledSubscription);
            return $.ajax({
                "url":'/account/api/subscription/update',
                method:"POST",
                data:JSON.stringify(
                    {
                        "query":{
                            subscription_id:canceledSubscription.subscription.id,
                            registration_number:contextValues.userInfo.registration_number
                        },
                        "set":{
                            status:canceledSubscription.subscription.status,
                            subscription_cancellation_date:cancellationDate.length>0?cancellationDate:selectedSubscription.billingPeriodEndDate
                        }
                    }
                ),
                processData:false,
                contentType:"application/json; charset=utf-8"
            });

        }).then(dbResponse=>{
            console.log(dbResponse);
            setCancelSubscriptionConfirmationBoxFlag(false);

            popup.remove();
            popup.onBottomCenterSuccessMessage("Subscription Cancelled");

            window.location.reload();

        }).catch(err=>{
            popup.onBottomCenterErrorOccured("Error occured while cancellation");
        });
    };

    //Calculates the refund amount if user cancels the Yearly Subscription
    //Refund is not processed for monthly subscription
    const calcRefundAmountOnCancellation=()=>{
        //Step 1: Check if any trasactions has been processed for the subscription
        //If no transactions then the subscriptions can be "cancelled since the subscription is still in trial mode 
        
        //Step 2: if trasaction exists, calc refund amount 
        //Once amount is calculated 
        //console.log(selectedSubscription);
        let today=moment();
        let billingPeriodEndDate=moment(selectedSubscription.billingPeriodEndDate);

        //# of days diff 
        let diff=billingPeriodEndDate.diff(today,"months");//E.g., 5 months
        let balance=parseFloat(selectedSubscription.balance);//0.00

        //get price per month
        let price=parseFloat(selectedSubscription.price);//total subscription price: $320
        let pricePerMonth=parseFloat(price/selectedPlan.billingFrequency);//$320/12 = 26.66

        //Refun amount = price per month * remiaing months in billing cycle
        let refundAmount=(balance+(pricePerMonth*diff)).toFixed(2);//26.66*5=$133.33

        //Calculation 
        return refundAmount;

    }

    //Executes Refund Process on confirmation by user 
    const processRefundOnCancellation=()=>{
        let refundAmount=calcRefundAmountOnCancellation();
        popup.onScreen("Cancelling Subscription");
        
        if(refundAmount>0){
            voidOrRefundTransaction(refundAmount).then(refundResponse=>{
                console.log(refundResponse);
                return cancelSubscription(getYearlySubscriptionEndDate().format());

            }).then(cancelled=>{
                popup.remove();
                console.log(cancelled);
                
                /**@SendEmailPending on subscription cancellation */

            })

        }else{
            cancelSubscription(moment().endOf("month"));
        }
    }

    //Transaction is voided or refunded depending on the status 
    //If transaction status in not settled, the transaction can be voided and whole refund is provided to the user 
    //If trasaction is already settled, the remaing balance amount is refunded 
    const voidOrRefundTransaction=(refundAmount)=>{
        //Processing Refund 
        let transaction=selectedSubscription.transactions[selectedSubscription.transactions.length-1];
        //check transaction status and refund or void the transaction 
        //If status is submitted_for_settlement or settlement_pending
        //The transaction can only be voided, since the trnsaction is not cmpleted or settled
        if(transaction.status==="submitted_for_settlement" || transaction.status==="settlement_pending"){
            //void transacton 
            return $.post('/payment/transaction/void',{
                "transactionId":transaction.id
            });
        }else{
            //refund
            return $.post('/payment/transaction/refund',{
                "transactionId":transaction.id,
                "amount":refundAmount.toString()
            });
        }
    }

    //Calculates the subscription end date. 
    //Monthly suncriptions is cancelled at the end of the next billing cycle 
    //Yealry subscription is cancelled if the transaction cannot be voided. YEalry subscription stays active till end of next billDate and then canceled
    const getYearlySubscriptionEndDate=()=>{
        let today=moment();
        console.log(selectedSubscription.transactions[selectedSubscription.transactions.length-1]);
        if(today.date()>=selectedSubscription.billingDayOfMonth 
            && selectedSubscription.transactions[selectedSubscription.transactions.length-1].status!=="submitted_for_settlement" 
            && selectedSubscription.transactions[selectedSubscription.transactions.length-1].status!=="settlement_pending"){
            return today.add(1,'months').date(selectedSubscription.billingDayOfMonth);
        }else{
            return today.date(selectedSubscription.billingDayOfMonth);
        }
    }

    /**
     * @UpgradeDowngrade subscription
     * subscriptionPlanByCountry:subscriptionPlanByCountry,
        billingFrequency:"monthly",
        trialPeriod:false,
        paymentInfo:userPaymentAccount.paymentMethods,
        subscriptionInfo:userSubscriptions.subscriptions.filter(s=>s.status==="Active" && s.planId!==subscriptionPlanByCountry.monthly.id)[0]
     */
    const handleSubscriptionChange=(params)=>{

        //Set States 
        setSelectedSubscription(params.subscriptionInfo);
        setSelectedPlan(params.subscriptionPlanByCountry[params.billingFrequency]);
        setTrialPerid(params.trialPeriod);

        let newSubscriptionAmount=params.subscriptionPlanByCountry[params.billingFrequency].price;
        let newSubscriptionBillingFrequency=params.subscriptionPlanByCountry[params.billingFrequency].billingFrequency
        
        let currentSubscriptionAmount=subscriptionInfo.price;
        let currentSubscriptionBillingFrequency=contextValues.subscriptionPlans.filter(p=>p.id===subscriptionInfo.planId)[0].billingFrequency;

        if(newSubscriptionBillingFrequency<currentSubscriptionBillingFrequency){
            //Downgrade. 
            //1. Calculate discounts.
            //2. Cancel current subscription. 
            //3. Create new subscription with discount amount
            setSubscriptionUpdateMode("downgrade");

        }else if(newSubscriptionBillingFrequency>currentSubscriptionBillingFrequency){
            //Upgrade. 
            //1. Create new subscription firstBillingDate = NextBillingDate of current Subscription
            //2. Cancel current subscription - But subscription will continue till end of billing cycle 
            //Subscription start date is going to be NextBillingDate
            setSubscriptionUpdateMode("upgrade");

        }else if(newSubscriptionBillingFrequency===currentSubscriptionBillingFrequency){
            //Same billing frequency. Prorate amount
            //Currentl we dont have this scnerio. 
            setSubscriptionUpdateMode("prorate");
        }
    
    }

    const calcDownGradeAmount=()=>{
        
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

    /**
     * @UpgradeSubscription 
     */
    const handleSubscriptionUpgrade=(params)=>{
        console.log();
    }

    const handleNewWithCanceledButValidSubscription=()=>{
        //Show the new subscription pop 
        setShowCanceledSubscriptionsIsValidBoxFlag(false);
        setNewSubscriptionConfirmationBoxFlag(true);

    }

    return (
        <UserInfo.Consumer>
            {({subscriptionPlanByCountry={},
                userCurentLocationByIp={},
                userPaymentAccount={},
                userSubscriptions={},
                subscriptionPlans=[]
            })=>{
                return <div>

                    <div className="text-center">
                        <h5 >Elite Subscription Plans</h5>
                        <div>Subscribe today to get all that you need to manage your practice.</div>
                    </div>
        
                    <div className="row mt-2">
        
                        <div className="col-sm-12 col-md-6 col-lg-6">
        
                            <div className="border mt-2 p-2 bg-white rounded position-relative" style={{ height: '160px' }}>
                                <div className="text-center">
                                    <div className="font-weight-bold text-center">Monthly Subscription</div>
                                    <div>
                                        <span>{userCurentLocationByIp.currency.native} {subscriptionPlanByCountry.monthly.price}/ Monthly</span>
                                    </div>
                                </div>
                                <div className="position-absolute w-100 text-center pointer" style={{ bottom: '15px' }}>
                                    {
                                        userSubscriptions.subscriptions.length>0 ?
                                            //** Active Monthly subscription exists */
                                            userSubscriptions.subscriptions.findIndex(s=>s.planId===subscriptionPlanByCountry.monthly.id && (s.status==="Active" || s.status==="Pending"))>-1?
                                                <div>
                                                    <div className="text-muted small mt-1">Subscribed on {moment(userSubscriptions.subscriptions.filter(s=>s.planId===subscriptionPlanByCountry.monthly.id && (s.status==="Active" || s.status==="Pending"))[0].createdAt).format('DD MMM YYYY')}</div>
                                                    <div className="btn btn-sm btn-danger" onClick={()=>{handleCancelSubscriptionClick({
                                                        subscriptionPlanByCountry:subscriptionPlanByCountry,
                                                        billingFrequency:"monthly",
                                                        subscriptionInfo:userSubscriptions.subscriptions.filter(s=>s.planId===subscriptionPlanByCountry.monthly.id && (s.status==="Active" || s.status==="Pending"))[0]
                                                    })}}>Cancel Subscription</div>
                                                </div>:

                                            //** Active subscription exists. But its not monthly subscription. This is downgrade service */
                                            userSubscriptions.subscriptions.findIndex(s=>(s.status==="Active" || s.status==="Pending") && s.planId!==subscriptionPlanByCountry.monthly.id)>-1?   
                                                <div className="btn btn-sm btn-primary" onClick={()=>{handleSubscriptionChange({
                                                    subscriptionPlanByCountry:subscriptionPlanByCountry,
                                                    billingFrequency:"monthly",
                                                    trialPeriod:false,
                                                    paymentInfo:userPaymentAccount.paymentMethods,
                                                    subscriptionInfo:userSubscriptions.subscriptions.filter(s=>s.status==="Active" && s.planId!==subscriptionPlanByCountry.monthly.id)[0]
                                                })}}>
                                                    <div>Update to Monthly Today</div>
                                                </div>:
                                            
                                            //** No Active Subscriptions */
                                            <div className="btn btn-sm btn-success" onClick={()=>{handleNewSubscriptionClick({
                                                subscriptionPlanByCountry:subscriptionPlanByCountry,
                                                billingFrequency:"monthly",
                                                trialPeriod:false,
                                                paymentInfo:userPaymentAccount.paymentMethods
                                            })}}> Subscribe Today  </div>
                                        :
                                        /** No active subscriptions and trsactions. New user */
                                        <div className="btn btn-sm btn-success" onClick={()=>{handleNewSubscriptionClick({
                                            subscriptionPlanByCountry:subscriptionPlanByCountry,
                                            billingFrequency:"monthly",
                                            paymentInfo:userPaymentAccount.paymentMethods
                                        })}}>  Try with 1 Month free  </div>
                                    }
                                    
                                </div>
                            </div>
        
                        </div>
        
                        <div className="col-sm-12 col-md-6 col-lg-6">
                            <div className="border mt-2 p-2 bg-white rounded position-relative" style={{ height: '160px' }}>
                                <div className="text-center">
                                    <div className="font-weight-bold ">Yearly Subscription</div>
                                    <div>
                                        <div>
                                            <span style={{ textDecoration: 'line-through' }} className="text-danger">{userCurentLocationByIp.currency.native} 360.00 </span>
                                            <span>{userCurentLocationByIp.currency.native} {subscriptionPlanByCountry.yearly.price} / Yearly  </span>
                                        </div>
                                            <div className="small">Save 10% by subscribing yearly</div>
                                    </div>
                                </div>
                                <div className="position-absolute w-100 text-center pointer" style={{ bottom: '15px' }}>
                                    {
                                        userSubscriptions.subscriptions.length>0?
                                            //** Active yearly subscription exists */
                                            userSubscriptions.subscriptions.findIndex(s=>s.planId===subscriptionPlanByCountry.yearly.id && s.status==="Active")>-1?
                                                <div>
                                                    <div className="text-muted small mt-1">Subscribed on {moment(userSubscriptions.subscriptions.filter(s=>s.planId===subscriptionPlanByCountry.yearly.id && (s.status==="Active" || s.status==="Pending"))[0].createdAt).format('DD MMM YYYY')}</div>
                                                    <div className="btn btn-sm btn-danger" onClick={()=>{handleCancelSubscriptionClick({
                                                        subscriptionPlanByCountry:subscriptionPlanByCountry,
                                                        billingFrequency:"yearly",
                                                        subscriptionInfo:userSubscriptions.subscriptions.filter(s=>s.planId===subscriptionPlanByCountry.yearly.id && (s.status==="Active" || s.status==="Pending"))[0]
                                                    })}}>Cancel Subscription</div>
                                                </div>:
                                            //** Active subscription exists. But not yearly subscription. */ 
                                            //** User is allowed to upgrade the subscription to yearly */
                                            userSubscriptions.subscriptions.findIndex(s=>(s.status==="Active" || s.status==="Pending") && s.planId!==subscriptionPlanByCountry.yearly.id)>-1?   
                                                <div className="btn btn-sm btn-warning" onClick={()=>{handleSubscriptionUpgrade({
                                                    subscriptionPlanByCountry:subscriptionPlanByCountry,
                                                    billingFrequency:"monthly",
                                                    trialPeriod:false,
                                                    paymentInfo:userPaymentAccount.paymentMethods,
                                                    subscriptionInfo:userSubscriptions.subscriptions.filter(s=>s.status==="Active" && s.planId!==subscriptionPlanByCountry.yearly.id)[0]
                                                })}}> Update to Yearly Today </div>
                                                :
                                            /** Subscription Exists but all are canceled */
                                                <div className="btn btn-sm btn-warning" onClick={()=>{handleNewSubscriptionClick({
                                                    subscriptionPlanByCountry:subscriptionPlanByCountry,
                                                    billingFrequency:"yearly",
                                                    trialPeriod:false,
                                                    paymentInfo:userPaymentAccount.paymentMethods
                                                })}}> Subscribe Today  </div>
                                        :
                                        /** No active subscriptions and trsactions. New user */
                                        <div className="btn btn-sm btn-success" onClick={()=>{handleNewSubscriptionClick({
                                            subscriptionPlanByCountry:subscriptionPlanByCountry,
                                            billingFrequency:"yearly",
                                            paymentInfo:userPaymentAccount.paymentMethods
                                        })}}>  Try with 1 Month free  </div>
                                    }
                                    
                                </div>
                            </div>
        
                        </div>
        
                    </div>

                    {
                       showNewSubscriptionConfirmationBox? 
                        <ConfirmationBox >
                                <div className="p-2">
                                    <h4>Confirm Subscription</h4>
                                    <div className="mt-2 text-capitalize">{selectedPlan.name}</div>
                                    <div className="mt-2 text-left">
                                        <div>
                                            {
                                                !trialPeriod?
                                                <div>
                                                    <div>
                                                        You are not eligible for trial period. You will be charged the subscription amount of 
                                                        <span className="text-danger"> {userCurentLocationByIp.currency.native} {selectedPlan.price}</span>  
                                                        <b className="text-success ml-1">
                                                            {Object.keys(canceledButValidSubscription).length>0?
                                                                <span>
                                                                    on {moment(canceledButValidSubscription.subscription_cancellation_date).format('DD MMM YYYY')}
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
                                            <div className="d-inline-block btn btn-primary btn-sm pointer" onClick={()=>{createNewSubscription({
                                                paymentInfo:userPaymentAccount.paymentMethods
                                            })}}> Subscribe </div>
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

                    {
                        showCancelSubscriptionConfirmationBox ?
                        <Modal  header={<h4>Cancel Subscription</h4>} 
                                onCloseHandler={()=>{setCancelSubscriptionConfirmationBoxFlag(false)}} >
                                <div className="p-2">
                                    <h4 className="text-center"> We are sorry to see you go</h4>
                                    <div className="mt-2">
                                        <div className="text-left">
                                            <div className="mt-2 text-info font-weight-bold">Please read our cancellation terms before canceling your subscription:</div>
                                            <div>
                                                <ul>
                                                    {
                                                        selectedPlan.billingFrequency === 1 ?
                                                            <li className="mt-2">
                                                                <p>Cancellation will become effective at the end of your current monthly billing period.</p>
                                                                <p>You will <b>NOT</b> receive a refund; however your subscription access and privileges
                                                                    will continue for the remainder of the current monthly billing period.</p>
                                                            </li> :

                                                            /** Yearly subscription Cancellation Flow  */
                                                            selectedPlan.billingFrequency === 12 ?
                                                                <li className="mt-2">{
                                                                    selectedSubscription.transactions.length === 0 ?
                                                                        /** There is no transaction. therefore the subscription is still in trial period therefore no refund  */
                                                                        <div>'Still in trial period. No refund will be issued. '</div> :
                                                                        
                                                                        /** Transaction Exists, but transaction can be voided and total amount will be credited to the default cc   */
                                                                        selectedSubscription.transactions[selectedSubscription.transactions.length-1].status==="submitted_for_settlement" 
                                                                            || selectedSubscription.transactions[selectedSubscription.transactions.length-1].status==="settlement_pending"?
                                                                        <div>
                                                                            <div>
                                                                                The recent transaction of 
                                                                                <b  className="text-danger">{userCurentLocationByIp.currency.native} {selectedSubscription.transactions[selectedSubscription.transactions.length-1].amount} </b> will be voided 
                                                                                and amount will be credited to the associated credit card.
                                                                            </div>
                                                                            <div>
                                                                                <b className="text-danger">Please Note: Refund normally takes 3-5 business days to process.</b> 
                                                                            </div>
                                                                        </div>
                                                                        :
                                                                        /** Transaction Exists, and transaction cannot be voided and only can be refuned
                                                                         * yealry subscription if subscribed user have to use the subscription for one month
                                                                         */
                                                                        <div>
                                                                            <div>
                                                                                <div>
                                                                                    Refund of <b className="text-danger">{userCurentLocationByIp.currency.native} {calcRefundAmountOnCancellation()} </b> 
                                                                                    will be processed after subscription is cancelled. 
                                                                                </div>
                                                                                <div>
                                                                                    Since the subscription is already been processed, 
                                                                                    your subscription will end on <b className="text-primary">{getYearlySubscriptionEndDate().format('DD MMM YYYY')}.</b> 
                                                                                    You can utilize our services till the subscriptions ends.
                                                                                </div>
                                                                            </div>
                                                                            <div>
                                                                                <b className="text-danger">Please Note: Refund normally takes 3-5 business days to process.</b> 
                                                                            </div>
                                                                        </div>
                                                                }
                                                                </li> : ""
                                                    }

                                                    <li className="mt-2">All future charges associated with your subscription will be cancelled</li>
                                                    <li className="mt-2">If you wish to subscribe for the services again in future,
                                                        you will not recieve additional 1 month of free trial for new subscription.
                                                    </li>
                                                    <li className="mt-2">Canceled subscriptions cannot be reactivated. If you like to subscribe again new subscription will be created. </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right mt-2">
                                        <div className="d-inline-block btn-sm btn btn-danger pointer" onClick={() => 
                                            {
                                                selectedPlan.billingFrequency === 1 ? cancelSubscription()://** monthly subscription can be canceled without refund */
                                                selectedPlan.billingFrequency === 12 && selectedSubscription.transactions.length === 0?cancelSubscription()://** yearly subscription with no transactions can be cancelled */
                                                selectedPlan.billingFrequency === 12 && selectedSubscription.transactions.length > 0?processRefundOnCancellation():null//**yearly subscription with transctions need to refunded */
                                            }}>Proceed with Cancellation</div>
                                        <div className="d-inline-block ml-3 btn-link pointer small" 
                                            onClick={() => { setCancelSubscriptionConfirmationBoxFlag(false) }}>Close</div>
                                    </div>
                                </div>
                            </Modal> : null
                    }

                    {
                        showCanceledSubscriptionsIsValidBox?
                        <ConfirmationBox>
                            <h4>Valid Subscription Exists</h4>
                            <div>
                                <b>{subscriptionPlans.filter(s=>s.id===canceledButValidSubscription.plan_id)[0].name}</b> subscription has been recently 
                                <b className="text-danger ml-1">CANCELED</b>; but is still valid till 
                                <b className="ml-1 text-primary">{moment(canceledButValidSubscription.subscription_cancellation_date).format('DD MMM YYYY')}</b>. 
                                You can choose to subscribe today, and we will start charging you after 
                                <b className="ml-1 text-primary">{moment(canceledButValidSubscription.subscription_cancellation_date).format('DD MMM YYYY')}</b>.
                            </div>
                            <div className="text-right mt-2">
                                <div className="d-inline-block btn-sm btn btn-primary" onClick={()=>{handleNewWithCanceledButValidSubscription()}}>Proceed with Subscription</div>
                                <div className="d-inline-block ml-3 btn-link pointer small" onClick={()=>{setShowCanceledSubscriptionsIsValidBoxFlag(false)}}>Cancel</div>
                            </div>
                        </ConfirmationBox>:null
                    }

                </div>
       
            }}
        </UserInfo.Consumer>
    );
}