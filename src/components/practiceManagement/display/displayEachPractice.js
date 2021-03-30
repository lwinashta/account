import React, { useEffect, useState, useContext } from 'react';
import { UserInfo } from "../../../contexts/userInfo";
import {PracticeContext} from "../../../contexts/practice";


import { DisplayPracticeSettings } from "./displayPracticeSettings";
import { DisplayPracticeGeneralInfo } from './displayPracticeGeneralInfo';
import { DisplayPracticeFiles } from './displayPracticeFiles';
import { DisplayPracticeAddressInstance } from "./displayPracticeAddressInstance";
import { DisplayPracticeAvailability } from './displayPracticeAvailability';
import { DisplayPracticeContactInstance } from './displayPracticeContactInstance';
import { DisplayVerification } from "./displayVerification";

export const DisplayEachPractice = ({ practice = {} }) => {

    const [viewMore, setViewMore] = useState(false);
    
    return (
        <UserInfo.Consumer>
            {({
                facilityTypes=[],
                updateFacilityStateInfo={},
                updateFacilityUserInfo={}
            }) => {
                return <PracticeContext.Provider value={{
                    practice:practice,
                    facilityInfo:practice.facilityInfo[0],
                    updateFacilityStateInfo:updateFacilityStateInfo,
                    updateFacilityUserInfo:updateFacilityUserInfo
                }}>
                    <div key={practice._id} className="bg-white p-2 border rounded mt-2 mb-2" >
                        
                        <div className="d-flex pb-1 border-bottom">
                            <div className="font-weight-bold">{practice.facilityInfo[0].medical_facility_name}</div>
                            <div>
                                <DisplayVerification 
                                    practiceAffiliationVerified={practice.verified} 
                                    practiceVerified={practice.facilityInfo[0].verified} />
                            </div>
                        </div>

                        {/* {PRACTICE GENERAL INFORMATION} */}
                        <div className="pt-2 pb-2 border-bottom position-relative">
                            <DisplayPracticeGeneralInfo />
                        </div>

                        {/* {PRACTICE ADDRESS} */}
                        <div className="pt-2 pb-2 border-bottom position-relative">
                            <DisplayPracticeAddressInstance />
                        </div>

                        {/* {PRACTICE FILES} */}
                        <div className="pt-2 pb-2 border-bottom position-relative">
                            <DisplayPracticeFiles />
                        </div>
                        
                        {/* {PRACTICE CONTACT} */}
                        <div className="pt-2 pb-2 border-bottom position-relative">
                            <DisplayPracticeContactInstance />
                        </div>

                        {/* {MORE INFORMATION} */}
                        <div>
                            {
                                !viewMore ?
                                    <div className="pt-2 pb-2 border-bottom position-relative"
                                        onClick={() => { setViewMore(true) }}>
                                        <div className="push-right btn-link pointer">
                                            <i className="fas fa-chevron-down"></i>
                                        </div>
                                        <div>
                                            <div className="font-weight-bold">More Information</div>
                                            <div className="text-muted small">Hours,Settings etc.</div>
                                        </div>
                                    </div> :
                                    <div>
                                        <div className="pt-2 pb-2 border-bottom position-relative">
                                            <DisplayPracticeAvailability />
                                        </div>
                                        <div className="pt-2 pb-2 border-bottom position-relative">
                                            <div className="font-weight-bold">Settings</div>
                                            <div className="mt-2 small">
                                                <DisplayPracticeSettings hasEditBtn={true} />
                                            </div>
                                        </div>
                                        <div className="pt-2 pb-2 border-bottom position-relative" onClick={() => { setViewMore(false) }}>
                                            <div className="small btn-link pointer">Show less</div>
                                        </div>
                                    </div>
                            }

                        </div>

                    </div>
            
                </PracticeContext.Provider>
                }}
        </UserInfo.Consumer>
    )

}