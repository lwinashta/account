import React, { useState, useEffect } from "react";
import { Modal,ConfirmationBox } from "@oi/reactcomponents";
import { AvailabilityEntryForm } from "./availabilityEntryForm";
import { ShowAvailability } from "@oi/reactcomponents/provider-practice";

export const PracticeAvailabilityEntry = ({
    selectedPracticeInfo = {},
    onBackClick = null,
    onNextClick = null,
    setEntryData = null,
    onSubmission=null
}) => {

    const [availability, setAvailability] = useState(Object.keys(selectedPracticeInfo).length > 0 ? selectedPracticeInfo.availability_information : []);
    const [showAvialabilityEntryForm, setShowAvialabilityEntryFormFlag] = useState(false);
    const [editAvailabilityId, setEditAvailabilityId] = useState("");
    const [showDeleteConfirmationBox,setShowDeleteConfirmationBoxFlag]=useState(false);

    useEffect(()=>{
        if(!showAvialabilityEntryForm && !showDeleteConfirmationBox){
            setEditAvailabilityId("");
        }
    },[showAvialabilityEntryForm,showDeleteConfirmationBox])

    const handleAvailabilityEntrySubmission = (data) => {

        let userAvailability = [...availability];

        if (editAvailabilityId.length > 0) {
            let indx = userAvailability.findIndex(a => a._id === editAvailabilityId);
            userAvailability[indx] = data;
        } else {
            userAvailability.push(data);
        }

        setAvailability(userAvailability);
        setShowAvialabilityEntryFormFlag(false);

    }

    const handleOnNext=()=>{
        //check if any contact present 
        try {
            $('#availability-inner-container').find('.required-err').remove();
            if(availability.length===0){
                throw new Error ("no availability")
            }
            setEntryData({
                availability_information: userAvailability
            });
            onNextClick();
        } catch (error) {

            if(error==="no availability"){
                $('#availability-inner-container').append('<div class="required-err">Atleast one availability information is required</div>');
                popup.onBottomCenterRequiredErrorMsg("Atleast one availability is required");
            
            }
        }
        
    }

    const handleEditAvailability = (_id) => {
        setEditAvailabilityId(_id);
        setShowAvialabilityEntryFormFlag(true);
    }

    const handleDeleteConfirmation=(_id)=>{
        setEditAvailabilityId(_id);
        setShowDeleteConfirmationBoxFlag(true);
    }

    const handleAvailabilityDeletion=()=>{

        let _availability = [...availability];

        let indx = _availability.findIndex(c => c._id === editContactId);
        let deletedAvailability=_availability.splice(indx,1);

        setAvailability(_availability);
        setEntryData({
            "availability_information":_availability
        });

        setShowDeleteConfirmationBoxFlag(false);
    }

    return (
        <div className="form-group" id="availability-container">
            <div className="h5 font-weight-bold text-capitalize">Practice Availability</div>
            <div>
                <div className="text-muted small">
                    The availability information will be visible to all users or patients
                    viewing your profile. System will determine the next available
                    appointments per the availability provided here.
            <br />
                </div>
            </div>

            <div className="mt-2" >
                <div className="small" id="availability-inner-container">
                    {
                        availability.length > 0 ? <div>
                            {availability.map((av, indx) => {
                                return <div key={av._id} className="border-bottom p-2 position-relative">
                                    <ShowAvailability
                                        availability={av}
                                        showEachForEntry={true} />
                                    <div className="push-right d-flex">
                                        <div className="btn-link pointer" onClick={() => { handleEditAvailability(av._id) }}>Edit</div>
                                        <div className="btn-link ml-2 text-danger pointer" onClick={()=>{handleDeleteConfirmation(av._id)}}>Delete</div>
                                    </div>
                                </div>
                            })}
                        </div> : null
                    }
                </div>

                <div className="mt-2 pt-2 pb-2 border-top border-bottom">
                    <div className="small btn-link pointer" onClick={() => { setShowAvialabilityEntryFormFlag(true) }}>Add Availability</div>
                </div>
                
                {
                    onBackClick!==null && onNextClick!==null?
                        <div className="mt-2 d-flex justify-content-between">
                            <div className="btn-sm btn-secondary pointer small"
                                onClick={() => { onBackClick() }}>
                                <i className="fas fa-chevron-left mr-2"></i>
                                <span>Back</span>
                            </div>
                            <div className="btn-sm btn-info pointer small"
                                onClick={() => { handleOnNext() }}>
                                <span>Next</span>
                                <i className="fas fa-chevron-right ml-2"></i>
                            </div>
                        </div>:
                    onSubmission!==null?
                    <div className="mt-2 text-center pt-2">
                        <button className="btn btn-primary w-75" onClick={()=>{onSubmission({
                            availability_information:availability
                        })}}
                            type="submit">Save Information</button>
                    </div>:
                    null
                }
                

            </div>

            {
                showAvialabilityEntryForm ?
                    <Modal header={<h3>Availability Entry</h3>}
                        onCloseHandler={() => { setShowAvialabilityEntryFormFlag(false) }}>
                        <AvailabilityEntryForm
                            _editAvailabilityId={editAvailabilityId}
                            _editAvailabilityInfo={editAvailabilityId.length > 0 ? availability.filter(v => v._id === editAvailabilityId)[0] : {}}
                            _indx={Object.keys(selectedPracticeInfo).length > 0 ? selectedPracticeInfo.availability_information.length : 0}
                            onSubmission={handleAvailabilityEntrySubmission} />
                    </Modal> : null
            }

            {
                showDeleteConfirmationBox?
                <ConfirmationBox>
                    <h4>Confirm Deletion</h4>
                    <div className="mt-2">Are you sure you would like to delete this availability</div>
                    <div className="d-flex justify-content-end">
                        <div className="btn-sm btn-danger small" onClick={()=>{handleAvailabilityDeletion()}}>Yes</div>
                        <div className="btn-sm btn-link small ml-3" onClick={()=>{setShowDeleteConfirmationBoxFlag(false)}}>No</div>
                    </div>
                </ConfirmationBox>:
                null
            }

        </div>);
}