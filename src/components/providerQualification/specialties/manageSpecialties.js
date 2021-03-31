import React, { useEffect, useState, useContext } from "react";

import { setFirstLetterUpperCase } from '@oi/utilities/lib/ui/utils';
import { OnScreenMessage } from "core/components/popups/web/popups";

import { AppContext } from "../../AppContext";

import { SpecialtyEntryForm } from "./form";

export const ManageSpecialties = () => {

    let AppLevelContext = useContext(AppContext);

    const [showSpecialtyEntryForm, setShowSpecialtyEntryFormFlag] = useState(false);
    const [showDeleteConfirmationMessage, setShowDeleteConfirmationMessage] = useState(false);
    const [specialtyToDelete, setSpecialtyToDelete] = useState(null);

    useEffect(()=>{
        if(specialtyToDelete!==null) setShowDeleteConfirmationMessage(true);
    },[specialtyToDelete])

    useEffect(()=>{
        if(!showDeleteConfirmationMessage) setSpecialtyToDelete(null);
    },[showDeleteConfirmationMessage]);

    const handleSpecialtyDeletion = () => {

        fetch('/account/api/user/profile/update', {
            method: "POST",
            body: JSON.stringify({
                "_id": AppLevelContext.userInfo._id,
                "$pull": {
                    "specialties": {
                        "_id": specialtyToDelete._id
                    }
                }
            }),
            headers: {
                "content-type": "application/json",
            }
        })
        .then(response => response.json())
        .then(data => {
            AppLevelContext.updateUserContextInfo({
                specialties:data.specialties
            });
            setShowDeleteConfirmationMessage(false);
        })
        .catch(err => console.log(err));
    }

    /** Render */
    return (<>
        <div className="tile bg-white">
            <div className="d-flex flex-row justify-content-between p-2 border-bottom">
                <div className="font-weight-bold">Specialty <i className="text-danger">(* Required)</i></div>
                <div className="pointer" onClick={() => {
                    setShowSpecialtyEntryFormFlag(true);
                }}>
                    <i className="fas fa-plus"></i>
                </div>
            </div>

            <div className="px-2 pt-2">
                Please select your specialty.
                Patient can search healthcare providers with specialties.
            </div>

            <div className="d-flex flex-row flex-wrap">
                {
                    ("specialties" in AppLevelContext.userInfo) && AppLevelContext.userInfo.specialties.length > 0 ?
                        AppLevelContext.userInfo.specialties.map(sp => {
                            return <div key={sp._id} className="d-flex flex-row justify-content-between align-items-center p-2 border rounded bg-whitesmoke mr-2 mt-2">
                                <div>{setFirstLetterUpperCase(sp.name)}</div>
                                <div 
                                    className="ml-3 pointer text-danger"
                                    onClick={() => { 
                                        setSpecialtyToDelete(sp);
                                    }}>
                                    <i className="fas fa-times"></i>
                                </div>
                            </div>
                        }) :
                        null
                }
            </div>


        </div>

        {
            showSpecialtyEntryForm ?
                <SpecialtyEntryForm
                    onCloseHandler={() => { setShowSpecialtyEntryFormFlag(false) }} /> :
                null
        }

        {
            showDeleteConfirmationMessage ?
                <OnScreenMessage>
                    <div className="font-weight-bold">Remove Specialty</div>
                    <div className="mt-2">Are your sure to remove the selected specialty </div>
                    <div className="d-flex flex-row mt-2 justify-content-end">
                        <div className="btn btn-sm btn-link mr-2 pointer" onClick={() => { setShowDeleteConfirmationMessage(false) }}>Cancel</div>
                        <div className="btn btn-sm btn-primary pointer" onClick={() => { handleSpecialtyDeletion() }}> Remove</div>
                    </div>
                </OnScreenMessage> :
                null
        }
    </>)
}