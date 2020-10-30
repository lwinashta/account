import React, { useContext, useState } from 'react';
import { Modal} from "@oi/reactcomponents";
import { PracticeContext } from "../../../contexts/practice";
import { UserInfo } from "../../../contexts/userInfo";
import { DisplayPracticeTypes } from "@oi/reactcomponents/provider-practice";
import { PracticeInformationEntry } from "./../entry/practiceInformationEntry";
import { updateFacilityInfo } from "./../common/methods";

export const DisplayPracticeGeneralInfo = () => {
    
    let contextValues = useContext(PracticeContext);
    let facilityInfo = contextValues.facilityInfo;
    let facilityTypes=useContext(UserInfo).facilityTypes;

    const [showEntryForm,setEntryFormFlag]=useState(false);

    const handleEditInfo=(data)=>{

        data._id=facilityInfo._id

        //Submit the information to the server 
        updateFacilityInfo(data).then(response=>{
            contextValues.updateFacilityStateInfo(data);
            setEntryFormFlag(false);
            popup.onBottomCenterSuccessMessage("Practice Info Updated");
        }).catch(err=>{
            console.log(err);
            popup.onBottomCenterErrorOccured();
        })
    }
    
    return (<div>
        <div className="font-weight-bold">General Information</div>
        <div className="small">
            <DisplayPracticeTypes
                types={facilityInfo.medical_facility_type}
                facilityTypes={facilityTypes} />
        </div>
        <div className="mt-2 small">{facilityInfo.medical_facility_description}</div>
        {
            !facilityInfo.verified?
            <div className="push-right" >
                <div className="small pointer mr-2 btn-link" onClick={()=>{setEntryFormFlag(true)}}>Edit</div>
            </div>:
            null
        }
        
        {
            showEntryForm?
            <Modal header={<h3>Practice Entry</h3>} 
                onCloseHandler={()=>{setEntryFormFlag(false)}}>
                <PracticeInformationEntry 
                    selectedPracticeInfo={facilityInfo} 
                    onSubmission={handleEditInfo} />
            </Modal>:
            null
        }
    </div>)
}