import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../AppContext';

import { OnScreenMessage } from "core/components/popups/web/popups";
const countries = require('@oi/utilities/lists/countries.json');

import { AddressEntryForm } from './addressEntryForm';
import './address.css';

export const ManageAddresses = () => {

    let AppLevelContext = useContext(AppContext);

    const [userAddresses, setUserAddresses] = useState([]);
    const [showAddressEntryForm, setAddressEntryFormFlag] = useState(false);
    const [addressToUpdate, setAddressToUpdate] = useState(null);

    const [showDeleteConfirmationMessage, setShowDeleteConfirmationMessage] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState(null);

    useEffect(() => {
        fetch('/account/api/user/address/get?userMongoId.$_id=' + AppLevelContext.userInfo._id)
            .then(response => response.json())
            .then(data => setUserAddresses(data));
    }, []);

    useEffect(() => {
        if (addressToUpdate !== null) setAddressEntryFormFlag(true);
    }, [addressToUpdate]);

    useEffect(() => {
        if (!showAddressEntryForm) setAddressToUpdate(null);
    }, [showAddressEntryForm]);

    useEffect(() => {
        if (addressToDelete !== null) setShowDeleteConfirmationMessage(true);
    }, [addressToDelete]);

    useEffect(() => {
        if (!showDeleteConfirmationMessage) setAddressToDelete(null);
    }, [showDeleteConfirmationMessage]);

    const handleAddressDeletion = () => {

        fetch('/account/api/user/address/update', {
            method: "POST",
            body: JSON.stringify({
                _id: addressToDelete._id,
                "deleted.$boolean": true
            }),
            headers: {
                "content-type": "application/json"
            }
        }).then(response => {

            let _d = [...userAddresses];
            let indx = _d.findIndex(addr => addr._id === addressToDelete._id);

            _d.splice(indx, 1);

            setUserAddresses(_d);
            setShowDeleteConfirmationMessage(false);

        }).catch(err => { console.log(err); alert("Error while deleting address") })
    }

    const handleAfterSubmission = (data) => {

        setAddressEntryFormFlag(false);

        let _d = [...userAddresses];

        let indx = _d.findIndex(addr => addr._id === data._id);

        if (indx > -1) {
            _d[indx] = data;
        } else {
            _d.push(data);
        }

        setUserAddresses(_d);
    };

    return (
        <div className="container mt-2">
            <div style={{ fontSize: "16px" }} className="mt-2">Addresses</div>
            <div>
                {
                    userAddresses.length > 0 ?
                        userAddresses.sort((a, b) => {
                            if (a.isDefault) return -1;
                            return 1;
                        }).map(address => {
                            return <div className="eachAddressTile" key={address._id}>
                                <div className="tile bg-white" >
                                <div className="p-2 d-flex flex-row justify-content-between">
                                    <div>
                                        <div>{address.streetAddress1}</div>
                                        <div>{address.streetAddress2}</div>
                                        <div>
                                            <span>{address.city}, {address.zipCode}</span>
                                        </div>
                                        <div>{address.state}, {countries.find(c => c._id === address.country._id).name} {address.isDefault ? <span className="text-success">(default)</span> : ""} </div>
                                    </div>
                                    <div>
                                        <div className="d-flex flex-row">
                                            <div title="Edit Address" className="icon-button"
                                                onClick={() => { setAddressToUpdate(address) }}>
                                                <i className="fas fa-pencil-alt"></i>
                                            </div>
                                            <div title="Remove Address" className="icon-button"
                                                onClick={() => { setAddressToDelete(address) }}>
                                                <i className="far fa-trash-alt"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                            </div>
                        }) :
                        null
                }
                <div className="eachAddressTile">
                    <div className="tile bg-white text-center">
                        <div className="btn-link pointer" style={{lineHeight:"80px"}} onClick={() => { setAddressEntryFormFlag(true) }}>Add New Address</div>
                    </div>
                </div>
                
            </div>

            {
                showAddressEntryForm ?
                    <AddressEntryForm
                        onCloseHandler={() => { setAddressEntryFormFlag(false) }}
                        afterSubmission={handleAfterSubmission}
                        addressToUpdate={addressToUpdate} />
                    : null
            }
            {
                showDeleteConfirmationMessage ?
                    <OnScreenMessage>
                        <div className="font-weight-bold">Remove Address</div>
                        <div className="mt-2">Are your sure to remove the selected address from your profile </div>
                        <div className="d-flex flex-row mt-2 justify-content-end">
                            <div className="btn btn-sm btn-link mr-2 pointer" onClick={() => { setShowDeleteConfirmationMessage(false) }}>Cancel</div>
                            <div className="btn btn-sm btn-primary pointer" onClick={() => { handleAddressDeletion() }}> Remove</div>
                        </div>
                    </OnScreenMessage> :
                    null
            }
        </div>)
}