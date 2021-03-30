import React, { useState, useContext, useEffect } from 'react';

const countries = require('@oi/utilities/lists/countries.json');

import { AppContext } from "../../AppContext";
import { AddressEntryForm } from './addressEntryForm';

export const ManageAddresses = ({ userInfo }) => {

    const [userAddresses, setUserAddresses] = useState([]);
    const [showAddressEntryForm, setAddressEntryFormFlag] = useState(false);
    const [addressInfoToEdit, setAddressInfoToEdit] = useState({});

    useEffect(() => {
        fetch('/account/api/user/address/get?userMongoId.$_id=' + userInfo._id)
            .then(response => response.json())
            .then(data => setUserAddresses(data));
    }, []);


    const handleAfterSubmission = (data) => {

        setAddressEntryFormFlag(false);

        //update the context
        params.updateUserInfoContext({
            user_addresses: data.addresses
        });

        popup.onBottomCenterSuccessMessage("Address updated");

    };

    const handleEditAddress = (_id) => {
        //Get address info 
        let info = params.userInfo.user_addresses.filter(a => a._id === _id)[0];
        //console.log(_id,info);
        setAddressInfoToEdit(info);
        setAddressEntryFormFlag(true);
    }

    const handleSetDefaultAddress = (_id) => {

        popup.onScreen("Updating ...");

        let indx = params.userInfo.user_addresses.findIndex(a => a._id === _id);

        //mark all address default = false except the with indx abve
        let data = {
            user_addresses: [...params.userInfo.user_addresses],
            _id: params.userInfo._id
        }

        data.user_addresses.forEach((address, i) => {
            if (i === indx) {
                address.default = true;
            } else {
                address.default = false;
            }
        });

        let fdata = _formjs.convertJsonToFormdataObject(data);

        $.ajax({
            "url": '/account/api/user/update',
            "processData": false,
            "contentType": false,
            "data": fdata,
            "method": "POST"
        }).then(response => {

            //update the context
            params.updateUserInfoContext({
                user_addresses: data.user_addresses
            });

            popup.remove();
            popup.onBottomCenterSuccessMessage("Address updated");

        }).catch(err => {
            reject(err);
        });

    }

    const handleDeleteAddress = function (_id) {

        popup.messageBox({
            message: "Are you sure to remove this Address?",
            buttons: [{
                "label": "Yes",
                "class": "btn-danger",
                "id": "yes-button",
                "callback": function () {
                    popup.remove(); //remove the confirmation pop up 
                    popup.onScreen("Deleting...");

                    let indx = params.userInfo.user_addresses.findIndex(a => a._id === _id);

                    let addresses = [...params.userInfo.user_addresses];
                    let address = addresses.splice(indx, 1);

                    let data = {
                        "user_addresses": addresses,
                        "_id": params.userInfo._id
                    }

                    let fdata = _formjs.convertJsonToFormdataObject(data);

                    //verified and correct 
                    //Add the phone number to user contacts 

                    $.ajax({
                        "url": '/account/api/user/update',
                        "processData": false,
                        "contentType": false,
                        "data": fdata,
                        "method": "POST"
                    }).then(response => {
                        //update the context
                        params.updateUserInfoContext({
                            "user_addresses": data.user_addresses
                        });

                        popup.remove();
                        popup.onBottomCenterSuccessMessage("Address deleted");

                    }).catch(err => {
                        reject(err);
                    });
                }
            },
            {
                "label": "No",
                "class": "btn-link",
                "id": "no-button",
                "callback": function () {
                    popup.remove(); //remove the confirmation pop up 
                }
            }
            ]
        });

    }

    useEffect(() => {
        if (!showAddressEntryForm) {
            setAddressInfoToEdit({});
        }

    }, [showAddressEntryForm]);

    return (
        <div>
            {
                userAddresses.length > 0 ?
                    userAddresses.sort((a, b) => {
                        if (a.default) return -1;
                        return 1;
                    }).map(address => {
                        return <div className="position-relative border-bottom small pt-1 pb-1" key={indx} _id={address._id}>
                            <div>
                                <div>{address.streetLine1}</div>
                                <div>{address.streetLine2}</div>
                                <div>
                                    <span>{address.city}, {address.zipCode}</span>
                                </div>
                                <div>{address.state}, {address.country} {address.default ? <span className="text-success">(default)</span> : ""} </div>
                            </div>
                            <div className="push-right">
                                <div className="d-inline-block btn-link pointer" 
                                    onClick={() => { handleEditAddress(address._id) }}>Edit</div>
                                {
                                    !address.default ? <div className="d-inline-block ml-2 btn-link text-success pointer" onClick={() => { handleSetDefaultAddress(address._id) }}>Set default</div> : null
                                }
                                <div className="d-inline-block ml-2 btn-link text-danger pointer" onClick={() => { handleDeleteAddress(address._id) }}>Delete</div>
                            </div>
                            <div className="w-100 pt-2">
                                <div className="small btn-link pointer" onClick={() => { setAddressEntryFormFlag(true) }}>Add New Address</div>
                            </div>
                        </div>
                    }) :
                    null
            }
            {
                showAddressEntryForm ?
                <AddressEntryForm
                    afterSubmission={handleAfterSubmission}
                    addressInfoToEdit={addressInfoToEdit} />
                    : null
            }
        </div>)
}