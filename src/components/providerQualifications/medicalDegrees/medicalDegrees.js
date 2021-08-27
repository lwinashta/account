import React, { useEffect, useState } from 'react';

import { OnScreenMessage } from 'core/components/popups/web/popups';

import { AppContext } from "../../AppContext";

import { MedicalDegreeEntryForm } from "./medicalDegreeEntryForm";

const medicalDegreesList = require("@oi/utilities/lists/medical-degrees.json").map(d => Object.assign(d, { name: `${d.name} (${d.abbr})` }));

export const MedicalDegrees = () => {

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

    

    return (<>
        <AppContext.Consumer>
            {
                ({ userInfo }) => {
                    return <div className="d-flex flex-row align-items-top px-3">
                        <div className="field-name-lg font-weight-bold">Medical Degrees</div>
                        <div className="field-value">
                            {
                                userInfo.medicalDegrees && userInfo.medicalDegrees.length > 0 ?
                                    <div className="mb-3 d-flex flex-column flex-wrap">
                                        {
                                            userInfo.medicalDegrees.map(degree => {
                                                return <div key={degree.uuid} className="pb-2 border-bottom">
                                                    <div className="d-flex flex-row justofy-content-between">
                                                        <div style={{flexGrow:2}}>
                                                            <div><b>{medicalDegreesList.find(sp => sp._id === degree.degree).name} </b> ({degree.startYear} - {degree.endYear})</div>
                                                            <div className="text-muted">
                                                                <div>{degree.educationalInstitute}</div>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <div className="d-flex flex-row">
                                                                <div title="Edit Medical Degree" className="icon-button"
                                                                    onClick={() => { setMedicalDegreeToUpdate(degree) }}>
                                                                    <i className="fas fa-pencil-alt"></i>
                                                                </div>
                                                                <div title="Remove Medical Degree" className="icon-button"
                                                                    onClick={() => { setMedicalDegreeToDelete(degree) }}>
                                                                    <i className="far fa-trash-alt"></i>
                                                                </div>
                                                            </div>
                                                        </div>

                                                    </div>
                                                    
                                                </div>
                                            })
                                        }
                                    </div> :
                                    null
                            }

                            <div className="btn-classic btn-white py-2 px-3" onClick={() => { setShowMedicalDegreeEntryForm(true) }}>
                                <div className="d-flex flex-row font-weight-bold justify-content-center align-items-baseline">
                                    <i className="fas fa-plus"></i>
                                    <div className="ml-2">Add Medical Degree</div>
                                </div>
                            </div>

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
                            <div className="btn btn-sm btn-primary pointer" onClick={() => { handleInsuranceDeletion() }}> Remove</div>
                        </div>
                    </OnScreenMessage> :
                    null
            }
    </>
    );
}