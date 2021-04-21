import React, { useState, useContext,useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';

import { FormContext } from "./../formContext";

import { FieldEntryError } from "form-module/fieldEntryError";

export const PracticeContactForm = () => {

    let contextValues=useContext(FormContext);

    const [contacts, setContacts] = useState(contextValues.practiceToUpdate!==null?
            contextValues.practiceToUpdate.contacts:
            []);
    const [validationErrors,setValidationErrors]=useState([]);

    const addNewContacts = () => {
        let _d = [...contacts];
        _d.push({
            uuid: uuidv4()
        });
        setContacts(_d);
    }

    const handleOnEntry=(data)=>{

        let _d=[...contacts];

        let indx=_d.findIndex(i=>i.uuid===data.uuid);
        _d[indx]=Object.assign(_d[indx],data);

        contextValues.handleFormValues({
            contacts: _d
        });

        setContacts(_d);
    }

    const removeContact=(data)=>{
        let _d=[...contacts];

        let indx=_d.findIndex(i=>i.uuid===data.uuid);
        _d.splice(indx,1);

        contextValues.handleFormValues({
            contacts: _d
        });

        setContacts(_d);
    }   

    const validateData=()=>{
        
        let _d=contextValues.getFormValues("contacts");
        let _v=[];

        if(_d.length===0){
            _v.push({
                noContact:true
            });
        }

        if(_d.length>0){
            _d.forEach(element => {
                if(!('contactInfo' in element) ||  (('contactInfo' in element) && element.contactInfo.length===0)){
                    _v.push({
                        noContactInfo:true,
                        contactUuid:element.uuid
                    });
                }
                if(!('contactType' in element) ||  (('contactType' in element) && element.contactType.length===0)){
                    _v.push({
                        noContactType:true,
                        contactUuid:element.uuid
                    });
                }
            });
        }
        return _v;

    }

    const handleNextClick=()=>{
        let _v=validateData();
        //console.log(_v);
        if(_v.length>0){
            setValidationErrors(_v);
        }else{
            setValidationErrors([]);
            contextValues.handleTabClick("pictures","contacts");
        }
    }

    const handlePrevClick=()=>{
        let _v=validateData();
        if(_v.length>0){
            setValidationErrors(_v);
        }else{
            setValidationErrors([]);
            contextValues.handleTabClick("address","contacts")
        }
        
    }

    return (<div>
            <div className="mb-3 font-weight-bold text-primary">Practice Contact Information:</div>
        <div className="text-muted mb-2">
            The contact information will be visible to patients and users searching healthcare providers (doctors) or facilities.
        </div>

        <div className="mt-2">
            {
                contacts.length > 0 ?
                    <div>
                        {
                            contacts.map((contact, indx) => {
                                return <div className="d-flex flex-row align-items-center" key={contact.uuid}>
                                    <div>
                                        <ContactEntryForm
                                            validationErrors={validationErrors}
                                            handleOnEntry={handleOnEntry}
                                            contactInfo={contact}
                                             />
                                    </div>
                                    <div className="ml-2">
                                        <div className="icon-button"
                                            onClick={() => {
                                                removeContact(contact)
                                            }}><i className="fas fa-times"></i></div>
                                    </div>
                                </div>

                            })
                        }
                    </div> : null
            }

            {
                validationErrors.length>0 && validationErrors.filter(v=>v.noContact).length>0?
                    <FieldEntryError title="Please enter contact information. Atleast one contact information is required" prefix={null} />:
                null
            }           

            <div className="mt-2 pt-2 pb-2 border-top border-bottom">
                <div className="btn-link pointer" 
                    onClick={() => { addNewContacts() }}>
                    Add New Contact
                </div>
            </div>

        </div>

        <div className="d-flex flex-row justify-content-between mt-4">
                <div className="btn btn-secondary pointer" 
                    onClick={()=>{handlePrevClick()}}>
                        <i className="mr-2 fas fa-arrow-left"></i>
                        <span>Previous</span>
                </div>
                <div className="flex-row d-flex">
                    {
                        contextValues.practiceToUpdate!==null?
                        <div className="mr-2 btn btn-success pointer">
                            Submit Information
                        </div>:
                        null
                    }
                    <div className="btn btn-primary pointer" 
                        onClick={()=>{handleNextClick()}}>
                            <i className="mr-2 fas fa-arrow-right"></i>
                            <span>Next</span>
                    </div>
                </div>
            </div>
    </div>);
}

const ContactEntryForm = ({
    validationErrors=[],
    contactInfo=null,
    handleOnEntry=function(){}
}) => {

    return (<div className="mt-2 d-flex flex-row">
        <div className="form-group px-2" style={{flexGrow:1}}>
            <select name="contactType"
                className="form-control" 
                defaultValue={'contactType' in contactInfo?contactInfo.contactType:null}
                onChange={(e)=>{
                    handleOnEntry(Object.assign(contactInfo,{
                        contactType:e.target.value
                    }))
                }}
                placeholder="Contact Type">
                <option value="">-- Contact Type --</option>
                <option value="mobile">Mobile Phone</option>
                <option value="business">Business Phone</option>
                <option value="email">Email</option>
                <option value="fax">Fax</option>
            </select>
            {
                validationErrors.length>0 && validationErrors.filter(v=>v.noContactType && v.contactUuid===contactInfo.uuid).length>0?
                    <FieldEntryError title="Please select contact type" prefix={null} />:
                null
            } 
        </div>
        <div className="form-group px-2" style={{flexGrow:1}}>
            <input type="text" 
                name="contactInfo"
                defaultValue={'contactInfo' in contactInfo?contactInfo.contactInfo:null}
                onInput={(e)=>{
                    handleOnEntry(Object.assign(contactInfo,{
                        contactInfo:e.target.value
                    }))
                }}
                className="form-control" 
                data-required="1"
                placeholder="Contact information" />
            {
                validationErrors.length>0 && validationErrors.filter(v=>v.noContactInfo && v.contactUuid===contactInfo.uuid).length>0?
                    <FieldEntryError title="Please enter contact information" prefix={null} />:
                null
            } 
        </div>
    </div>)
}