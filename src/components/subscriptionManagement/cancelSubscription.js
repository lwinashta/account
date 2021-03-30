import React, { useEffect, useState, useContext } from "react";
import { UserInfo } from "../../contexts/userInfo";
import regeneratorRuntime from "regenerator-runtime";
import { Modal, ConfirmationBox } from "@oi/reactcomponents";
import * as PaymentFunctions from "../reusable/paymentFunctions";
const moment = require('moment');

export const CancelSubscription = ({ planBillingFrequency = "", subscriptionName = "" }) => {

    let contextValues = useContext(UserInfo);

    const [showCancelSubscriptionConfirmationBox,setCancelSubscriptionConfirmationBoxFlag]=useState(false);

    const [selectedPlan, setSelectedPlan] = useState({});
    const [selectedSubscription, setSelectedSubscription] = useState({});

    /**
     * @Cancel Subscription
     */
    //Step 1:
    const handleCancelSubscriptionClick = () => {

        //Retrieve user stored information again and check the selected plan isnot already canceled 
        //if selected plan is already canceled, refresh the page
        PaymentFunctions.checkIfCachedSubsciptionIsValid(contextValues.userInfo.registration_number, "elite subscription",contextValues.storedUserAccountSubscriptions).then(response=>{
            
            //check if payment exists for the user. If yes go next otherwise show error message
            setSelectedPlan(contextValues.subscriptionPlanByCountry[planBillingFrequency]);

            //set the selected subscripotion
            //filter active prescription for the plan
            //console.log(contextValues.userSubscriptions.subscriptions.filter(s => s.planId === contextValues.subscriptionPlanByCountry[planBillingFrequency].id && (s.status === "Active" || s.status === "Pending"))[0]);
            setSelectedSubscription(contextValues.userSubscriptions.subscriptions.filter(s => s.planId === contextValues.subscriptionPlanByCountry[planBillingFrequency].id && (s.status === "Active" || s.status === "Pending"))[0]);
            setCancelSubscriptionConfirmationBoxFlag(true);

        }).catch(err=>{
            popup.onBottomCenterErrorOccured("Error Occured. Refreshing App.");
            contextValues.refreshApp();
        });

    }

    // Cancels the subscription and updates the subscription status 
    // and cancellation date in the application db
    const proceedWithCancellation = function (cancellationDate = "") {

        let subscriptionId = selectedSubscription.id;
        popup.onScreen("Cancelling Subscription...");

        $.post('/payment/subscription/cancel', {
            "subscriptionId": subscriptionId

        }).then(function (canceledSubscription) {
            //console.log(canceledSubscription);
            return $.ajax({
                "url": '/account/api/subscription/create',
                method: "POST",
                data: JSON.stringify(
                    {
                        "registration_number": contextValues.userInfo.registration_number,
                        "subscription_id": canceledSubscription.subscription.id,
                        "plan_id": canceledSubscription.subscription.planId,
                        "status": canceledSubscription.subscription.status,
                        "subscription_name": subscriptionName,
                        "subscription_end_date": cancellationDate,
                        "history": [
                            {
                                "subscription_id": canceledSubscription.subscription.id,
                                "plan_id": canceledSubscription.subscription.planId,
                                "status": canceledSubscription.subscription.status,
                                "subscription_end_date": cancellationDate,
                            }
                        ]
                    }
                ),
                processData: false,
                contentType: "application/json; charset=utf-8"
            });

        }).then(dbResponse => {
            console.log(dbResponse);
            setCancelSubscriptionConfirmationBoxFlag(false);

            popup.remove();
            popup.onBottomCenterSuccessMessage("Subscription Cancelled");

            /**@SendEmail:Pending on subscription cancellation */

            contextValues.refreshApp();

        }).catch(err => {
            popup.onBottomCenterErrorOccured("Error occured while cancellation");
        });
    };

    //Executes Refund Process on confirmation by user 
    const processCancellationIfTransactionExists = async () => {
        
        popup.onScreen("Checking transactions...");
        
        let subscriptionEndDate=new Date();
        let refundAmount=0;

        if(selectedPlan.billingFrequency===12){
            //calc refund amount
            refundAmount= calcRefundAmountOnCancellation();
        }

        let transaction = selectedSubscription.transactions[selectedSubscription.transactions.length - 1];
        let checkTransactionState=getTransactionState();
 
        if (refundAmount > 0 && checkTransactionState==="void" && selectedPlan.billingFrequency===12) {
            let voided=await PaymentFunctions.voidTransaction(transaction.id);
            subscriptionEndDate=new Date();

        } else if (refundAmount > 0 && checkTransactionState==="refund" && selectedPlan.billingFrequency===12){
            let refund=await PaymentFunctions.refundTransaction(transaction.id,refundAmount);
            subscriptionEndDate=selectedPlan.billingFrequency===12?getYearlySubscriptionEndDate().format():"";

        }else if(refundAmount === 0 && checkTransactionState==="void" && selectedPlan.billingFrequency===1){
            let voided=await PaymentFunctions.voidTransaction(transaction.id);
            subscriptionEndDate=new Date();

        }else if(refundAmount === 0 && checkTransactionState==="refund" && selectedPlan.billingFrequency===1){
            //Nothing to be done. Cancel the subscription
            subscriptionEndDate=selectedSubscription.nextBillingDate;
        }

        popup.remove();

        //complete cancellation process
        console.log(subscriptionEndDate);
        let processCancellation=proceedWithCancellation(subscriptionEndDate);

    }

    //Calculates the refund amount if user cancels the Yearly Subscription
    //Refund is not processed for monthly subscription
    const calcRefundAmountOnCancellation = () => {
        //Step 1: Check if any trasactions has been processed for the subscription
        //If no transactions then the subscriptions can be "cancelled since the subscription is still in trial mode 

        //Step 2: if trasaction exists, calc refund amount 
        //Once amount is calculated 
        //console.log(selectedSubscription);
        let today = moment();
        let billingPeriodEndDate = moment(selectedSubscription.billingPeriodEndDate);

        //# of days diff 
        let diff = billingPeriodEndDate.diff(today, "months");//E.g., 5 months
        let balance = parseFloat(selectedSubscription.balance);//0.00

        //get price per month
        let price = parseFloat(selectedSubscription.price);//total subscription price: $320
        let pricePerMonth = parseFloat(price / selectedPlan.billingFrequency);//$320/12 = 26.66

        //Refun amount = price per month * remiaing months in billing cycle
        let refundAmount = (balance + (pricePerMonth * diff)).toFixed(2);//26.66*5=$133.33

        //Calculation 
        return refundAmount;

    }

    const getTransactionState=()=>{
        //Processing Refund 
        let transaction = selectedSubscription.transactions[selectedSubscription.transactions.length - 1];

        //check transaction status and refund or void the transaction 
        //If status is submitted_for_settlement or settlement_pending
        //The transaction can only be voided, since the trnsaction is not cmpleted or settled
        if (transaction.status === "submitted_for_settlement" || transaction.status === "settlement_pending") {
            return "void";
        } else {
            return "refund";
        }
    }

    //Calculates the subscription end date. 
    //Monthly suncriptions is cancelled at the end of the next billing cycle 
    //Yealry subscription is cancelled if the transaction cannot be voided. YEalry subscription stays active till end of next billDate and then canceled
    const getYearlySubscriptionEndDate = () => {
        let today = moment();
        let transaction=selectedSubscription.transactions[selectedSubscription.transactions.length - 1];
        console.log(transaction);
        if (today.date() >= selectedSubscription.billingDayOfMonth
            && transaction.status !== "submitted_for_settlement"
            && transaction.status !== "settlement_pending") {
            return today.add(1, 'months').date(selectedSubscription.billingDayOfMonth);
        } else {
            return today.date(selectedSubscription.billingDayOfMonth);
        }
    }

    return (
        <UserInfo.Consumer>
            {({
                subscriptionPlanByCountry = {},
                userPaymentAccount = {},
                userSubscriptions = {},
                userCurentLocationByIp={}
            }) => {
                return <div>
                    {
                        //Active Subscription exists for the this plan
                        userSubscriptions.subscriptions.length > 0 && userSubscriptions.subscriptions.findIndex(s => s.planId === subscriptionPlanByCountry[planBillingFrequency].id && (s.status === "Active" || s.status === "Pending")) > -1 ?
                            <div className="text-center small">
                                <div className="">
                                    Subscribed on {moment(userSubscriptions.subscriptions.filter(s => s.planId === subscriptionPlanByCountry[planBillingFrequency].id && (s.status === "Active" || s.status === "Pending"))[0].createdAt).format('DD MMM YYYY')}
                                </div>
                                <div className="btn btn-sm btn-danger mt-1 pointer"
                                    onClick={() => { handleCancelSubscriptionClick() }}>  Cancel Subscription </div>
                            </div>
                            :
                            null
                    }

                    {
                        showCancelSubscriptionConfirmationBox ?
                            <Modal header={<h4>Cancel Subscription</h4>}
                                onCloseHandler={() => { setCancelSubscriptionConfirmationBoxFlag(false) }} >
                                <div className="p-2">
                                    <h4 className="text-center"> We are sorry to see you go</h4>
                                    <div className="mt-2">
                                        <div className="text-left">
                                            <div className="mt-2 text-info font-weight-bold">Please read our cancellation terms before canceling your subscription:</div>
                                            <div>
                                                <ul>
                                                    <li className="mt-2">{
                                                        selectedSubscription.transactions.length === 0 ?
                                                            /** There is no transaction. therefore the subscription is still in trial period therefore no refund  */
                                                            <div>NO refund will be issued, since nothing has been charged to your account. </div> :

                                                            /** Transaction Exists, but transaction can be voided and total amount will be credited to the default cc   */
                                                            selectedSubscription.transactions[selectedSubscription.transactions.length - 1].status === "submitted_for_settlement"
                                                                || selectedSubscription.transactions[selectedSubscription.transactions.length - 1].status === "settlement_pending" ?
                                                                <div>
                                                                    <div>
                                                                        The recent transaction of
                                                                        <b className="text-danger">{userCurentLocationByIp.currency.native} {selectedSubscription.transactions[selectedSubscription.transactions.length - 1].amount} </b> will be voided
                                                                        and amount will be credited to the associated credit card.
                                                                    </div>
                                                                    <div>
                                                                        <b className="text-danger">Please Note: Refund normally takes 3-5 business days to process.</b>
                                                                    </div>
                                                                </div>
                                                                :
                                                                /** Transaction Exists, and transaction cannot be voided and only can be refunded (if yearly), no refund id monthly
                                                                 * yealry subscription if subscribed user have to use the subscription for one month
                                                                 */
                                                                <div>
                                                                    <div>
                                                                            {selectedPlan.billingFrequency === 12 ?
                                                                                <div>
                                                                                    Refund of <b className="text-danger">{userCurentLocationByIp.currency.native} {calcRefundAmountOnCancellation()} </b>
                                                                                    will be processed after subscription is cancelled.
                                                                                </div>:
                                                                                null
                                                                            }
                                                                            
                                                                        <div>
                                                                            Since the subscription is already been processed,
                                                                            your subscription will end on <b className="text-primary">
                                                                                {selectedPlan.billingFrequency === 12? 
                                                                                    getYearlySubscriptionEndDate().format('DD MMM YYYY'):

                                                                                selectedPlan.billingFrequency === 1?
                                                                                    moment(selectedSubscription.billingPeriodEndDate).format('DD MMM YYYY')
                                                                                    :
                                                                                    null
                                                                                }.</b>
                                                                            You can utilize our services till the subscriptions ends.
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <b className="text-danger">Please Note: Refund normally takes 3-5 business days to process.</b>
                                                                    </div>
                                                                </div>
                                                    }
                                                    </li> 

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
                                        <div className="d-inline-block btn-sm btn btn-danger pointer" onClick={() => {
                                            selectedSubscription.transactions.length === 0 ? proceedWithCancellation(new Date()) ://** monthly/yearly with no transaction, can be cancelled canceled, since nothing was charged to customer */
                                            selectedSubscription.transactions.length > 0 ? processCancellationIfTransactionExists() : null//**monthly/ yearly with transaction: If yearly = refunded/voided; if monthly = no refund/ only void */
                                        }}>Proceed with Cancellation</div>
                                        <div className="d-inline-block ml-3 btn-link pointer small"
                                            onClick={() => { setCancelSubscriptionConfirmationBoxFlag(false) }}>Close</div>
                                    </div>
                                </div>
                            </Modal> : null
                    }
                </div>

            }}
        </UserInfo.Consumer>
    );
}