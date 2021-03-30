import React, { useContext,useState } from 'react';
import { PracticeContext } from "../../../contexts/practice";
import { Modal} from "@oi/reactcomponents";
import { DisplayPracticeContact } from "@oi/reactcomponents/provider-practice";
import { PracticeContactEntry } from './../entry/practiceContactEntry';
import { updateFacilityInfo } from "./../common/methods";

export const DisplayPracticeContactInstance = () => {
    
    let contextValues = useContext(PracticeContext);
    let facilityInfo=contextValues.facilityInfo;

    const [showEntryForm,setEntryFormFlag]=useState(false);

    const handleEditInfo=(data)=>{

        data._id=facilityInfo._id

        //console.log(data);

        //Submit the information to the server 
        updateFacilityInfo(data).then(response=>{
            contextValues.updateFacilityStateInfo(data);
            setEntryFormFlag(false);
            popup.onBottomCenterSuccessMessage("Practice Contact Updated");

        }).catch(err=>{
            console.log(err);
            popup.onBottomCenterErrorOccured();
        })
    }

    return (<div>
            <div className="font-weight-bold">Contact</div>
            <div className="text-muted small">
                <DisplayPracticeContact contacts={facilityInfo.medical_facility_contact_information} />
            </div>
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
                    <PracticeContactEntry 
                        selectedPracticeInfo={facilityInfo} 
                        onSubmission={handleEditInfo} />
                </Modal>:
                null
            }
    </div>)
}