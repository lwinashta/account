import React, { useContext, useState } from 'react';

import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

import { PracticeContext } from '../practiceContext';

export const WorkflowButtons = () => {

    let { practiceInfo, 
        practiceProviderInfo, 
        resetPracticeInfo, 
        resetPracticeProviderInfo 
    } = useContext(PracticeContext);

    let [isSubmitting, setIsSubmitting] = useState(false);

    const checkAllDetailsCompleted = () => {
        if (practiceProviderInfo.affiliation) {
            return (practiceProviderInfo.availability && practiceProviderInfo.availability.length > 0);

        } else {
            
            return (practiceInfo.name && practiceInfo.name.length > 0
                && practiceInfo.facilityType && practiceInfo.facilityType.length > 0
                && practiceInfo.address && Object.keys(practiceInfo.address).length > 0
                && practiceInfo.contactInformation && practiceInfo.contactInformation.length > 0
                && practiceProviderInfo.availability && practiceProviderInfo.availability.length > 0)
        }

    }

    const handleStateUpdate = async (status, item) => {
        try {

            setIsSubmitting(true);

            let uri=item==="provider"?'/account/api/practice/medicalprovider/update':
                item==="practice"?'/account/api/practice/medicalfacility/update':
                null;

            let itemInfo=item==="provider"?practiceProviderInfo:
            item==="practice"?practiceInfo:
            null;
            

            let response = await fetch(uri, {
                method: "POST",
                body: JSON.stringify({
                    "_id": practiceInfo._id,
                    "verificationState": status,
                    "$push": {
                        "verificationStateTansitions.$object": {
                            "fromState": ("verificationState" in itemInfo) ? itemInfo.verificationState : null,
                            "toState": status,
                            "transitionDate.$date": new Date()
                        }
                    }
                }),
                headers: {
                    "content-type": "application/json"
                }
            });

            item==="provider"?await resetPracticeProviderInfo():await resetPracticeInfo(); 

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
                // PROVIDER IS AFFILIATED TO PRACTICE IS IN pending STATE
                practiceProviderInfo.verificationState === "pending" && practiceProviderInfo.affiliation ?
                    <div>
                        <b>Please complete the required details.</b>
                        <Alert variant="info">
                            Once all the required details are completed please click on <b>Submit for Approval</b> to have the affiliation reviewed by our compliance team.
                            If <b>Submit for Approval</b> button disabled, please review your details and make sure all required information has been entered.
                        </Alert>
                        <div className="py-2">
                            <Button variant="primary"
                                disabled={!checkAllDetailsCompleted() || isSubmitting}
                                onClick={() => handleStateUpdate("in_review", "provider")}
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

                practiceProviderInfo.verificationState === "in_review" && practiceProviderInfo.affiliation ?
                    <div>
                        <Alert variant="warning">
                            We are currnetly verifying you affiliation with the practice.
                            It takes 1-2 business days for approval, depending on the scenario.
                            If there are any questions or concerns please contact us.
                        </Alert>
                    </div> :

                practiceProviderInfo.verificationState === "approved" && practiceProviderInfo.affiliation ?
                    <div>
                        <Alert variant="success">
                            <div className="d-flex flex-row">
                                <div className="mr-2"><i className="fas text-info fa-user-check"></i></div>
                                <div>
                                    <div>
                                        Your affiliation with the practice has been <i className="text-info">approved</i> by our complaince team.
                                        Please click on <b>Edit Practice Details </b>if you wish to update.
                                    </div>
                                    <div className="mt-2">
                                        <b>Important: </b>
                                        Editing the details will reset the state and your affiliation will be required to be reviewed again by our compliance team.
                                    </div>
                                </div>
                            </div>

                        </Alert>
                        <div className="py-2">
                            <Button variant="primary"
                                disabled={isSubmitting}
                                onClick={() => handleStateUpdate("pending","provider")}
                            >
                                <div className="d-flex flex-row">
                                    {
                                        isSubmitting ?
                                            <div className="mr-2"><Spinner variant="default" size="sm" animation="border"></Spinner></div> :
                                            null
                                    }
                                    <div>Edit Practice Details</div>
                                </div>

                            </Button>
                        </div>
                    </div> :

                //SELF PRACTICE
                !practiceProviderInfo.affiliation && practiceInfo.verificationState === "pending" ?
                    <div>
                        <b>Please complete the required details.</b>
                        <Alert variant="info">
                            Once all the required details are completed please click on <b>Submit for Approval</b> to have your practice reviewed by our compliance team.
                            If <b>Submit for Approval</b> button disabled, please review your details and make sure all required information has been entered.
                        </Alert>
                        <div className="py-2">
                            <Button variant="primary"
                                disabled={!checkAllDetailsCompleted() || isSubmitting}
                                onClick={() => handleStateUpdate("in_review","practice")}
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
                !practiceProviderInfo.affiliation && practiceInfo.verificationState === "in_review" ?
                    <div>
                        <Alert variant="warning">
                            We are currently verifying the practice details.
                            Depending on the scenario it takes 1-2 business days for approval. 
                            If there are any issues we will contact the the creator of this practice. 
                            Feel free to contact us if you have any questions or concerns. 
                            You will not be able to update the practice details till we have approved the details.
                        </Alert>
                    </div> :
                !practiceProviderInfo.affiliation  && practiceInfo.verificationState === "approved" ?
                        <div>
                            <Alert variant="success">
                                <div className="d-flex flex-row">
                                    <div className="mr-2"><i className="fas text-info fa-user-check"></i></div>
                                    <div>
                                        <div>
                                            Your practice has been <i className="text-info">approved</i> by our complaince team.
                                            Please click on <b>Edit Practice Details </b>if you wish to update.
                                        </div>
                                        <div className="mt-2">
                                            <b>Important: </b>
                                            Editing the details will reset the state and your affiliation will be required to be reviewed again by our compliance team.
                                        </div>
                                    </div>
                                </div>

                            </Alert>
                            <div className="py-2">
                                <Button variant="primary"
                                    disabled={isSubmitting}
                                    onClick={() => handleStateUpdate("pending","practice")}
                                >
                                    <div className="d-flex flex-row">
                                        {
                                            isSubmitting ?
                                                <div className="mr-2"><Spinner variant="default" size="sm" animation="border"></Spinner></div> :
                                                null
                                        }
                                        <div>Edit Practice Details</div>
                                    </div>

                                </Button>
                            </div>
                        </div> :
                        <div>no match</div>
            }
        </div>
    );
}