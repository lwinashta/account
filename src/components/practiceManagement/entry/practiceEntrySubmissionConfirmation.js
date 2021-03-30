import React, { useState } from "react";
import {
    ShowAvailability,
    DisplayPracticeAddress,
    DisplayPracticeContact,
    DisplayPracticeTypes
} from "@oi/reactcomponents/provider-practice";

import { DisplayPracticeSettings } from "./../display/displayPracticeSettings";
import { fileUploadField } from "@oi/utilities/lib/js/form";
import { UserInfo } from "../../../contexts/userInfo";

export const PracticeEntrySubmissionConfirmation = ({
    practiceEntryData = {},
    onSubmission = {},
    setCurrentTab=function(){}
}) => {

    let fupload=new fileUploadField();

    return (
        <UserInfo.Consumer>
            {({ facilityTypes = [] }) => {
                return <div className="p-2">
                    {
                        Object.keys(practiceEntryData).length > 0 ?
                            <div>
                                <div className="pt-2 pb-2 border-bottom position-relative ">
                                    <div className="font-weight-bold">General Information</div>
                                    <div className="push-right" onClick={()=>{setCurrentTab('practice-general-info')}}>
                                        <div className="small pointer mr-2 btn-link">Edit</div>
                                    </div>
                                    <div className="mt-2 text-muted">
                                        <div className="font-weight-bold">{practiceEntryData.medical_facility_name}</div>
                                        <div className="small">
                                            <DisplayPracticeTypes
                                                types={practiceEntryData.medical_facility_type}
                                                facilityTypes={facilityTypes} />
                                        </div>
                                        <div className="pt-2 small">
                                            {practiceEntryData.medical_facility_description}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2 pb-2 border-bottom position-relative">
                                    <div className="font-weight-bold">Address</div>
                                    <div className="push-right">
                                        <div className="small pointer mr-2 btn-link" onClick={()=>{setCurrentTab('practice-address')}}>Edit</div>
                                    </div>
                                    <div className="mt-2">
                                        <div className="text-muted small">
                                            <DisplayPracticeAddress address={practiceEntryData} />
                                        </div>
                                    </div>
                                    
                                </div>

                                <div className="pt-2 pb-2 border-bottom position-relative">
                                    <div className="font-weight-bold">Pictures</div>
                                    <div className="push-right" onClick={()=>{setCurrentTab('practice-pictures')}}>
                                        <div className="small pointer mr-2 btn-link">Edit</div>
                                    </div>
                                    <div className="mt-2 d-flex flex-wrap">
                                        {
                                            Object.keys(practiceEntryData.facilityFiles).map((key,indx)=>{
                                                let file=practiceEntryData.facilityFiles[key];
                                                return <div className="ml-2 border rounded mb-2" style={{width:'100px','height':'100px'}} key={indx}>
                                                    <InlineFilePreviewByFileReader file={file} />
                                                </div>
                                            })
                                        }
                                    </div>
                                </div>

                                <div className="pt-2 pb-2 border-bottom position-relative">
                                    <div className="font-weight-bold">Contact Information</div>
                                    <div className="push-right" onClick={()=>{setCurrentTab('practice-contact')}}>
                                        <div className="small pointer mr-2 btn-link">Edit</div>
                                    </div>
                                    <div className="mt-2">
                                        <div className="text-muted small">
                                            <DisplayPracticeContact contacts={practiceEntryData.medical_facility_contact_information} />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2 pb-2 border-bottom position-relative">
                                    <div className="font-weight-bold">Availability</div>
                                    <div className="push-right" onClick={()=>{setCurrentTab('practice-availability')}}>
                                        <div className="small pointer mr-2 btn-link">Edit</div>
                                    </div>
                                    <div className="mt-2 ">
                                        <div className="text-muted small">
                                            <ShowAvailability availability={practiceEntryData.availability_information} />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2 pb-2 border-bottom position-relative">
                                    <div className="font-weight-bold">Settings</div>
                                    <div className="push-right" onClick={()=>{setCurrentTab('practice-settings')}}>
                                        <div className="small pointer btn-link">Edit</div>
                                    </div>
                                    <div className="mt-1">
                                        <div className="text-muted small">
                                            <DisplayPracticeSettings 
                                                practiceInfo={practiceEntryData.settings} />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-2 text-center pt-2" onClick={()=>{onSubmission()}}>
                                    <button className="btn btn-info w-75" type="submit">Save Practice Information</button>
                                </div>                  
                        </div> :
                        null

                    }

                </div>
            }}
        </UserInfo.Consumer>
    )

}

export const InlineFilePreviewByFileReader = ({ file }) => {
    
    let reader = new FileReader();
    reader.readAsDataURL(file);

    const [src,setSrc]=useState(null);

    reader.onload = function () {
        //console.log(event.target.result);
        setSrc(reader.result);
    }

    return (<div className="p-2 w-100 h-100">
        {
            src!==null?
            <div>
                {/image\//.test(file.type) ? <img className="mw-100" src={src} /> : <embed className="mw-100" src={src} />}
            </div>:
            null
        }
    </div>)
}
