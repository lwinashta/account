import React, { useEffect, useState, useContext } from 'react';

import { OnScreenMessage } from 'core/components/popups/web/popups';

import { PracticeContactInformationEntry } from "./practiceContactInformationEntry";
import { PracticeContext } from '../practiceContext';
import { ContactInfo as DisplayContactInfo } from 'core/components/infoDisplay/medicalPractices/web/contactInfo';

export const PracticeContactInformation = ({ isDisabled = false }) => {

    let { practiceInfo, resetPracticeInfo } = useContext(PracticeContext);

    const [showContactInfoEntryForm, setShowContactInfoEntryForm] = useState(false);

    const [contactInfoToUpdate, setContactInfoToUpdate] = useState(null);

    const [showDeleteConfirmationMessage, setShowDeleteConfirmationMessage] = useState(false);
    const [contactInfoToDelete, setContactInfoToDelete] = useState(null);

    useEffect(() => {
        if (contactInfoToUpdate !== null) setShowContactInfoEntryForm(true);
    }, [contactInfoToUpdate]);

    useEffect(() => {
        if (!showContactInfoEntryForm) setContactInfoToUpdate(null);
    }, [showContactInfoEntryForm]);

    useEffect(() => {
        if (contactInfoToDelete !== null) setShowDeleteConfirmationMessage(true);
    }, [contactInfoToDelete]);

    useEffect(() => {
        if (!showDeleteConfirmationMessage) setContactInfoToDelete(null);
    }, [showDeleteConfirmationMessage]);

    const handleContactInfoDeletion = async () => {
        try {
            let body = {};

            console.log(contactInfoToDelete);

            body.query = {
                "contactInformation.uuid": contactInfoToDelete.uuid
            }
            body["contactInformation.$"] = Object.assign(contactInfoToDelete, {
                "deleted": true
            });

            await fetch("/account/api/practice/medicalfacility/update", {
                method: "POST",
                body: JSON.stringify(Object.assign(body, {
                    "_id": practiceInfo._id
                })),
                headers: {
                    "content-type": "application/json"
                }
            });

            await resetPracticeInfo();

            setShowDeleteConfirmationMessage(false);

        } catch (error) {
            console.log(error);
        }

    }


    return (<>
        <PracticeContext.Consumer>
            {
                ({ practiceInfo, isDisabled }) => {
                    return <div className="d-flex flex-row align-items-top px-3">
                        <div className="field-name-lg">
                            <b>Contact</b>
                            <div className="text-danger small">Required*</div>
                        </div>
                        <div className="field-value">
                            {
                                practiceInfo.contactInformation && practiceInfo.contactInformation.length > 0 ?
                                    <div className="mb-2">
                                        {
                                            practiceInfo.contactInformation.filter(c => !c.deleted).map(contact => {
                                                return <div key={contact.uuid} className="d-flex flex-row justify-content-between border-bottom">
                                                    <DisplayContactInfo contact={contact} />
                                                    <div>
                                                        <div className="d-flex flex-row">
                                                            <button
                                                                title="Edit Contact Information"
                                                                className="icon-button"
                                                                disabled={isDisabled}
                                                                onClick={() => { setContactInfoToUpdate(contact) }}>
                                                                <i className="fas fa-pencil-alt"></i>
                                                            </button>
                                                            <button
                                                                title="Remove Certificate"
                                                                className="icon-button"
                                                                disabled={isDisabled}
                                                                onClick={() => { setContactInfoToDelete(contact) }}>
                                                                <i className="far fa-trash-alt"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            })
                                        }
                                    </div>
                                    :
                                    null
                            }
                            <button
                                className="btn-classic btn-white py-2 px-3"
                                disabled={isDisabled}
                                onClick={() => { setShowContactInfoEntryForm(true) }}>
                                <div className="d-flex flex-row font-weight-bold justify-content-center align-items-baseline">
                                    <i className="fas fa-plus"></i>
                                    <div className="ml-2">Add Contact Info </div>
                                </div>
                            </button>
                        </div>
                    </div>
                }
            }
        </PracticeContext.Consumer>
        {
            showContactInfoEntryForm ?
                <PracticeContactInformationEntry
                    contactInfoToUpdate={contactInfoToUpdate}
                    handleOnClose={setShowContactInfoEntryForm} /> :
                null
        }

        {
            showDeleteConfirmationMessage ?
                <OnScreenMessage>
                    <div className="font-weight-bold">Remove Contact Information</div>
                    <div className="mt-2">Are your sure to remove the selected Contact Info for this practice </div>
                    <div className="d-flex flex-row mt-2 justify-content-end">
                        <div className="btn btn-sm btn-link mr-2 pointer" onClick={() => { setShowDeleteConfirmationMessage(false) }}>Cancel</div>
                        <div className="btn btn-sm btn-primary pointer" onClick={() => { handleContactInfoDeletion() }}> Remove</div>
                    </div>
                </OnScreenMessage> :
                null
        }

    </>
    );
}