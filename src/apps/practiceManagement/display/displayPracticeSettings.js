import React,{useContext,useState} from "react";
import { PracticeContext } from "../../../contexts/practice";
import { PracticeSettingsEntry } from "./../entry/practiceSettingsEntry";
import { Modal } from "@oi/reactcomponents";
import { updatePracticeUser } from "./../common/methods";

export const DisplayPracticeSettings = ({settings={},hasEditBtn=false}) => {
    
    let contextValues=useContext(PracticeContext);
    
    let info = Object.keys(contextValues).length>0?contextValues.practice.settings:
        Object.keys(settings).length>0?settings:
        null;

    const [showEntryForm, setEntryFormFlag] = useState(false);

    const handleEditInfo=(data)=>{

        data._id=contextValues.practice._id

        console.log(data);

        //Submit the information to the server 
        updatePracticeUser(data).then(response=>{
            contextValues.updateFacilityUserInfo(data);
            setEntryFormFlag(false);
            popup.onBottomCenterSuccessMessage("Practice Settings Updated");

        }).catch(err=>{
            console.log(err);
            popup.onBottomCenterErrorOccured();
        })
    }

    return (<div className="position-relative">
        <div className="border-bottom pb-2">
            <div className="text-muted">Appointment slot gap are set to {info.appointment_time_slot_diff} minutes</div>
        </div>
        <div className="pt-2 pb-2">
            <div className="font-weight-bold">Allowed Appointment Booking Types:</div>
            <div>
                {
                    info.appointment_allowed_booking_types.map((type, indx) => {
                        if (type === "inperson") return <span key={indx} className={indx > 0 ? "dot-seprator mr-2" : ""}>In Person</span>
                        if (type === "video") return <span key={indx} className={indx > 0 ? "dot-seprator mr-2" : ""}>Video Consultation</span>
                    })
                }
            </div>
        </div>
        
        <div className="push-right" style={{top:'-30px'}} onClick={()=>{setEntryFormFlag(true)}}>
            <div className="pointer mr-2 btn-link">Edit</div>
        </div> 

        {
            showEntryForm ?
                <Modal header={<h3>Practice Settings</h3>}
                    onCloseHandler={() => { setEntryFormFlag(false) }}>
                    <PracticeSettingsEntry
                        selectedPracticeInfo={contextValues.practice}
                        onSubmission={handleEditInfo} />
                </Modal> :
                null
        }

    </div>)
}