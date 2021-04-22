import React, { useState, useEffect, useContext } from 'react';

import { OnScreenMessage } from "core/components/popups/web/popups";

import { AppContext } from "../../AppContext";
import { handleVerificationStateChange } from "./../handlers";

export const PracticeUpdateButtons = ({
    facilityInfo = null,
    practiceInfo = null,
    handleOnEdit = function () { },
    handlePracticeFacilityInfoUpdate = function () { }
}) => {

    let AppLevelContext = useContext(AppContext);

    const [showConfirmation, setShowConfirmation] = useState({
        state: null,
        show: false
    });

    const showStateChangeConfirmation = (state) => {
        setShowConfirmation({
            show: true,
            state: state
        });
    }

    const handleStateChangeSubmission = (state) => {

        AppLevelContext.setOnScreenLoader({
            message: "Updating state",
            show: true
        });

        handleVerificationStateChange(state, facilityInfo)
            .then(response => response.json())
            .then(data => {

                //update the state info
                handlePracticeFacilityInfoUpdate(practiceInfo._id, {
                    _id: facilityInfo._id,
                    verificationState: state,
                    verificationStateTransitions: facilityInfo.verificationStateTransitions.concat({
                        "fromState": facilityInfo.verificationState,
                        "toState": state,
                        "transitionDate": new Date()
                    })
                });

                AppLevelContext.removeOnScreenLoader();//removes the loader

                AppLevelContext.setPopup({
                    "show": true,
                    "message": "Practice information saved",
                    "messageType": "success"
                });

            }).catch(err => console.log(err));
    }

    return (<>
        <div className="d-flex flex-row align-items-center">
            {
                facilityInfo.verificationState === "in_edit_mode" ?
                    <div className="pointer btn btn-sm btn-success small" onClick={() => showStateChangeConfirmation("in_review")}>Send for Approval</div> :
                    facilityInfo.verificationState === "in_review" || facilityInfo.verificationState === "approved" ?
                        <div className="pointer btn btn-sm btn-warning small" onClick={() => showStateChangeConfirmation("in_edit_mode")}>Request for Edit</div> :
                        null
            }
            <div title="Edit Practice Information"
                onClick={() => { handleOnEdit(practiceInfo._id) }}
                className="icon-button ml-2">
                <i className="fas fa-pencil-alt"></i>
            </div>
            
            <div title="Delete practice"
                className="icon-button text-danger">
                <i className="far fa-trash-alt"></i>
            </div>
        </div>

        {
            showConfirmation.show ?
                <OnScreenMessage>
                    {
                        showConfirmation.state !== null && showConfirmation.state === "in_review" ?
                            <div>Are you sure you would like to send the practice information for approval  </div> :
                            showConfirmation.state !== null && showConfirmation.state === "in_edit_mode" ?
                                <div>Are you sure you would like to request for edit your practice.
                        <div>
                                        <b>Please Note: </b> This will reset the current state of your practice verification
                             and practice will not be visible in search results untill its re-approved.
                             Please contact us directly to expedite your request.
                        </div>
                                </div> :
                                null
                    }
                    {
                        showConfirmation.state !== null ?
                            <div className="mt-2 d-flex flex-row justify-content-end">
                                <div className="btn btn-sm btn-primary pointer"
                                    onClick={() => {
                                        handleStateChangeSubmission(showConfirmation.state);
                                        setShowConfirmation(false);
                                    }}>
                                    {
                                        showConfirmation.state === "in_review" ? "Send for approval" :
                                            showConfirmation.state === "in_edit_mode" ? "Request to Edit" :
                                                null
                                    }
                                </div>
                                <div className="pointer ml-2 btn btn-sm btn-link" onClick={() => { setShowConfirmation(false) }}>Cancel</div>
                            </div> :
                            null
                    }
                </OnScreenMessage> :
                null
        }
    </>)
}