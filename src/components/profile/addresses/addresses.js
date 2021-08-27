import React, { useState, useContext, useEffect } from 'react';

import {OnScreenMessage} from 'core/components/popups/web/popups'

import { AppContext } from '../../AppContext';
import { AddressEntryForm } from './addressEntryForm';

const countries = require('@oi/utilities/lists/countries.json');

export const Addresses = () => {

    let { userInfo } = useContext(AppContext);

    const [userAddresses, setUserAddresses] = useState([]);

    const [showAddressEntryForm, setShowAddressEntryForm] = useState(false);

    const [addressToUpdate, setAddressToUpdate] = useState(null);

    const [showDeleteConfirmationMessage, setShowDeleteConfirmationMessage] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState(null);

    useEffect(() => {
        
        let uri = new URL(window.location.origin + "/account/api/user/address/get");
        uri.searchParams.set("userMongoId.$_id", userInfo._id);
        uri.searchParams.set("deleted.$boolean", false);

        fetch(uri)
            .then(response => response.json())
            .then(data => setUserAddresses(data))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (addressToUpdate !== null) setShowAddressEntryForm(true);
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
                query:{_id: addressToDelete._id},
                values:{"deleted.$boolean": true}
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

        setShowAddressEntryForm(false);

        let _d = [...userAddresses];

        let indx = _d.findIndex(addr => addr._id === data._id);

        if (indx > -1) {

            _d[indx] = data;

            //check if the data isDefault is true. If yes, set all other addresses as not default
            if(data.isDefault) _d.map(d=>{
                if(d._id!==data._id) return Object.assign(d,{isDefault:false});
            })

        } else {
            _d.push(data);
        }

        setUserAddresses(_d);
    };

    return (
        <div className="border rounded bg-white my-2">
            <div className="my-2 px-3 py-2 border-bottom">
                <div className="h3">Manage Addresses</div>
                <div className="small text-muted">The addresses will be used to locate relevant information near you.</div>
            </div>
            <div>
                {
                    userAddresses.length > 0 ?
                        userAddresses.sort((a, b) => {
                            if (a.isDefault) return -1;
                            return 1;
                        }).map(address => {
                            return <div key={address._id} className="p-1 border-bottom">
                                <div className="p-2 d-flex flex-row justify-content-between">
                                    <div>
                                        <div><b>{address.streetAddress1} {address.isDefault ? <span className="text-success">(Default)</span> : ""}</b></div>
                                        <div className="small text-muted d-flex flex-row">
                                            {
                                                address.streetAddress2 ?
                                                    <div>{address.streetAddress2}, </div> :
                                                    null
                                            }

                                            <div>{address.city}, </div>
                                            <div>{address.zipCode}, </div>
                                            <div>{address.state}, </div>
                                            <div>{countries.find(c => c._id === address.country._id).name}</div>
                                        </div>
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
                        }) :
                       null
                }

                <div className="py-2">
                    <div className="m-3 btn-classic btn-white py-2 px-3" onClick={()=>{setShowAddressEntryForm(true)}}>
                        <div className="d-flex flex-row font-weight-bold justify-content-center align-items-baseline">
                            <i className="fas fa-plus"></i>
                            <div className="ml-2">Add Address</div>
                        </div>
                    </div>
                </div>

            </div>

            {
                showAddressEntryForm?
                <AddressEntryForm 
                    addressToUpdate={addressToUpdate}
                    handleOnClose={setShowAddressEntryForm}
                    handleAfterSubmission={handleAfterSubmission}/>:
                null
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