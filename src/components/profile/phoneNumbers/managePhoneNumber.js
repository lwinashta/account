import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from "../../AppContext";
import * as utils from "account-manager-module/lib/user/phoneNumber/handlers"

import PhoneNumberEntryForm from "./phoneNumberEntryForm";

export const ManagePhoneNumbers = () => {

    let AppLevelContext = useContext(AppContext);

    const [showPhoneNumberEntryForm, setPhoneNumberEntryFormFlag] = useState(false);
    const [contactToUpdate, setContactToUpdate] = useState(null);

    useEffect(()=>{
        if(!showPhoneNumberEntryForm) setContactToUpdate(null);
    },[showPhoneNumberEntryForm]);

    useEffect(()=>{
        if(contactToUpdate!==null) setPhoneNumberEntryFormFlag(true);
    },[contactToUpdate]);

    return (
        <div>
            {'contactNumber' in AppLevelContext.userInfo && Object.keys(AppLevelContext.userInfo.contactNumber).length > 0 ?
                <div className="d-flex flex-row justify-content-between" key={AppLevelContext.userInfo.contactNumber.uuid}>
                    <div>
                        <div>{utils.constructPhoneNumber(AppLevelContext.userInfo.contactNumber)}</div>
                        <div className="text-muted">{AppLevelContext.userInfo.contactNumber.contactType} </div>
                    </div>
                    <div className="icon-button" onClick={()=>setContactToUpdate(AppLevelContext.userInfo.contactNumber)}>
                        <i className="fas fa-pencil-alt"></i>
                    </div>
                </div> :
                <div onClick={() => { setPhoneNumberEntryFormFlag(true) }}>
                    <div className="btn-link pointer">Add New Phone Number</div>
                </div>
            }

            {
                showPhoneNumberEntryForm ?
                    <PhoneNumberEntryForm
                        onProcessEnd={()=>{setPhoneNumberEntryFormFlag(false)}}
                        contactToUpdate={contactToUpdate} /> :
                    null
            }
        </div>)

}