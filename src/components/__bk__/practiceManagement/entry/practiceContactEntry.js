import React, { useState, useEffect } from "react";
import { formjs, insertValues } from "@oi/utilities/lib/js/form";
import { Modal,ConfirmationBox } from "@oi/reactcomponents";

export const PracticeContactEntry = ({
    selectedPracticeInfo = {},
    onBackClick=null,
    onNextClick = null,
    setEntryData = null,
    onSubmission=null
}) => {

    const [facilityContacts, setFacilityContacts] = useState(Object.keys(selectedPracticeInfo).length > 0 ? selectedPracticeInfo.medical_facility_contact_information : []);
    const [showContactEntryForm, setShowContactEntryFormFlag] = useState(false);
    const [editContactId, setEditContactId] = useState("");
    const [showDeleteConfirmationBox,setShowDeleteConfirmationBoxFlag]=useState(false);

    useEffect(()=>{
        if(!showContactEntryForm){
            setEditContactId("");//reset edit contact id
        }
    },[showContactEntryForm])

    useEffect(()=>{
        if(!showDeleteConfirmationBox){
            setEditContactId("");//reset edit contact id
        }
    },[showDeleteConfirmationBox])

    const handleContactSubmission = (data) => {
        
        let contacts = [...facilityContacts];

        if (editContactId.length > 0) {
            data._id = editContactId;
            let indx = contacts.findIndex(c => c._id === editContactId);
            contacts[indx] = data;
        } else {
            data._id = getRandomId(facilityContacts.length);
            contacts.push(data);
        }

        setFacilityContacts(contacts);
        setShowContactEntryFormFlag(false);
    }

    const handleOnNext=()=>{
        //check if any contact present 
        try {
            $('#practice-entered-contacts').find('.required-err').remove();
            if(facilityContacts.length===0){
                throw new Error ("no contacts")
            }
            setEntryData({
                "medical_facility_contact_information":facilityContacts
            });
            onNextClick();
        } catch (error) {

            if(error==="no contacts"){
                $('#practice-entered-contacts').append('<div class="required-err">Atleast one contact is required</div>');
                popup.onBottomCenterRequiredErrorMsg("Atleast one contact is required");
            }
        }
        
    }

    const handleContactEdit = (_id) => {
        setEditContactId(_id);
        setShowContactEntryFormFlag(true);
    }

    const handleDeleteConfirmation=(_id)=>{
        setEditContactId(_id);
        setShowDeleteConfirmationBoxFlag(true);
    }

    const handleContactDeletion=()=>{

        let contacts = [...facilityContacts];

        let indx = contacts.findIndex(c => c._id === editContactId);
        let deletedContact=contacts.splice(indx,1);

        setFacilityContacts(contacts);
        setShowDeleteConfirmationBoxFlag(false);
    }

    return (<div id="contact-info-container">
        
        <label className="h5 font-weight-bold text-capitalize">Practice Contact Information</label>
        <div className="text-muted small mt-2">
            The contact information will be visible to patients and users searching healthcare providers (doctors) or facilities.
        </div>

        <div className="mt-2">
            <div id="practice-entered-contacts">
                {
                    facilityContacts.length > 0 ? <div>
                        {
                            facilityContacts.map((contact, indx) => {
                                return <div key={indx} className="small p-2 border-bottom position-relative">
                                    <div>
                                        <span>{contact.contact_info}</span>
                                        <span className="ml-2">({contact.contact_type})</span>
                                    </div>
                                    <div className="push-right d-flex">
                                        <div className="btn-link pointer " onClick={() => { handleContactEdit(contact._id) }}>Edit</div>
                                        <div className="btn-link text-danger ml-2 pointer" onClick={()=>{handleDeleteConfirmation(contact._id)}}>Delete</div>
                                    </div>
                                </div>
                            })
                        }
                    </div> : null
                }
            </div>

            <div className="mt-2 pt-2 pb-2 border-top border-bottom">
                <div className="small btn-link pointer" onClick={() => { setShowContactEntryFormFlag(true) }}>Add New Contact</div>
            </div>

            {
                onBackClick !== null && onNextClick !== null ?
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
                    </div> :
                onSubmission !== null ?
                        <div className="mt-2 text-center pt-2">
                            <button className="btn btn-primary w-75" 
                                type="submit" onClick={()=>{onSubmission({"medical_facility_contact_information":facilityContacts})}}>Save Information</button>
                        </div> :
                null
            }

        </div>
        {
            showContactEntryForm ?
                <Modal header={<h3>Contact Entry</h3>}
                    onCloseHandler={() => { setShowContactEntryFormFlag(false) }}>
                    <ContactEntryForm 
                        contactInfo={editContactId.length>0?facilityContacts.filter(c => c._id === editContactId)[0]:{}} 
                        onSubmission={handleContactSubmission} />
                </Modal> : null
        }

        {
            showDeleteConfirmationBox?
            <ConfirmationBox>
                <h4>Confirm Deletion</h4>
                <div className="mt-2">Are you sure you would like to delete the contact information</div>
                <div className="d-flex justify-content-end">
                    <div className="btn-sm btn-danger small pointer" onClick={()=>{handleContactDeletion()}}>Yes</div>
                    <div className="btn-sm btn-link small ml-3 pointer" onClick={()=>{setShowDeleteConfirmationBoxFlag(false)}}>No</div>
                </div>
            </ConfirmationBox>:
            null
        }

    </div>);
}

const ContactEntryForm = ({onSubmission={},contactInfo={}}) => {
    let contactFormRef=React.createRef();

    useEffect(()=>{
        if(Object.keys(contactInfo).length>0){

            let _insertValues = new insertValues();
            _insertValues.container = $(contactFormRef.current);

            _insertValues.insert(contactInfo);
        }
    },[]);

    const handleContactSubmission = (e) => {

        try {
            e.preventDefault();
            let form = e.target;

            let _formjs = new formjs();
            let validate = _formjs.validateForm(form);

            if(validate>0){
                throw new Error("validation error");
            }

            //Get values 
            let data = {};
            $(form).find('.entry-field[name]').each(function () {
                let fd = _formjs.getFieldData(this);
                data = Object.assign(data, fd);
            });

            onSubmission(data);//sends data to parent component

        } catch (error) {
            console.log(error);
            if(error==="validatin error") popup.onBottomCenterRequiredErrorMsg();
        }

    }

    return (<form onSubmit={(e) => { handleContactSubmission(e) }} ref={contactFormRef}>
        <div className="form-group">
            <label data-required="1">Contact Type</label>
            <select name="contact_type"
                className="form-control entry-field" data-required="1"
                placeholder="Contact Type">
                <option value="">- Select contact type -</option>
                <option value="Mobile Phone">Mobile Phone</option>
                <option value="Business Phone">Business Phone</option>
                <option value="Email">Email</option>
                <option value="Fax">Fax</option>
            </select>
        </div>
        <div className="form-group">
            <label data-required="1">Contact info</label>
            <input type="text" name="contact_info"
                className="form-control entry-field" data-required="1"
                placeholder="Contact information" />
        </div>
        <div className="mt-2 text-center pt-2" >
            <button className="btn btn-info w-75" type="submit">Save Contact Information</button>
        </div>
    </form>)
}