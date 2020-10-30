import React, { useState, useEffect }from "react";

export const DisplayPracticeVerification=({verified=false})=>{
    return (
        <div>
            {verified?
                <div className="d-flex mt-2">
                    <div className="text-success align-top">
                        <span className="fas fa-check"></span>
                    </div>
                    <div className="ml-2 text-success align-top">
                        This practice has been <b>verified</b> by our complaince team. 
                        Practice is now viewable to patients in the search results. 
                        Please contact us to update practice information.
                    </div>
                </div>
                :
                <div className="d-flex mt-2">
                    <div className="text-danger align-top">
                        <span className="fas fa-exclamation"></span>
                    </div>
                    <div className="ml-2 text-danger align-top">
                        This practice is <b>pending verification</b> from our compliance team. 
                        Verification generally takes 24-48 hours depending on the location. Please contact us if you there are any concerns.
                    </div>
                </div>
            }
        </div>
    );
}

export const DisplayPracticeUserVerification=({verified=false})=>{
    return (
        <div>
            {verified?
                <div className="d-flex mt-2">
                    <div className="text-success align-top">
                        <span className="fas fa-check"></span>
                    </div>
                    <div className="ml-2 text-success align-top">
                        Your affiliation with this practice has been <b>verified</b> by our complaince team. Your profile will now be viewable and searchable.
                    </div>
                </div>
                :
                <div className="d-flex mt-2">
                    <div className="text-danger align-top">
                        <span className="fas fa-exclamation"></span>
                    </div>
                    <div className="ml-2 text-danger align-top">
                        Your affiliation with this practice  is <b>pending verification</b> from our compliance team. 
                        Verification generally takes 24-48 hours depending on the location. Please contact us if you there are any concerns.
                    </div>
                </div>
            }
        </div>
    );
}
