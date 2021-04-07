import React, { useEffect, useState, useContext } from "react";

import { setFirstLetterUpperCase } from '@oi/utilities/lib/ui/utils';
import { OnScreenMessage } from "core/components/popups/web/popups";

import { AppContext } from "../../AppContext";

import * as handlers from '../handlers';

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
            
            <div className=" p-2 border-bottom">
                <div className="d-flex flex-row justify-content-between">
                    <div className="d-flex flex-row">
                        <div className="font-weight-bold">Specialties</div>
                        <div className="font-weight-bold text-danger ml-2 text-uppercase small">(* Required)</div>
                    </div>
                    {
                        handlers.checkIfAllowedEdit(AppLevelContext.userInfo)?
                        <div className="pointer" 
                            onClick={() => {
                                setShowSpecialtyEntryFormFlag(true);
                            }}>
                            <i className="fas fa-plus"></i>
                        </div>:
                        null
                    }
                    
                </div>
                <div className="text-muted"> Atleast one specialty is required. Specialty will be displayed on your profile screen and patient or other users can search healthcare providers with specialties.</div>
            </div>
            
            <div className="d-flex flex-row flex-wrap">
                {
                    ("specialties" in AppLevelContext.userInfo) && AppLevelContext.userInfo.specialties.length > 0 ?
                        AppLevelContext.userInfo.specialties.map(sp => {
                            return <div key={sp._id} className="d-flex flex-row justify-content-between align-items-center p-2 border rounded bg-whitesmoke mr-2 mt-2">
                                <div>{setFirstLetterUpperCase(sp.name)}</div>
                                {
                                    handlers.checkIfAllowedEdit(AppLevelContext.userInfo)?
                                    <div 
                                        className="ml-3 pointer text-danger"
                                        onClick={() => { 
                                            setSpecialtyToDelete(sp);
                                        }}>
                                        <i className="fas fa-times"></i>
                                    </div>:
                                    null
                                }
                                
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