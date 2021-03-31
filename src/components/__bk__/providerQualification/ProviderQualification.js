import React, { useEffect, useState, useContext } from "react";
import { AppContext } from "../AppContext";

export const ProviderQualification = () => {

    let AppLevelContext = useContext(AppContext);

    return (<div className="container-fluid mt-4">
        <div className="d-flex flex-row justify-content-between align-items-baseline">
            <h4>Qualification:</h4>
            <div className="d-flex flex-row btn btn-primary pointer">
                <div><i className="far fa-thumbs-up"></i></div>
                <div className="ml-2">Send for Approval</div>
            </div>
        </div>
        <div className="bg-white tile mt-3">
            {
                ("qualification" in AppLevelContext.userInfo
                    && AppLevelContext.userInfo.qualification.state === "pending") || !("qualification" in AppLevelContext.userInfo) ?
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
                                Once all the required information is entered and you think your profile is ready to be reviewed,
                                please click on "Send for Approval" button above. If send for approval button disabled, please review your qualification and make sure all required information has been entered. 
                            </p>
                            
                        </div>
                    </div> :
                    ("qualification" in AppLevelContext.userInfo && AppLevelContext.userInfo.qualification.state === "in_review") ?
                        <div className="d-flex flex-row">
                            <div className="mr-2"><i className="far fa-question-circle text-danger"></i></div>
                            <div>Your qualification details are being reviewed by our compliance team.
                            It takes 1-3 business days to approve the details depending on the scenario.
                        If there are any questions or concerns please contact us.</div>
                        </div> :
                        ("qualification" in AppLevelContext.userInfo && AppLevelContext.userInfo.qualification.state === "approved") ?
                            <div className="d-flex flex-row">
                                <div className="mr-2"><i className="fas text-info fa-user-check"></i></div>
                                <div>
                                    Your qualification has been <i className="text-info">approved</i> by our complaince team.
                                    Please click on "Request to Edit" if you wish to update your qualification.
                                </div>
                            </div> :
                        null
            }

        </div>
        
        <div className="row mt-3">
            <div className="col-sm-12 col-md-6 col-lg-6 col-xl-6">
                <ManageSpecialties />
            </div>
            <div className="col-sm-12 col-md-6 col-lg-6 col-xl-6">

            </div>
        </div>   
    </div>)
}