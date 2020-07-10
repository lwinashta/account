import React from "react";
import { DisplayPracticeAddress,
    DisplayPracticeContact,
    DisplayPracticeTypes, 
    DisplayPracticeVerification} from "./displayComponents";

export const DisplayFacilityInfo = ({facilityInfo={}}) => {
    return (
        <div>
            <div className="pb-1">{facilityInfo.medical_facility_name}</div>
            <div className="small mt-2">
                <div>
                    <DisplayPracticeVerification verified={facilityInfo.verified} />
                </div>
                <div className="text-muted mt-2">
                    <DisplayPracticeAddress address={facilityInfo} />
                </div>
                <div className="mt-2">{"medical_facility_description" in facilityInfo && facilityInfo.medical_facility_description.length > 0 ? facilityInfo.medical_facility_description : ""}</div>
                <div className="mt-2"><DisplayPracticeTypes types={facilityInfo.medical_facility_type} /></div>
            </div>
        </div>
    );
}