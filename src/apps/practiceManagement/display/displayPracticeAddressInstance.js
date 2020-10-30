import React, { useContext,useState } from 'react';
import { PracticeContext } from "../../../contexts/practice";
import { Modal} from "@oi/reactcomponents";
import {DisplayPracticeAddress} from "@oi/reactcomponents/provider-practice";
import { PracticeAddressEntry } from "./../entry/practiceAddressEntry";
import { updateFacilityInfo } from "./../common/methods";

export const DisplayPracticeAddressInstance = () => {
    
    let contextValues = useContext(PracticeContext);
    let facilityInfo=contextValues.facilityInfo;

    const [showEntryForm,setEntryFormFlag]=useState(false);

    const handleEditInfo=(data)=>{

        data._id=facilityInfo._id

        //Submit the information to the server 
        updateFacilityInfo(data).then(response=>{
            contextValues.updateFacilityStateInfo(data);
            setEntryFormFlag(false);
            popup.onBottomCenterSuccessMessage("Practice Address Updated");
        
        }).catch(err=>{
            console.log(err);
            popup.onBottomCenterErrorOccured();
        });
    }

    return (<div>
        <div className="font-weight-bold">Address</div>
        <div className="text-muted small mt-2">
            <DisplayPracticeAddress address={facilityInfo} />
        </div>
        {
            !facilityInfo.verified?
            <div className="push-right" >
                <div className="small pointer mr-2 btn-link"
                onClick={()=>{setEntryFormFlag(true)}}>Edit</div>
            </div>:
            null
        }
        {
            showEntryForm?
            <Modal header={<h3>Practice Entry</h3>} 
                onCloseHandler={()=>{setEntryFormFlag(false)}}>
                <PracticeAddressEntry 
                    selectedPracticeInfo={facilityInfo} 
                    onSubmission={handleEditInfo} />
            </Modal>:
            null
        }
    </div>)
}