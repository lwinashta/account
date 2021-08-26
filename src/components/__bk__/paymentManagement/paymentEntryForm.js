import React, { useEffect, useState, useContext } from "react";
import { UserInfo } from "../../contexts/userInfo";
import { Modal } from "@oi/reactcomponents";
import { formjs} from "@oi/utilities/lib/js/form";
import { AddressEntryForm } from './../../components/addressEntryForm';

export const PaymentEntryForm = ({ afterSubmission = {},userPaymentInfo }) => {

    let paymentCCDropInRef = React.createRef();
    let params = useContext(UserInfo);

    const [paymentInstance, setPaymentInstance] = useState({});
    const [billingAddress, setBillingAddress] = useState({});
    const [showAddressEntryForm, setAddressEntryFormFlag] = useState(false);
    
    useEffect(() => {
        popup.onScreen("Loading form...");
        setPaymentDropIn().then(instance => {
            setPaymentInstance(instance);
            popup.remove();
        });
    }, []);

    const setPaymentDropIn = function () {
        var paymentInstance = {};
        return new Promise((resolve, reject) => {
            $.post('/payment/token/get').then(function (token) {
                braintree.dropin.create({
                    authorization: token,
                    selector: '#payment-dropin-container'
                }, function (err, instance) {
                    if (err) throw err;
                    paymentInstance = instance;
                    resolve(paymentInstance);
                });
            }).fail(function (err) {
                console.error(err);
                popup.onBottomCenterErrorOccured("Error initalizing payment gateway");
                reject(err);
            });
        });
    };

    const createUserPaymentGateway = function (data) {
        return $.post('/payment/customer/create', {
            "id": params.userInfo.registration_number,
            "firstName": data.first_name,
            "lastName": data.last_name,
            "email": params.userInfo.email_id
        });
    };

    const createUserBillingAddress = function (data) {
        //create customer address 
        //check if personal address same as billing address 

        return $.post('/payment/address/create', {
            "customerId": params.userInfo.registration_number,
            "firstName": data.first_name,
            "lastName": data.last_name,
            "streetAddress": billingAddress.street_line1,
            "locality": billingAddress.city,
            "region": billingAddress.state,
            "postalCode": billingAddress.zip_code,
            "countryCodeAlpha2": billingAddress.country
        });
    };

    const createNewPaymentMethod = function (data) {
        return $.post('/payment/paymentmethod/create', {
            "customerId": params.userInfo.registration_number,
            "paymentMethodNonce": data.nonce,
            "billingAddressId": data.addressId
        });
    }

    const getUserMatchingAddress = function (currentBilling, existingAddresses) {
        let matchingAddress = [];
        userPaymentInfo.addresses.forEach(addr => {

            if (addr.streetAddress === billingAddress.street_line1
                && addr.locality === billingAddress.city
                && addr.region === billingAddress.state
                && addr.postalCode === billingAddress.zip_code
                && addr.countryCodeAlpha2 === billingAddress.country) {
                matchingAddress.push(addr);
            }

        });

        return matchingAddress;
    };

    const handleOnChangeAddressSelection = (e) => {

        if (e.target.checked) {
            let v = e.target.value;
            let addr = params.userInfo.user_addresses.filter(a => a._id === v)[0];
            console.log(addr);
            setBillingAddress(addr);
        }

    }

    const handlePaymentSubmission = (e) => {
        
        e.preventDefault();
        let form = e.target;

        popup.onScreen("Saving Payment Method...");

        let _formjs = new formjs();
        let validate = _formjs.validateForm(form);

        paymentInstance.requestPaymentMethod((err, payload) => {

            try {
                if (validate > 0 || err) throw "validation error";

                /**
                 * @Execution Flow:
                 * 1. Check if user exists in the payment gateway 
                 * 2a. If user doesnt exits create the user, with new address
                 * 2b. If user exists, check user's address exists in the account 
                 * 3a. If user's address doesnt exists create user's address
                 * 4. Create the payment method
                 */

                let formData = {};
                formData.nonce = payload.nonce;

                formData.first_name = $(form).find('[name="first_name"]').val();
                formData.last_name = $(form).find('[name="last_name"]').val();
                
                console.log(userPaymentInfo);

                if (userPaymentInfo === "customer-not-found") {
                    //console.log(formData);
                    //Execute step 2a, 3a, 4
                    createUserPaymentGateway(formData).then(customerInfo => {
                        return createUserBillingAddress(formData);

                    }).then(adressResponse => {
                        formData.addressId = adressResponse.address.id;
                        return createNewPaymentMethod(formData);

                    }).then(paymentResponse => {
                        console.log(paymentResponse);
                        afterSubmission(paymentResponse);
                        popup.remove();
                        popup.onBottomCenterSuccessMessage("Payment Method Saved");
                    }).catch(err=>{
                        console.error(err);

                    });

                } else {

                    let getMatchingAddr = getUserMatchingAddress();
                    console.log(getMatchingAddr);

                    //check if address exists 
                    if (getMatchingAddr.length > 0) {
                        formData.addressId = getMatchingAddr[0].id;
                        createNewPaymentMethod(formData).then(paymentResponse => {
                            console.log(paymentResponse);
                            afterSubmission(paymentResponse);
                            popup.remove();
                            popup.onBottomCenterSuccessMessage("Payment Method Saved");

                        }).catch(err => {
                            console.error(err);
                            popup.remove();
                            popup.onBottomCenterErrorOccured("Error occured. Please check your CC Info");
                        });

                    } else {

                        createUserBillingAddress(formData).then(adressResponse => {
                            formData.addressId = adressResponse.address.id;
                            return createNewPaymentMethod(formData);

                        }).then(paymentResponse => {
                            console.log(paymentResponse);
                            afterSubmission(paymentResponse);
                            popup.remove();
                            popup.onBottomCenterSuccessMessage("Payment Method Saved");

                        }).catch(err => {
                            console.error(err);
                            popup.remove();
                            popup.onBottomCenterErrorOccured("Error occured. Please check your CC Info");
                        });

                    }
                }

            } catch (error) {
                popup.remove();
                if (error === "validation error") popup.onBottomCenterRequiredErrorMsg();
                popup.onBottomCenterErrorOccured("Error occured. Please check you CC info.");
            }

        });

    }

    const handleAfterAddressSubmission = (data) => {
        setAddressEntryFormFlag(false);

        //update the context
        params.updateUserInfoContext({
            user_addresses: data.addresses
        });
        setBillingAddress(data.addresses.filter(addr => addr._id === data.addressId)[0]);
        popup.onBottomCenterSuccessMessage("Address updated");
    }

    return (
        <UserInfo.Consumer>
            {({ userInfo = {} }) => {
                return <div>
                    <form onSubmit={(e) => { handlePaymentSubmission(e) }}>
                        <div className="mt-3 pl-2 pr-2">
                            <div>
                                <div className="font-weight-bold h5">Name</div>
                                <div className="row">
                                    <div className="col">
                                        <label htmlFor="first-name" data-required="1">First Name </label>
                                        <input type="text" name="first_name" id="first-name"
                                            className="form-control entry-field"
                                            data-required="1" placeholder="First name" defaultValue={userInfo.first_name} />
                                    </div>
                                    <div className="col">
                                        <label htmlFor="last-name" data-required="1">Last Name </label>
                                        <input type="text" name="last_name" id="last-name"
                                            className="form-control entry-field"
                                            data-required="1" placeholder="Last name" defaultValue={userInfo.last_name} />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="font-weight-bold h5" data-required="1">Billing Address</div>
                                {
                                    'user_addresses' in userInfo && userInfo.user_addresses.length > 0 ?
                                        <div className="radio-control-group entry-field" data-required="1">
                                            {
                                                userInfo.user_addresses.map((addr, indx) => {
                                                    return <div key={indx} className="d-flex border-bottom pb-2 pt-2">
                                                        <div>
                                                            <input type="radio"
                                                                value={addr._id} name="billing_address"
                                                                onChange={(e) => handleOnChangeAddressSelection(e)}
                                                                checked={"_id" in billingAddress && billingAddress._id === addr._id ? "checked" : ""} />
                                                        </div>
                                                        <div className="ml-2 small">
                                                            <div>{addr.street_line1} {addr.street_line2.length > 0 ? ',' + addr.street_line2 : ""}</div>
                                                            <div>{addr.city}, {addr.state}, {addr.zip_code}</div>
                                                            <div>{addr.country}</div>
                                                        </div>
                                                    </div>
                                                })
                                            }
                                        </div> :
                                        null
                                }
                                <div className="w-100 pt-2">
                                    <div className="small btn-link pointer" onClick={() => { setAddressEntryFormFlag(true) }}>Add New Address</div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pl-2 pr-2">
                            <div className="font-weight-bold h5">Credit Card Information</div>
                            <div ref={paymentCCDropInRef} id="payment-dropin-container"></div>
                        </div>
                        <div className="mt-3 text-center pt-2 border-top">
                            <button className="btn btn-primary w-75" type="submit">Save Information</button>
                        </div>
                    </form>

                    <div>
                        {
                            showAddressEntryForm ?
                                <Modal header={<h3>Address Entry</h3>}
                                    onCloseHandler={() => { setAddressEntryFormFlag(false) }}>
                                    <AddressEntryForm
                                        afterSubmission={handleAfterAddressSubmission} />
                                </Modal>
                                : null
                        }
                    </div>
                </div>
            }}
        </UserInfo.Consumer>

    )
}