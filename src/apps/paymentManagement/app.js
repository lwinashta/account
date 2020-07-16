import React, { useEffect, useState } from "react";
import { UserInfo } from "./../../contexts/userInfo";
import { Modal, ConfirmationBox } from "@oi/reactcomponents";
import { PaymentEntryForm } from './paymentEntryForm';

export const App = () => {

    const [appLoader, setAppLoader] = useState(true);

    const [userInfo, setUserInfo] = useState({});
    const [userPaymentInfo, setUserPaymentInfo] = useState([]);

    const [showPaymentEntryForm, setPaymentEntryFormFlag] = useState(false);

    const [showDeleteConfirmationBox, setDeleteConfirmationBoxFlag] = useState(false);
    const [showSetDefaultConfirmationBox, setDefaultConfirmationBoxFlag] = useState(false);

    const [selectedCCInfo, setSelectedCCInfo] = useState({});

    //Onload 
    useEffect(() => {
        getUserInfo().then(response => {

            //console.log(response);
            setUserInfo(response);

            return getUserPayments(response.registration_number);

        }).then(PaymentResponse => {
            console.log(PaymentResponse);
            setUserPaymentInfo(PaymentResponse);
            setAppLoader(false);
        });
    }, []);

    useEffect(() => {
        if (!showDeleteConfirmationBox && !showSetDefaultConfirmationBox) {
            setSelectedCCInfo({});
        }
    }, [showDeleteConfirmationBox, showSetDefaultConfirmationBox])

    /** Get Data ***/
    const getUserInfo = () => {
        return $.post('/account/api/user/verifytoken')
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
                    return false;
                }

                //-- push the default credit card on top 
                let getDefaultCCIndx = userPaymentInformation.creditCards.findIndex(cc => cc.default === true);
                let getDefaultCCInfo = userPaymentInformation.creditCards.filter(cc => cc.default === true)[0];

                userPaymentInformation.creditCards.splice(getDefaultCCIndx, 1);
                userPaymentInformation.creditCards.splice(0, 0, getDefaultCCInfo);

                resolve(userPaymentInformation);

            }).catch(err => {
                console.log(err);
                reject(err);
            });
        });
    }

    const handleAfterPaymentMethodSubmission = (data) => {
        //console.log(data);
        let paymentInfo = { ...userPaymentInfo }
        paymentInfo.creditCards = paymentInfo.creditCards.concat([data.creditCard]);
        setUserPaymentInfo(paymentInfo);
        setPaymentEntryFormFlag(false);
    }

    const updateUserInfoContext = (info) => {
        let data = { ...userInfo };
        let updatedData = Object.assign(data, info);
        //console.log(updatedData);
        setUserInfo(updatedData);
    }

    const handlePaymentDeletion = (_id) => {
        setSelectedCCInfo(userPaymentInfo.creditCards.filter(cc => cc.globalId === _id)[0]);
        setDeleteConfirmationBoxFlag(true);
    }

    const deletePaymentMethod = () => {
        $.post('/payment/api/paymentmethod/delete', {
            "token": selectedCCInfo.token
        }).then(deleteResponse => {
            console.log(deleteResponse);
            let paymentInfo = { ...userPaymentInfo }
            let indx = paymentInfo.creditCards.findIndex(cc => cc.globalId === selectedCCInfo.globalId);

            let removedCC = paymentInfo.creditCards.splice(indx, 1);

            setUserPaymentInfo(paymentInfo);
            setDeleteConfirmationBoxFlag(false);

            popup.onBottomCenterSuccessMessage("Payment Method Deleted");

        });
    }

    const handleSetDefaultPaymentMethod = (_id) => {
        setSelectedCCInfo(userPaymentInfo.creditCards.filter(cc => cc.globalId === _id)[0]);
        setDefaultConfirmationBoxFlag(true);
    }

    const setDefaultPaymentMethod = () => {

    }

    return (
        <UserInfo.Provider value={{
            userInfo: userInfo,
            userPaymentInfo: userPaymentInfo,
            updateUserInfoContext: updateUserInfoContext
        }}>
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
                                            <div className="mt-2 position-relative">
                                                <h4>My Payment Methods</h4>
                                                <div className="push-right t-0">
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
                                                                    <div className="btn-link small text-success pointer" onClick={() => { markDefaultPaymentMethod(cc.globalId) }}> Set Default </div>
                                                            }
                                                            <div className="btn-link small ml-2 text-danger pointer" onClick={() => { handlePaymentDeletion(cc.globalId) }}> Delete </div>
                                                        </div>
                                                    </div>
                                                })
                                            }
                                        </div> :
                                    null
                            }
                        </div>
                }
            </div>
            {
                showPaymentEntryForm ?
                    <Modal
                        header={<h3>Payment Entry</h3>}
                        onCloseHandler={() => { setPaymentEntryFormFlag(false) }}>
                        <PaymentEntryForm afterSubmission={handleAfterPaymentMethodSubmission} />
                    </Modal> : null
            }

            {
                showDeleteConfirmationBox ?
                    <ConfirmationBox >
                        <h4>Delete Confirmation</h4>
                        <div>
                            {
                                selectedCCInfo.subscriptions.length === 0 ?
                                    <div>
                                        <div className="d-flex mt-2">
                                            <div>
                                                <img style={{ width: "80px" }} src={selectedCCInfo.imageUrl} aria-hidden="true" />
                                            </div>
                                            <div className="ml-3 align-top">
                                                <div>{selectedCCInfo.cardType} •••• {selectedCCInfo.last4}</div>
                                                <div className="text-small text-muted">Expires {selectedCCInfo.expirationMonth}/{selectedCCInfo.expirationYear}</div>
                                            </div>
                                        </div>
                                        <div className="mt-2 small">
                                            <div>This payment method is associated to subscriptions</div>
                                            <div className="mt-2">
                                                Please add another default payment method to avoid your subscriptions to be canceled.
                                                If you <b>PROCEED</b>, all associated subscriptions will be <b>CANCELED</b>.
                                            </div>
                                        </div>
                                        <div className="text-right mt-2">
                                            <div className="btn-link small pointer" onClick={() => { setDeleteConfirmationBoxFlag(false) }}> Close</div>
                                        </div>
                                    </div> :
                                    <div>
                                        <div>Are you sure to delete </div>
                                        <div className="d-flex mt-2">
                                            <div>
                                                <img style={{ width: "80px" }} src={selectedCCInfo.imageUrl} aria-hidden="true" />
                                            </div>
                                            <div className="ml-3 align-top">
                                                <div>{selectedCCInfo.cardType} •••• {selectedCCInfo.last4}</div>
                                                <div className="text-small text-muted">Expires {selectedCCInfo.expirationMonth}/{selectedCCInfo.expirationYear}</div>
                                            </div>
                                        </div>
                                        <div className="text-right mt-2">
                                            <div className="d-inline-block btn btn-danger btn-sm pointer" onClick={() => { deletePaymentMethod() }}> Yes</div>
                                            <div className="d-inline-block btn btn-link btn-sm ml-2 pointer" onClick={() => { setDeleteConfirmationBoxFlag(false) }}> No</div>
                                        </div>
                                    </div>
                            }
                        </div>
                    </ConfirmationBox> : null
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
                            <div className="d-inline-block btn btn-danger btn-sm pointer" onClick={() => { deletePractice() }}> Yes</div>
                            <div className="d-inline-block btn btn-link btn-sm ml-2 pointer" onClick={() => { setDefaultConfirmationBoxFlag(false) }}> No</div>
                        </div>
                    </ConfirmationBox> : null
            }
        </UserInfo.Provider>
    );
};