import React, { useContext,useState } from 'react';
import { PracticeContext } from "../../../contexts/practice";
import { Modal } from "@oi/reactcomponents";
import { ShowAvailability } from "@oi/reactcomponents/provider-practice";
import { PracticeAvailabilityEntry } from './../entry/practiceAvailabilityEntry'
import { updatePracticeUser } from "./../common/methods";

export const DisplayPracticeAvailability = () => {

    let contextValues = useContext(PracticeContext);
    let userPractice=contextValues.practice;
    let availability=contextValues.practice.availability_information

    const [showEntryForm, setEntryFormFlag] = useState(false);

    const handleEditInfo=(data)=>{

        data._id=userPractice._id

        //console.log(data);

        //Submit the information to the server 
        updatePracticeUser(data).then(response=>{
            contextValues.updateFacilityUserInfo(data);
            setEntryFormFlag(false);
            popup.onBottomCenterSuccessMessage("Practice Availability Updated");

        }).catch(err=>{
            console.log(err);
            popup.onBottomCenterErrorOccured();
        })
    }

    return (<div>
        <div className="font-weight-bold">Availability</div>
        <div className="mt-2 small">
            <ShowAvailability availability={availability} />
        </div>
        {
            !userPractice.verified ?
                <div className="push-right" >
                    <div className="small pointer mr-2 btn-link" onClick={() => { setEntryFormFlag(true) }}>Edit</div>
                </div> :
                null
        }

        {
            showEntryForm ?
                <Modal header={<h3>Practice Entry</h3>}
                    onCloseHandler={() => { setEntryFormFlag(false) }}>
                    <PracticeAvailabilityEntry
                        selectedPracticeInfo={userPractice}
                        onSubmission={handleEditInfo} />
                </Modal> :
                null
        }
    </div>)
}