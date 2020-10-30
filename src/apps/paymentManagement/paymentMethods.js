import React, { useEffect, useState, useContext } from "react";
import { UserInfo } from "./../../contexts/userInfo";
import { Modal, ConfirmationBox } from "@oi/reactcomponents";
import { PaymentEntryForm } from './paymentEntryForm';

export const ManagePaymentMethods = () => {

    const contextValues=useContext(UserInfo);

    const [appLoader, setAppLoader] = useState(true);
    const [userPaymentInfo, setUserPaymentInfo] = useState([]);

    const [showPaymentEntryForm, setPaymentEntryFormFlag] = useState(false);
    const [showDeleteConfirmationBox, setDeleteConfirmationBoxFlag] = useState(false);
    const [showSetDefaultConfirmationBox, setDefaultConfirmationBoxFlag] = useState(false);

    const [selectedCCInfo, setSelectedCCInfo] = useState({});

    const [ccActiveSubcriptions, setCCActiveSubcriptions] = useState([]);
    const [selectedNewCCForSubscription, setSelectedNewCCForSubscription] = useState({})

    useEffect(() => {
        if (!showDeleteConfirmationBox && !showSetDefaultConfirmationBox) {
            setSelectedCCInfo({});
            setSelectedNewCCForSubscription({});
        }
    }, [showDeleteConfirmationBox, showSetDefaultConfirmationBox])

    //Onload 
    useEffect(() => {
        getUserPayments(contextValues.userInfo.registration_number).then(PaymentResponse => {
            console.log(PaymentResponse);
            setUserPaymentInfo(PaymentResponse);
            setAppLoader(false);
        });
    }, []);

    /**
     * 
     * @After NewPayment Method Submission
     */
    const handleAfterPaymentMethodSubmission = (data) => {
        //console.log(data);
        let paymentInfo = userPaymentInfo === "customer-not-found" ? {} : { ...userPaymentInfo }
        if ("creditCards" in paymentInfo) {
            paymentInfo.creditCards = paymentInfo.creditCards.concat([data.creditCard]);
        } else {
            paymentInfo.creditCards = [data.creditCard];
        }
        setUserPaymentInfo(paymentInfo);
        setPaymentEntryFormFlag(false);
    }


    //Sort by default cc. Moves the default card on top
    const sortByDefaultPaymentMethods = (data) => {
        //-- push the default credit card on top 
        let getDefaultCCIndx = data.creditCards.findIndex(cc => cc.default === true);
        let getDefaultCCInfo = data.creditCards.filter(cc => cc.default === true)[0];

        data.creditCards.splice(getDefaultCCIndx, 1);
        data.creditCards.splice(0, 0, getDefaultCCInfo);

        return data;
    }

    const getUserPayments = (regNum) => {

        return new Promise((resolve, reject) => {
            //check if customer information exists 
            $.post('/payment/customer/get', {
                "registration_number": regNum
            }).done(customer => {

                let userPaymentInformation = customer;

                if (userPaymentInformation === "customer-not-found") {
                    resolve(userPaymentInformation);

                } else {
                    resolve(sortByDefaultPaymentMethods(userPaymentInformation));
                }

            }).catch(err => {
                console.log(err);
                reject(err);
            });
        });
    }

    /**
     * Payment Method Deletion - Triggers when user click on delete button on the
     * @param {*} _id As CC globalID 
     */
    const setStatesBeforeDeletion = (_id) => {
        let _selectedCC = userPaymentInfo.creditCards.filter(cc => cc.globalId === _id)[0];
        setSelectedCCInfo(_selectedCC);
        setCCActiveSubcriptions(_selectedCC.subscriptions.length > 0 && _selectedCC.subscriptions.filter(s => s.status === "Active" || s.status === "Pending"));
        setDeleteConfirmationBoxFlag(true);
    }

    /**
     * @Update payment method on deletion of payment method with associated subscriptions
     * @param {*} subscriptionId  as String
     */

    const updateSubscriptionPaymentMethod = () => {

        return new Promise((resolve, reject) => {

            //Step 1: Check if selected  new payment method for subscription is selected  
            popup.onScreen("Checking Subscription association..");

            //check if selected  new payment method for subscription is selected 
            if (Object.keys(selectedNewCCForSubscription).length > 0) {

                let promises = [];

                ccActiveSubcriptions.forEach((subscription) => {
                    promises.push(submitSubscriptionPaymentMethodUpdate(subscription.id));
                });

                Promise.all(promises).then(values => {
                    resolve(values);
                }).catch(err => {
                    console.log(err);
                    reject(err);
                });

            } else {
                popup.remove();
                resolve("no selections");
            }

        });
    };

    const submitSubscriptionPaymentMethodUpdate = (subscriptionId) => {
        return $.ajax({
            url: '/payment/subscription/update',
            method: "POST",
            processData: false,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({
                subscriptionId: subscriptionId,
                setValues: {
                    paymentMethodToken: selectedNewCCForSubscription.token
                }
            })
        })
    };

    //Delete Payment method on confirmation - Triggers when user confirms deletion
    //Step 1: Checks if subscription payment method needs to be changed
    //Step 2: Delete the selected payment Method 
    const handlePaymentDeletion = () => {

        updateSubscriptionPaymentMethod().then(updateSubscriptionResponse => {
            popup.onScreen("Deleting Payment Method...");
            return deletePaymentMethod();

        }).then(deleteResponse => {
            console.log(deleteResponse);

            let paymentInfo = { ...userPaymentInfo }
            let indx = paymentInfo.creditCards.findIndex(cc => cc.globalId === selectedCCInfo.globalId);

            let removedCC = paymentInfo.creditCards.splice(indx, 1);

            setUserPaymentInfo(paymentInfo);
            setDeleteConfirmationBoxFlag(false);

            popup.remove();
            popup.onBottomCenterSuccessMessage("Payment Method Deleted");

        }).catch(err => {
            popup.remove();
            popup.onBottomCenterErrorOccured("Error occured while deleting...");
        })

    }

    const deletePaymentMethod = () => {
        return $.post('/payment/paymentmethod/delete', {
            "token": selectedCCInfo.token
        });
    }

    /**
     * Setting states before setting the payment method as default payment type
     * @param {*} _id - CC globalId
     */
    const setStatesBeforeDefaultPayment = (_id) => {
        setSelectedCCInfo(userPaymentInfo.creditCards.filter(cc => cc.globalId === _id)[0]);
        setDefaultConfirmationBoxFlag(true);
    }

    const handleSetDefaultPaymentMethod = () => {

        popup.onScreen("Setting to Default...");

        $.post('/payment/paymentmethod/markasdefault', {
            "token": selectedCCInfo.token
        }).then(response => {

            let paymentInfo = { ...userPaymentInfo }

            paymentInfo.creditCards.forEach(cc => {
                if (cc.globalId === selectedCCInfo.globalId) {
                    cc.default = true;
                } else {
                    cc.default = false
                }
            });

            sortByDefaultPaymentMethods(paymentInfo);
            setUserPaymentInfo(paymentInfo);
            setDefaultConfirmationBoxFlag(false);

            popup.remove();
            popup.onBottomCenterSuccessMessage("Payment method set to default");

        }).catch(err => {
            console.log(err);
            popup.remove();
            popup.onBottomCenterErrorOccured("Error occured. Please try again.");
        });
    }

    return (
        <div>
            {
                appLoader ?
                    <div className="mt-2 p-2 text-center">
                        <img src="/efs/core/images/core/loading.gif" style={{ width: "40px" }}></img>
                    </div> :
                    <div>
                        {
                            userPaymentInfo.length > 0 || Object.keys(userPaymentInfo).length > 0 ?
                                userPaymentInfo === "customer-not-found" ?
                                    <div className="mt-3 text-center">
                                        <img src="/efs/core/images/payments/payment_method.png" style={{ width: "100px" }} alt="payment_method" />
                                        <div className="mt-3">
                                            <div className="text-medium">No Payment Methods are associated to your account. </div>
                                            <div className="btn btn-primary mt-2 pointer" onClick={() => { setPaymentEntryFormFlag(true) }}>
                                                <i className="fas fa-credit-card"></i>
                                                <span className="ml-2 small">Add Payment Method</span>
                                            </div>
                                        </div>
                                    </div> :
                                    <div className="p-2">
                                        <div className="mt-2 mb-2 position-relative">
                                            {/* <div className="font-weight-bold">My Payment Methods</div> */}
                                            <div className="">
                                                <div className="btn btn-primary pointer" onClick={() => { setPaymentEntryFormFlag(true) }}>
                                                    <i className="fas fa-credit-card"></i>
                                                    <span className="ml-2 small">Add Payment Method</span>
                                                </div>
                                            </div>
                                        </div>

                                        {
                                            userPaymentInfo.creditCards.map((cc, indx) => {
                                                return <div key={indx} className="rounded p-2 border bg-white mt-3 position-relative d-flex">
                                                    <div>
                                                        <img style={{ width: "80px" }} src={cc.imageUrl} aria-hidden="true" />
                                                    </div>

                                                    <div className="ml-3 align-top">
                                                        <div>{cc.cardType} •••• {cc.last4}</div>
                                                        <div className="text-small text-muted">Expires {cc.expirationMonth}/{cc.expirationYear}</div>
                                                        <div className="mt-2 small">
                                                            {
                                                                cc.default ? <div>
                                                                    <i className="fas fa-check-circle text-success"></i>
                                                                    <span className="ml-2"> This is default card. This card will be used for any subscriptions or future transactions.</span>
                                                                </div> : null
                                                            }
                                                        </div>
                                                    </div>

                                                    <div className="push-right d-flex">
                                                        {
                                                            cc.default ? `` :
                                                                <div className="btn-link small text-success pointer" onClick={() => { setStatesBeforeDefaultPayment(cc.globalId) }}> Set Default </div>
                                                        }
                                                        <div className="btn-link small ml-2 text-danger pointer" onClick={() => { setStatesBeforeDeletion(cc.globalId) }}> Delete </div>
                                                    </div>
                                                </div>
                                            })
                                        }
                                    </div> :
                                null
                        }
                    </div>
            }


            {
                showDeleteConfirmationBox ?
                    <Modal header={<h4>Delete Confirmation</h4>}
                        onCloseHandler={() => { setDeleteConfirmationBoxFlag(false) }}>

                        <div className="p-2">
                            <h4 className="text-center">Are you sure to delete </h4>
                            <div className="text-center mt-3 mb-3">
                                <div className="d-inline-block">
                                    <img style={{ width: "80px" }} src={selectedCCInfo.imageUrl} aria-hidden="true" />
                                </div>
                                <div className="ml-3 align-top d-inline-block text-left">
                                    <div>{selectedCCInfo.cardType} •••• {selectedCCInfo.last4}</div>
                                    <div className="text-small text-muted">Expires {selectedCCInfo.expirationMonth}/{selectedCCInfo.expirationYear}</div>
                                </div>
                            </div>

                            {
                                ccActiveSubcriptions.length > 0 ?
                                    <div>
                                        <div className="text-primary font-weight-bold mt-2">Association</div>
                                        <div className="mt-2">
                                            <div>This payment method is associated to subscriptions</div>
                                            <div className="mt-2">
                                                Please add another payment method to avoid your subscriptions to be canceled.
                                                Deleting this card without associating another credit card will cancel the subscriptions.                                             </div>
                                        </div>
                                        {
                                            userPaymentInfo.creditCards.filter(cc => cc.globalId !== selectedCCInfo.globalId).length > 0 ?
                                                userPaymentInfo.creditCards.filter(cc => cc.globalId !== selectedCCInfo.globalId).map((cc, indx) => {
                                                    return <div key={indx} className="border-bottom mt-2 p-2">
                                                        <input type="radio" className="align-top" name="associate-to-subscription"
                                                            value={cc.globalId} onChange={() => { setSelectedNewCCForSubscription(cc) }} />
                                                        <div className="d-inline-block ml-2 align-top">
                                                            <div className="d-flex">
                                                                <div>
                                                                    <img style={{ width: "50px" }} src={cc.imageUrl} aria-hidden="true" />
                                                                </div>
                                                                <div className="ml-3 align-top">
                                                                    <div>{cc.cardType} •••• {cc.last4}</div>
                                                                    <div className="text-small text-muted">Expires {cc.expirationMonth}/{cc.expirationYear}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                }) :
                                                <div className="btn btn-primary mt-2 pointer" onClick={() => { setPaymentEntryFormFlag(true) }}>
                                                    <i className="fas fa-credit-card"></i>
                                                    <span className="ml-2 small">Add Payment Method</span>
                                                </div>
                                        }
                                    </div> :
                                    null
                            }

                            <div>
                                <div className="text-right mt-2">
                                    <div className="d-inline-block btn btn-danger btn-sm pointer" style={{ width: '150px' }} onClick={() => { handlePaymentDeletion() }}> Yes</div>
                                    <div className="d-inline-block btn btn-link btn-sm ml-2 pointer" onClick={() => { setDeleteConfirmationBoxFlag(false) }}> No</div>
                                </div>
                            </div>

                        </div>
                    </Modal> : null
            }
            {
                showSetDefaultConfirmationBox ?
                    <ConfirmationBox >
                        <h4>Set Default </h4>
                        <div>
                            <div>Are you sure to make following default payment method </div>
                            <div className="d-flex mt-2">
                                <div>
                                    <img style={{ width: "80px" }} src={selectedCCInfo.imageUrl} aria-hidden="true" />
                                </div>
                                <div className="ml-3 align-top">
                                    <div>{selectedCCInfo.cardType} •••• {selectedCCInfo.last4}</div>
                                    <div className="text-small text-muted">Expires {selectedCCInfo.expirationMonth}/{selectedCCInfo.expirationYear}</div>
                                </div>
                            </div>
                        </div>
                        <div className="text-right mt-2">
                            <div className="d-inline-block btn btn-danger btn-sm pointer" onClick={() => { handleSetDefaultPaymentMethod() }}> Yes</div>
                            <div className="d-inline-block btn btn-link btn-sm ml-2 pointer" onClick={() => { setDefaultConfirmationBoxFlag(false) }}> No</div>
                        </div>
                    </ConfirmationBox> : null
            }

            {
                showPaymentEntryForm ?
                    <Modal
                        header={<h3>Payment Entry</h3>}
                        onCloseHandler={() => { setPaymentEntryFormFlag(false) }}>
                        <PaymentEntryForm 
                            afterSubmission={handleAfterPaymentMethodSubmission} 
                            userPaymentInfo={userPaymentInfo} />
                    </Modal> : null
            }
        </div>

    )
}