import React,{useContext} from 'react';
import { PracticeName, PracticeFacilityTypes } from "./generalInfo";
import { DisplayAddress } from "./address";
import { DisplayPracticeContact } from "account-manager-module/lib/practiceManagement/components/display/contacts/web/displayPracticeContacts";

import { DisplayUploadedFileTile } from "core/components/infoDisplay/files/web/displayUploadedFileTile";
import { DisplayFilePreviewModal } from "core/components/infoDisplay/files/web/displayFilePreviewModal";

import { FormContext } from "../forms/formContext";

export const InReviewItems=({
    facilityInfo={}
})=>{

    let contextValues=useContext(FormContext);

    return (<div>
        <div className="py-2 border-bottom">
            <div style={{ flexGrow: 2 }}>
                Following items cannot be edited  {
                    facilityInfo.verificationState === "in_review" ? "since they are currently under review " :
                    facilityInfo.verificationState === "approved" ? "since they have been approved" :
                        null
                }
            </div>
        </div>
        <div className="py-2 border-bottom">
            <div className="font-weight-bold">Name</div>
            <PracticeName facilityInfo={facilityInfo} />
        </div>
        <div className="py-2 border-bottom">
            <div className="font-weight-bold">Facility Type(s)</div>
            <PracticeFacilityTypes facilityInfo={facilityInfo} />
        </div>
        <div className="py-2 border-bottom">
            <div className="font-weight-bold">Address</div>
            <DisplayAddress facilityInfo={facilityInfo} />
        </div> 
        <div className="border-bottom py-2">
            <div className="font-weight-bold">Contact</div>
            <DisplayPracticeContact contacts={facilityInfo.contacts} />
        </div>
        <div className="border-bottom py-2">
            <div className="font-weight-bold">Supporting Documents</div>
            {
                facilityInfo.ownershipPictures.length>0?
                facilityInfo.ownershipPictures.map(fr=>{
                    return <div className="mr-2 border"
                        style={{ width: "100px" }}
                        key={fr._id}>
                        <DisplayUploadedFileTile
                            fileProps={fr}
                            fileSrc={`/file/fs/${fr._id}`} />
                    </div>
                }):
                <div className="text-muted py-2">none uploaded</div>
            }
        </div>
        <div className="d-flex flex-row justify-content-end mt-3">
            <div className="btn btn-primary pointer" 
                onClick={()=>{contextValues.handleTabClick("pictures","in_review")}}>
                    <i className="mr-2 fas fa-arrow-right"></i>
                    <span>Next</span>
                </div>
        </div>
    </div>);
}