import React, { useEffect, useState, useContext } from "react";
import { UserInfo } from "../contexts/userInfo";
import { ConfirmationBox } from "@oi/reactcomponents";
import * as userFunctions from './../reusable/userInfoFunctions';

import { ManageProviderSpecialties } from "./manageProviderSpecialties";
import { ManageProviderMedicalDegree } from "./manageProviderMedicalDegree";
import { ManageProviderMedicalRegistration } from "./manageProviderMedicalRegistration";
import { ManageProviderMedicalCouncil } from "./manageProviderMedicalCouncil";
import { ManagePracticeStartDate } from "./manageProviderPracticeStartDate";

export const ManageProviderQualification = () => {
    
    let contextValues=useContext(UserInfo);
    
    const [qualificationVerificationState,setQualitficationVerificationState]=useState("qualification_verification_status" in contextValues.userInfo ?contextValues.userInfo.qualification_verification_status:"");
    const [qualificationStateChangeTo,setQualificationStateChangeTo]=useState("");
    
    const [qualificationStateChangeConfirmation,setQualificationStateChangeConfirmationFlag]=useState(false);

    /******************** */
    /** Event Handlers */

    const handleQualificationStateChange=(state)=>{
        setQualificationStateChangeTo(state);
        setQualificationStateChangeConfirmationFlag(true);
    }

    const handleQualificationStateChangeOnConfirm=(state)=>{
        
        popup.onScreen("Updating ...");
        
        let history="qualification_verification_status_history" in contextValues.userInfo?contextValues.userInfo.qualification_verification_status_history:[];
        
        history.push({
            "to":state,
            "from":"qualification_verification_status" in contextValues.userInfo? contextValues.userInfo.qualification_verification_status:null,
            dateTime:new Date()
        });

        userFunctions.submitUserUpdates({
            "qualification_verification_status":state,
            "qualification_verification_status_change_history":history,
            "_id":contextValues.userInfo._id

        }).then(response=>{

            setQualitficationVerificationState(state);
            setQualificationStateChangeConfirmationFlag(false);

            contextValues.updateUserInfoContext({
                "qualification_verification_status":state,
                "qualification_verification_status_change_history":history,
            });

            popup.remove();
            popup.onBottomCenterSuccessMessage("Qualification Verification Updated");
        })
    }

    /** Render */
    return (<div>

            <div className="border-bottom">
                {
                    qualificationVerificationState.length>0 && qualificationVerificationState==="pending"?
                    <div className="small mb-2">
                        <i className="fas text-danger fa-exclamation-triangle"></i> Qualification verification is in <i className="text-danger">pending</i> state. 
                        Please enter all of the required <span className="text-danger">*</span> qualification details, i.e., <b className="text-info">Specialty, Medical Degree, Medical Registration Number and Medical Council</b>. 
                        Once all the information is entered and you think your profile is ready to be reviewed, please click on "Send for Approval" button below.
                    </div>:
                    qualificationVerificationState.length>0 && qualificationVerificationState==="in_review"?
                    <div className="small mb-2">
                        <i className="far fa-question-circle text-danger"></i> Your qualification details are being reviewed by our compliance team. 
                        It takes 1-3 business days to approve the details depending on the scenario. 
                        If there are any questions or concerns please contact us.
                    </div>:
                    qualificationVerificationState.length>0 && qualificationVerificationState==="approved"?
                    <div className="small mb-2">
                        <i className="fas text-info fa-user-check"></i> Your qualification has been <i className="text-info">approved</i> by our complaince team. 
                        Please click on "Request to Edit" if you wish to update your qualification.
                    </div>:
                    null
                }
            </div>

            <ManageProviderSpecialties />
            <ManageProviderMedicalDegree />
            <ManageProviderMedicalRegistration />
            <ManageProviderMedicalCouncil />
            <ManagePracticeStartDate />
           
            {/* {Qualification Workflow Buttons} */}
            {
                qualificationVerificationState.length>0?
                    <div className="border-bottom pt-2 pb-2 d-flex small justify-content-end pointer">
                    {
                        qualificationVerificationState.length>0 && qualificationVerificationState==="pending"?
                        <div className="btn-sm btn-primary" onClick={()=>{handleQualificationStateChange("in_review")}}>
                            <i className="far fa-check-circle"></i> Send for Approval
                        </div>:
                        qualificationVerificationState.length>0 && qualificationVerificationState==="approved"?
                        <div className="btn-sm btn-warning" onClick={()=>{handleQualificationStateChange("pending")}}>
                            <i className="far fa-edit"></i> Request to Update
                        </div>:
                        null
                    }
                    </div>:null
            }

            {
                qualificationStateChangeConfirmation ?
                    <ConfirmationBox >
                        <h3 className="text-center">
                            {qualificationStateChangeTo === "in_review" ? "Send for Approval" :
                                qualificationStateChangeTo === "pending" ? "Request to Edit" :
                                    null
                            }
                        </h3>
                        {
                            qualificationStateChangeTo === "in_review" ?
                                <div>
                                    <div className="small">
                                        <p className="text-left">The approval process takes atleast 1-3 business days.
                                            During our approval process you will not be able to edit your
                                            qualification details. If you need to make any changes please
                                            feel free to contact us.
                                        </p>
                                        <p className="font-weight-bold">Are your sure to send it for approval? </p>
                                    </div>
                                    <div className="mt-2 p-2 d-flex justify-content-end">
                                        <div className="btn-sm btn-primary pointer" onClick={()=>{handleQualificationStateChangeOnConfirm("in_review")}}>Send</div>
                                        <div className="btn-sm btn-link ml-2 pointer" onClick={() => { setQualificationStateChangeConfirmationFlag(false) }}>Cancel</div>
                                    </div>
                                </div> :
                                qualificationStateChangeTo === "pending" ?
                                    <div>
                                        <div className="small">
                                            <p className="text-left"><b>"Request to Edit"</b> will make your qualification state again in <i className="text-danger">pending</i> state, i.e, 
                                                your profile will not appear to users untill its approved again, which normally takes
                                                1-3 business days depending on the scenario.
                                            </p>
                                            <p className="font-weight-bold">Are you sure to proceed? </p>
                                        </div>
                                        <div className="mt-2 p-2 d-flex justify-content-end">
                                            <div className="btn-sm btn-primary pointer" onClick={()=>{handleQualificationStateChangeOnConfirm("pending")}}>Proceed</div>
                                            <div className="btn-sm btn-link ml-2 pointer" onClick={() => { setQualificationStateChangeConfirmationFlag(false) }}>Cancel</div>
                                        </div>
                                    </div> :
                                    null

                        }

                    </ConfirmationBox> : null
            }
        
    </div>)
}