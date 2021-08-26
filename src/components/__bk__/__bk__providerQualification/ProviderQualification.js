import React, { useEffect, useState, useContext } from "react";
import { AppContext } from "../AppContext";

import { ManageRegistration } from "./registration/manageRegistration";
import { ManageSpecialties } from "./specialties/manageSpecialties";
import { ManageMedicalDegree } from "./degrees/manageMedicalDegree";
import { ManageCertifications } from "./certifications/manageCertificates";

import * as handlers from './handlers';

//Qualification States:
//1.in_review 
//2.approved 
//3.user_edit_mode

export const ProviderQualification = () => {

    let AppLevelContext = useContext(AppContext);

    return (<div className="container-fluid mt-4">
        <div className="d-flex flex-row justify-content-between align-items-baseline">
            <h4>Qualification:</h4>
            <WorkflowButton />
        </div>
        
        <Disclaimer />
        
        <div className="row mt-3">
            <div className="col-sm-12 col-md-6 col-lg-6 col-xl-6">
                <div className="mb-2"><ManageSpecialties /></div>
                <div className="mb-2"><ManageMedicalDegree /></div>
            </div>
            <div className="col-sm-12 col-md-6 col-lg-6 col-xl-6">
                <div className="mb-2"><ManageRegistration /></div>
                <div className="mb-2"><ManageCertifications /></div>
            </div>
        </div>   
    </div>)
}

const WorkflowButton=()=>{

    let AppLevelContext = useContext(AppContext);

    let userInfo=AppLevelContext.userInfo;

    const handleQualificationState=(status=null)=>{
        fetch("/account/api/user/profile/update", {
            method: "POST",
            body: JSON.stringify({
                "_id":AppLevelContext.userInfo._id,
                "qualificationVerificationState":status,
                "$push":{
                    "qualificationVerificationStateTansitions.$object":{
                        "fromState":"qualificationVerificationState" in userInfo? userInfo.qualificationVerificationState:null,
                        "toState":status,
                        "transitionDate.$date":new Date()
                    }
                }
            }),
            headers: {
                "content-type": "application/json"
            }
        }).then(response=>{
            return AppLevelContext.resetUserInformation();

        }).then(userInfo=>{
            AppLevelContext.setPopup({
                show:true,
                message:status==="in_review"?" Successfully sent for review":" Qualification ready for edit",
                messageType:"success"
            });

        })
    }

    return (<React.Fragment>
        {
            !("qualificationVerificationState" in userInfo)
                || (("qualificationVerificationState" in userInfo)
                    && (userInfo.qualificationVerificationState === "user_edit_mode")) ?
                <button className="d-flex flex-row btn btn-primary pointer"
                    disabled={!handlers.checkIfAllQualificationEntered(userInfo) ? "disabled" : null}
                    aria-disabled={!handlers.checkIfAllQualificationEntered(userInfo) ? "disabled" : null} 
                    onClick={()=>{
                        handleQualificationState("in_review");
                    }}>
                    <div><i className="far fa-thumbs-up"></i></div>
                    <div className="ml-2">Send for Approval</div>
                </button> :
                ("qualificationVerificationState" in userInfo)
                    && (userInfo.qualificationVerificationState === "approved") ?
                    <button className="d-flex flex-row btn btn-secondary pointer" 
                    onClick={()=>{handleQualificationState("user_edit_mode")}} >
                        <div><i className="fas fa-pencil-alt"></i></div>
                        <div className="ml-2">Edit qualification</div>
                    </button> :
                    null
        }
    </React.Fragment>)
}

const Disclaimer=()=>{
    let AppLevelContext = useContext(AppContext);

    let userInfo=AppLevelContext.userInfo;

    return(<React.Fragment>
        {
        !handlers.checkIfAllQualificationEntered(userInfo) &&
            (!("qualificationVerificationState" in userInfo) ||
                (("qualificationVerificationState" in userInfo && userInfo.qualificationVerificationState !== "approved"))) ?
            <div className="bg-white tile mt-3">
                <div className="d-flex flex-row">
                    <div className="mr-2"><i className="text-danger fas fa-exclamation-triangle"></i></div>
                    <div>
                        <p>
                            Please complete your qualificaton details.
                            Qualification details are required for your profile to be viewed by others.
                            All Qualification details are reviewed by our compliance team to verify
                            the authenticity of the information.
                        </p>
                        <p>
                            Once all the required information is entered and you think your qualification is ready to be reviewed,
                            please click on "Send for Approval" button above. If send for approval button disabled, please review your qualification and make sure all required information has been entered.
                        </p>

                    </div>
                </div>
            </div> :
            handlers.checkIfAllQualificationEntered(userInfo) &&
                (!("qualificationVerificationState" in userInfo) ||
                    (("qualificationVerificationState" in userInfo
                        && (userInfo.qualificationVerificationState !== "approved"
                            && userInfo.qualificationVerificationState !== "in_review")))) ?
                <div className="bg-white tile mt-3">
                    <div className="d-flex flex-row">
                        <div className="mr-2"><i className="fas fa-check-circle text-success"></i></div>
                        <div>Thank you for completing your qualification details.
                        Please click on "Send for Approval" button once you think
                        your qualification is ready to be reviewed by our compliance team</div>
                    </div>
                </div> :
                null
    }
    {
        ("qualificationVerificationState" in userInfo && userInfo.qualificationVerificationState === "in_review")?
            <div className="bg-white tile mt-3">
                <div className="d-flex flex-row">
                    <div className="mr-2"><i className="far fa-question-circle text-danger"></i></div>
                    <div>Your qualification details are being reviewed by our compliance team.
                    It takes 1-2 business days to approve the details depending on the scenario.
                        If there are any questions or concerns please contact us.</div>
                </div> 
            </div>:
        ("qualificationVerificationState" in userInfo && userInfo.qualificationVerificationState === "approved")?
            <div className="bg-white tile mt-3">
                <div className="d-flex flex-row">
                    <div className="mr-2"><i className="fas text-info fa-user-check"></i></div>
                    <div>
                        <div>
                            Your qualification has been <i className="text-info">approved</i> by our complaince team.
                            Please click on "Edit Qualification" if you wish to update your qualification. 
                        </div>
                        <div className="mt-2">
                            <b>Important: </b> 
                            Editing qualification will reset the state and your qualification 
                            and your qualification will be required to be reviewed again by our compliance team.
                        </div>
                    </div>
                </div>
            </div>:
        null
    }
    </React.Fragment>)
}