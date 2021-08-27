import React, { useEffect, useState } from 'react';

import { DisplayUploadedFileTile } from "core/components/infoDisplay/files/web/displayUploadedFileTile";
import { DisplayFilePreviewModal } from "core/components/infoDisplay/files/web/displayFilePreviewModal";

import { AppContext } from "../../AppContext";

import { UpdateMedicalRegistrationForm } from "./updateMedicalRegistrationForm";

export const MedicalRegistration = () => {

    const [showForm, setShowForm] = useState(false);

    const [filePreviewModal, setFilePreviewModal] = useState({
        show: false,
        indx: 0,
        files: []
    });

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

    return (<>
        <AppContext.Consumer>
            {
                ({ userInfo }) => {
                    return <div className="d-flex flex-row align-items-top px-3">
                        <div className="field-name-lg font-weight-bold">Medical Registration</div>
                        <div className="field-value">
                            {
                                userInfo.medicalRegistration ?
                                    <div>
                                        <div>{userInfo.medicalRegistration.medicalRegistrationNumber}</div>
                                        {
                                            userInfo.files.filter(f => f.fieldName === "medicalRegistrationFile").length > 0 ?
                                                <div className="my-2 d-flex flex-row">
                                                    {
                                                        userInfo.files.filter(f => f.fieldName === "medicalRegistrationFile").map((f, indx) => {
                                                            return <div key={f._id} className="mr-2 border pointer" style={{ width: "100px", height: "80px" }}>
                                                                <DisplayUploadedFileTile
                                                                    handleOnClick={() => { handlePreviewOnClick(userInfo.files.filter(f => f.fieldName === "medicalRegistrationFile"), indx) }}
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
                                    </div> :
                                    <div className="small text-muted">Click to update your medical registration</div>
                            }
                        </div>

                        <div>
                            <div title="Edit Name" className="icon-button"
                                onClick={() => setShowForm(true)}>
                                <i className="fas fa-pencil-alt"></i>
                            </div>
                        </div>

                    </div>
                }
            }
        </AppContext.Consumer>
        {
            showForm ?
                <UpdateMedicalRegistrationForm
                    handleOnClose={setShowForm} /> :
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
    </>
    );
}