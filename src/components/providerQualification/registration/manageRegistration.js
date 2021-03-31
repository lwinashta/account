import React, { useEffect, useState, useContext } from "react";

import { setFirstLetterUpperCase } from '@oi/utilities/lib/ui/utils';
import { OnScreenMessage } from "core/components/popups/web/popups";

import { AppContext } from "../../AppContext";

export const ManageRegistration = () => {

    let AppLevelContext = useContext(AppContext);

    const [showMedicalRegistraionEntryForm, setShowMedicalRegistrationEntryFormFlag] = useState(false);
    
    /** Render */
    return (<>
        <div className="tile bg-white">
            <div className="d-flex flex-row justify-content-between p-2 border-bottom">
                <div className="font-weight-bold">Medical Registration <i className="text-danger">(* Required)</i></div>
                <div className="pointer" onClick={() => {
                        setShowSpecialtyEntryFormFlag(true);
                        }}>
                {
                    ("medicalRegistration" in AppLevelContext.userInfo) && Object.keys(AppLevelContext.userInfo.medicalRegistration).length > 0 ?
                    <i className="fas fa-pencil-alt"></i>:
                    <i className="fas fa-plus"></i>
                }
                </div>
            </div>

            <div className="px-2 pt-2">
                Medical Registration is required information for the approval of your profile. 
                Please add all the required details for medical registration to avoid unnecessary delays. 
            </div>

            <div className="d-flex flex-row flex-wrap">
                {
                    ("medicalRegistration" in AppLevelContext.userInfo) && Object.keys(AppLevelContext.userInfo.medicalRegistration).length > 0 ?
                        <div>
                            <div>{AppLevelContext.userInfo.medicalRegistration.state}, {AppLevelContext.userInfo.medicalRegistration.country.name}</div>
                        </div> :
                        null
                }
            </div>


        </div>
    </>)
}

// Name : KAMISETTI DHANANJAYA
// Address : E AMHERST NY
// Profession : MEDICINE
// License No: 165332
// Date of Licensure : 01/30/1986
// Additional Qualification :  
// Status : REGISTERED
// Registered through last day of : 02/22
// Medical School: TIRUPATI UNIV-SRI VENKATE     Degree Date : 06/30/1979
