import React, { useContext, useState } from 'react';
import { AppContext } from '../../AppContext';

import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

export const WorkflowButtons = () => {

    let { userInfo, updateUserContextInfo } = useContext(AppContext);

    let [isSubmitting, setIsSubmitting] = useState(false);

    const checkAllDetailsCompleted = () => {
        return (userInfo.specialties && userInfo.specialties.length > 0)
            && (userInfo.medicalDegrees && userInfo.medicalDegrees.filter(m => !m.deleted).length > 0)
            && (userInfo.medicalRegistration)
    }

    const handleStateUpdate = async (status) => {
        try {

            setIsSubmitting(true);

            let response = await fetch("/account/api/user/profile/update", {
                method: "POST",
                body: JSON.stringify({
                    "_id": userInfo._id,
                    "qualificationVerificationState": status,
                    "$push": {
                        "qualificationVerificationStateTansitions.$object": {
                            "fromState": ("qualificationVerificationState" in userInfo) ? userInfo.qualificationVerificationState : null,
                            "toState": status,
                            "transitionDate.$date": new Date()
                        }
                    }
                }),
                headers: {
                    "content-type": "application/json"
                }
            });

            let updatedData = await response.json();

            updateUserContextInfo(updatedData);

            setIsSubmitting(false);

        } catch (error) {
            console.log(console.error());
            alert("Error in updating the state");
            setIsSubmitting(false);

        }
    }

    return (
        <div className="px-3">
            {
                !userInfo.qualificationVerificationState || (userInfo.qualificationVerificationState && userInfo.qualificationVerificationState === "pending") ?
                    <div>
                        <b>Please complete your required qualificaton details.</b>
                        <p>
                            Qualification details are required for your profile to be viewed by others.
                            All Qualification details are reviewed by our compliance team to verify
                            the authenticity of the information.
                        </p>
                        <Alert variant="info">
                            Once all the qualification details are completed please click on <b>Submit for Approval</b> to have the qualification details reviewed by our compliance team.
                            If <b>Submit for Approval</b> button disabled, please review your qualification and make sure all required information has been entered.
                        </Alert>
                        <div className="py-2">
                            <Button variant="primary"
                                disabled={!checkAllDetailsCompleted() || isSubmitting}
                                onClick={() => handleStateUpdate("in_review")}
                            >
                                <div className="d-flex flex-row">
                                    {
                                        isSubmitting ?
                                            <div className="mr-2"><Spinner variant="default" size="sm" animation="border"></Spinner></div> :
                                            null
                                    }
                                    <div>Submit for Approval</div>
                                </div>

                            </Button>
                        </div>
                    </div> :
                    userInfo.qualificationVerificationState && userInfo.qualificationVerificationState === "in_review" ?
                        <div>
                            <Alert variant="warning">
                                Your qualification details are being reviewed by our compliance team and you will not be able to make any edits till the review is in progress.
                                It takes 1-2 business days to approve the details depending on the scenario.
                                If there are any questions or concerns please contact us.
                            </Alert>
                        </div> :
                        userInfo.qualificationVerificationState && userInfo.qualificationVerificationState === "approved" ?
                            <div>
                                <Alert variant="success">
                                    <div className="d-flex flex-row">
                                        <div className="mr-2"><i className="fas text-info fa-user-check"></i></div>
                                        <div>
                                            <div>
                                                Your qualification has been <i className="text-info">approved</i> by our complaince team.
                                                Please click on <b>Edit Qualification </b>if you wish to update.
                                            </div>
                                            <div className="mt-2">
                                                <b>Important: </b>
                                                Editing qualification will reset the state and your qualification will be required to be reviewed again by our compliance team.
                                            </div>
                                        </div>
                                    </div>

                                </Alert>
                                <div className="py-2">
                                    <Button variant="primary"
                                        disabled={isSubmitting}
                                        onClick={() => handleStateUpdate("pending")}
                                    >
                                        <div className="d-flex flex-row">
                                            {
                                                isSubmitting ?
                                                    <div className="mr-2"><Spinner variant="default" size="sm" animation="border"></Spinner></div> :
                                                    null
                                            }
                                            <div>Edit Qualification</div>
                                        </div>

                                    </Button>
                                </div>
                            </div> :
                            null
            }
        </div>
    );
}