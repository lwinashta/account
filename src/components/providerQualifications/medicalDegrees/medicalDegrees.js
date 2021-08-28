import React, { useEffect, useState, useContext } from 'react';

import { OnScreenMessage } from 'core/components/popups/web/popups';

import { AppContext } from "../../AppContext";

import { MedicalDegreeEntryForm } from "./medicalDegreeEntryForm";

const medicalDegreesList = require("@oi/utilities/lists/medical-degrees.json").map(d => Object.assign(d, { name: `${d.name} (${d.abbr})` }));

export const MedicalDegrees = ({isDisabled=false}) => {

    let { userInfo, updateUserContextInfo } = useContext(AppContext);

    const [showMedicalDegreeEntryForm, setShowMedicalDegreeEntryForm] = useState(false);

    const [medicalDegreeToUpdate, setMedicalDegreeToUpdate] = useState(null);

    const [showDeleteConfirmationMessage, setShowDeleteConfirmationMessage] = useState(false);
    const [medicalDegreeToDelete, setMedicalDegreeToDelete] = useState(null);

    useEffect(() => {
        if (medicalDegreeToUpdate !== null) setShowMedicalDegreeEntryForm(true);
    }, [medicalDegreeToUpdate]);

    useEffect(() => {
        if (!showMedicalDegreeEntryForm) setMedicalDegreeToUpdate(null);
    }, [showMedicalDegreeEntryForm]);

    useEffect(() => {
        if (medicalDegreeToDelete !== null) setShowDeleteConfirmationMessage(true);
    }, [medicalDegreeToDelete]);

    useEffect(() => {
        if (!showDeleteConfirmationMessage) setMedicalDegreeToDelete(null);
    }, [showDeleteConfirmationMessage]);

    const handleMedicalDegreeDeletion = async () => {
        try {
            let body = {};

            console.log(medicalDegreeToDelete);

            body.query = {
                "medicalDegrees.uuid": medicalDegreeToDelete.uuid
            }
            body["medicalDegrees.$"] = Object.assign(medicalDegreeToDelete, {
                "deleted": true
            });

            let updatedUserInfo = await fetch("/account/api/user/profile/update", {
                method: "POST",
                body: JSON.stringify(Object.assign(body, {
                    "_id": userInfo._id
                })),
                headers: {
                    "content-type": "application/json"
                }
            });

            let updateUserInfoJson = await updatedUserInfo.json();

            updateUserContextInfo(updateUserInfoJson);

            setShowDeleteConfirmationMessage(false);

        } catch (error) {
            console.log(error);
        }

    }

    return (<>
        <AppContext.Consumer>
            {
                ({ userInfo }) => {
                    return <div className="d-flex flex-row align-items-top px-3">
                        <div className="field-name-lg">
                            <b>Medical Degrees</b>
                            <div className="text-danger small">Required*</div>
                        </div>
                        <div className="field-value">
                            {
                                userInfo.medicalDegrees && userInfo.medicalDegrees.filter(m=>!m.deleted).length > 0 ?
                                    <div className="mb-3 d-flex flex-column flex-wrap">
                                        {
                                            userInfo.medicalDegrees.filter(m=>!m.deleted).map((degree,indx) => {
                                                return <div key={degree.uuid} className={`border-bottom ${indx>0?"py-2":"pb-2"}`}>
                                                    <div className="d-flex flex-row justofy-content-between">
                                                        <div style={{flexGrow:2}}>
                                                            <div><b>{medicalDegreesList.find(sp => sp._id === degree.degree).name} </b> ({degree.startYear} - {degree.endYear})</div>
                                                            <div className="text-muted">
                                                                <div>{degree.educationalInstitute}</div>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <div className="d-flex flex-row">
                                                                <button 
                                                                    title="Edit Medical Degree" 
                                                                    className="icon-button"
                                                                    disabled={isDisabled}
                                                                    onClick={() => { setMedicalDegreeToUpdate(degree) }}>
                                                                    <i className="fas fa-pencil-alt"></i>
                                                                </button>
                                                                <button 
                                                                    title="Remove Medical Degree" 
                                                                    className="icon-button"
                                                                    disabled={isDisabled}
                                                                    onClick={() => { setMedicalDegreeToDelete(degree) }}>
                                                                    <i className="far fa-trash-alt"></i>
                                                                </button>
                                                            </div>
                                                        </div>

                                                    </div>
                                                    
                                                </div>
                                            })
                                        }
                                    </div> :
                                    null
                            }

                            <button 
                                className="btn-classic btn-white py-2 px-3" 
                                disabled={isDisabled}
                                onClick={() => { setShowMedicalDegreeEntryForm(true) }}>
                                <div className="d-flex flex-row font-weight-bold justify-content-center align-items-baseline">
                                    <i className="fas fa-plus"></i>
                                    <div className="ml-2">Add Medical Degree</div>
                                </div>
                            </button>

                        </div>
                    </div>
                }
            }
        </AppContext.Consumer>
        {
            showMedicalDegreeEntryForm ?
                <MedicalDegreeEntryForm
                    medicalDegreeToUpdate={medicalDegreeToUpdate}
                    medicalDegreesList={medicalDegreesList}
                    handleOnClose={setShowMedicalDegreeEntryForm} /> :
                null
        }

        {
                showDeleteConfirmationMessage ?
                    <OnScreenMessage>
                        <div className="font-weight-bold">Remove Insurance</div>
                        <div className="mt-2">Are your sure to remove the selected Medical Degree from your profile </div>
                        <div className="d-flex flex-row mt-2 justify-content-end">
                            <div className="btn btn-sm btn-link mr-2 pointer" onClick={() => { setShowDeleteConfirmationMessage(false) }}>Cancel</div>
                            <div className="btn btn-sm btn-primary pointer" onClick={() => { handleMedicalDegreeDeletion() }}> Remove</div>
                        </div>
                    </OnScreenMessage> :
                    null
            }
    </>
    );
}