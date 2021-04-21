import React,{useState,useEffect, useContext} from 'react';

import { OnScreenMessage } from "core/components/popups/web/popups";

import { AppContext } from "../../AppContext";
import { handleVerificationStateChange } from "./../handlers";

export const PracticeUpdateButtons=({
    facilityInfo=null,
    practiceInfo=null,
    handleOnEdit=function(){},
    handlePracticeFacilityInfoUpdate=function(){}
})=>{

    let AppLevelContext=useContext(AppContext);

    const [confirmationMessage,setOnScreenMessagePop]=useState({
        state:null,
        show:false
    });

    const showStateChangeConfirmation=(state)=>{
        setOnScreenMessagePop({
            show:true,
            state:state
        });
    }

    const handleStateChangeSubmission=(state)=>{
        
        AppLevelContext.setOnScreenLoader({
            message: "Updating state",
            show: true
        });

        handleVerificationStateChange(state, facilityInfo)
            .then(response => response.json())
            .then(data => {
                //update the state 
                handlePracticeFacilityInfoUpdate(practiceInfo._id, {
                    verificationState: "",
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

    return (<div className="d-flex flex-row align-items-center">
        <div title="Edit Practice Information" 
            onClick={()=>{handleOnEdit(practiceInfo._id)}}
            className="icon-button ">
            <i className="fas fa-pencil-alt"></i>
        </div>
        {
            facilityInfo.verificationState === "in_edit_mode" ?
                <div className="ml-1 pointer btn btn-sm btn-primary small" onClick={()=>handleStateChange("in_review")}>Send for Approval</div> :
            facilityInfo.verificationState === "in_review" || facilityInfo.verificationState === "approved"?
                <div className="ml-1 pointer btn btn-sm btn-primary small" onClick={()=>handleStateChange("in_edit_mode")}>Request for Edit</div> :
            null
        }
        {
            confirmationMessage.show?
            <OnScreenMessage>
                {
                    confirmationMessage.state!==null  && confirmationMessage.state==="in_review"?
                        <div>Are you sure you would like to send the practice information for approval  </div>:
                    confirmationMessage.state!==null  && confirmationMessage.state==="in_edit_mode"?
                        <div>Are you sure you would like to request to edit your practice.
                            <b>Please Note: </b> This will reset the current state of your practice verification 
                             and practice will not be visible in search results untill its re-approved.
                             If there is any edit, please contact us directly to expedite your request.
                        </div>:
                    null
                }
            </OnScreenMessage>:
            null
        }
    </div>)
}