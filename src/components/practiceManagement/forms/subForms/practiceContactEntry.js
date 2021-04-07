import React, { useState, useContext,useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';

import { FormContext } from "./../formContext";

export const PracticeContactEntry = () => {

    let contextValues=useContext(FormContext);

    const [contacts, setContacts] = useState([]);

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

    return (<div>
            <div className="mb-3 font-weight-bold text-primary">Practice Contact Information:</div>
        <div className="text-muted mb-2">
            The contact information will be visible to patients and users searching healthcare providers (doctors) or facilities.
        </div>

        <div className="mt-2">
            <div>
                {
                    contacts.length > 0 ? 
                    <div>
                        {
                            contacts.map((contact, indx) => {
                                return <ContactEntryForm
                                    handleOnEntry={handleOnEntry}
                                    contactInfo={contact} 
                                    key={contact.uuid} />
                            })
                        }
                    </div> : null
                }
            </div>

            <div className="mt-2 pt-2 pb-2 border-top border-bottom">
                <div className="btn-link pointer" 
                    onClick={() => { addNewContacts() }}>
                    Add New Contact
                </div>
            </div>

        </div>

        <div className="d-flex flex-row justify-content-between mt-4">
                <div className="btn btn-primary pointer" 
                    onClick={()=>{contextValues.handleTabClick("address","contacts")}}>
                        <i className="mr-2 fas fa-arrow-left"></i>
                        <span>Previous</span>
                    </div>
                <div className="btn btn-primary pointer" 
                    onClick={()=>{contextValues.handleTabClick("pictures","contacts")}}>
                        <i className="mr-2 fas fa-arrow-right"></i>
                        <span>Next</span>
                </div>
            </div>
    </div>);
}

const ContactEntryForm = ({
    contactInfo=null,
    handleOnEntry=function(){}
}) => {

    return (<div className="mt-2 d-flex flex-row">
        <div className="form-group px-2" style={{flexGrow:1}}>
            <label data-required="1">Contact Type</label>
            <select name="contactType"
                className="form-control" 
                onChange={(e)=>{
                    handleOnEntry(Object.assign(contactInfo,{
                        contactType:e.target.value
                    }))
                }}
                placeholder="Contact Type">
                <option value="">Contact Type</option>
                <option value="mobile">Mobile Phone</option>
                <option value="business">Business Phone</option>
                <option value="email">Email</option>
                <option value="fax">Fax</option>
            </select>
        </div>
        <div className="form-group px-2" style={{flexGrow:1}}>
            <label data-required="1">Contact info</label>
            <input type="text" 
                name="contactInfo"
                onInput={(e)=>{
                    handleOnEntry(Object.assign(contactInfo,{
                        contactInfo:e.target.value
                    }))
                }}
                className="form-control" 
                data-required="1"
                placeholder="Contact information" />
        </div>
    </div>)
}