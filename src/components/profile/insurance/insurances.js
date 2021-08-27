import React, { useState, useContext, useEffect } from 'react';

import { DisplayUploadedFileTile } from "core/components/infoDisplay/files/web/displayUploadedFileTile";
import { OnScreenMessage } from 'core/components/popups/web/popups';

import { DisplayFilePreviewModal } from "core/components/infoDisplay/files/web/displayFilePreviewModal";

import { AppContext } from '../../AppContext';
import { InsuranceEntryForm } from './insuranceEntryForm';

const insuranceProviders = require('./insuranceProviders.json');

export const Insurances = () => {

    let { userInfo } = useContext(AppContext);

    const [userInsurances, setUserInsurances] = useState([]);

    const [showInsuranceEntryForm, setShowInsuranceEntryForm] = useState(false);

    const [insuranceToUpdate, setInsuranceToUpdate] = useState(null);

    const [showDeleteConfirmationMessage, setShowDeleteConfirmationMessage] = useState(false);
    const [insuranceToDelete, setInsuranceToDelete] = useState(null);

    const [filePreviewModal, setFilePreviewModal] = useState({
        show: false,
        indx: 0,
        files: []
    });

    useEffect(() => {

        let uri = new URL(window.location.origin + "/account/api/user/insurance/get");
        uri.searchParams.set("userMongoId.$_id", userInfo._id);
        uri.searchParams.set("deleted.$boolean", false);

        fetch(uri)
            .then(response => response.json())
            .then(data => { console.log(data); setUserInsurances(data) })
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (insuranceToUpdate !== null) setShowInsuranceEntryForm(true);
    }, [insuranceToUpdate]);

    useEffect(() => {
        if (!showInsuranceEntryForm) setInsuranceToUpdate(null);
    }, [showInsuranceEntryForm]);

    useEffect(() => {
        if (insuranceToDelete !== null) setShowDeleteConfirmationMessage(true);
    }, [insuranceToDelete]);

    useEffect(() => {
        if (!showDeleteConfirmationMessage) setInsuranceToDelete(null);
    }, [showDeleteConfirmationMessage]);

    const handleInsuranceDeletion = () => {

        fetch('/account/api/user/insurance/update', {
            method: "POST",
            body: JSON.stringify({
                query: { "_id": insuranceToDelete._id },
                values: { "deleted.$boolean": true }
            }),
            headers: {
                "content-type": "application/json"
            }
        }).then(response => {

            let _d = [...userInsurances];
            let indx = _d.findIndex(addr => addr._id === insuranceToDelete._id);

            _d.splice(indx, 1);

            setUserInsurances(_d);
            setShowDeleteConfirmationMessage(false);

        }).catch(err => { console.log(err); alert("Error while deleting insurance") })
    }

    const handleAfterSubmission = (data) => {

        setShowInsuranceEntryForm(false);

        let _d = [...userInsurances];

        let indx = _d.findIndex(ins => ins._id === data._id);

        if (indx > -1) {

            _d[indx] = data;

        } else {
            _d.push(data);
        }

        setUserInsurances(_d);
    };

    const handlePreviewOnClick = (files, indx) => {
        let _d = { ...filePreviewModal };

        _d.show = true;
        _d.indx = indx;
        _d.files = files;
        console.log(_d);
        setFilePreviewModal(_d);
    }

    const handleFilePreviewModalClose = () => {
        let _d = { ...filePreviewModal };

        _d.show = false;
        _d.indx = 0;
        _d.files = [];

        setFilePreviewModal(_d);
    }

    return (
        <div className="border rounded bg-white my-3">
            <div className="my-2 px-3 py-2 border-bottom">
                <div className="h3">Manage Medical Insurance</div>
                <div className="small text-muted">The insurance information will be used during the doctor's visit and billing</div>
            </div>
            <div>
                {
                    userInsurances.length > 0 ?
                        userInsurances.map(insurance => {
                            return <div key={insurance._id} className="p-1 border-bottom">
                                <div className="p-2 d-flex flex-row justify-content-between">
                                    <div>
                                        <div><b>{insurance.insuranceProvider.name} <span className="text-success text-capitalize">({insurance.priority})</span></b></div>
                                        <div className="text-muted d-flex flex-row">
                                            <div>{insurance.memberId}</div>
                                        </div>
                                        {
                                            insurance.files.length > 0 ?
                                                <div className="my-2 d-flex flex-row">
                                                    {
                                                        insurance.files.map((f, indx) => {
                                                            return <div key={f._id} className="mr-2 border pointer" style={{ width: "100px", height: "80px" }}>
                                                                <DisplayUploadedFileTile
                                                                    handleOnClick={() => { handlePreviewOnClick(insurance.files, indx) }}
                                                                    height={"50px"}
                                                                    width={"100px"}
                                                                    fileProps={f}
                                                                    fileSrc={`/file/fs/${f._id}`} />
                                                            </div>
                                                        })
                                                    }
                                                </div>

                                                :
                                                null
                                        }
                                    </div>

                                    <div>
                                        <div className="d-flex flex-row">
                                            <div title="Edit Insurance" className="icon-button"
                                                onClick={() => { setInsuranceToUpdate(insurance) }}>
                                                <i className="fas fa-pencil-alt"></i>
                                            </div>
                                            <div title="Remove Insurance" className="icon-button"
                                                onClick={() => { setInsuranceToDelete(insurance) }}>
                                                <i className="far fa-trash-alt"></i>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                            </div>
                        }) :
                        null
                }

                <div className="py-2">
                    <div className="m-3 btn-classic btn-white py-2 px-3" onClick={() => { setShowInsuranceEntryForm(true) }}>
                        <div className="d-flex flex-row font-weight-bold justify-content-center align-items-baseline">
                            <i className="fas fa-plus"></i>
                            <div className="ml-2">Add Insurance</div>
                        </div>
                    </div>
                </div>

            </div>

            {
                showInsuranceEntryForm ?
                    <InsuranceEntryForm
                        insuranceProviders={insuranceProviders}
                        insuranceToUpdate={insuranceToUpdate}
                        handleOnClose={setShowInsuranceEntryForm}
                        handleAfterSubmission={handleAfterSubmission} /> :
                    null
            }

            {
                showDeleteConfirmationMessage ?
                    <OnScreenMessage>
                        <div className="font-weight-bold">Remove Insurance</div>
                        <div className="mt-2">Are your sure to remove the selected insurance from your profile </div>
                        <div className="d-flex flex-row mt-2 justify-content-end">
                            <div className="btn btn-sm btn-link mr-2 pointer" onClick={() => { setShowDeleteConfirmationMessage(false) }}>Cancel</div>
                            <div className="btn btn-sm btn-primary pointer" onClick={() => { handleInsuranceDeletion() }}> Remove</div>
                        </div>
                    </OnScreenMessage> :
                    null
            }

            {
                filePreviewModal.show ?
                    <DisplayFilePreviewModal
                        onCloseHandler={() => { handleFilePreviewModalClose(); }}
                        defaultFileIndx={filePreviewModal.indx}
                        files={filePreviewModal.files} /> :
                    null
            }
        </div>);
}