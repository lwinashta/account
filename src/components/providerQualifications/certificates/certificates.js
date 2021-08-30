import React, { useEffect, useState, useContext } from 'react';

const moment=require('moment');

import { OnScreenMessage } from 'core/components/popups/web/popups';

import { DisplayUploadedFileTile } from "core/components/infoDisplay/files/web/displayUploadedFileTile";
import { DisplayFilePreviewModal } from "core/components/infoDisplay/files/web/displayFilePreviewModal";

import { AppContext } from "../../AppContext";

import { CertificateEntryForm } from "./certificateEntryForm";

export const Certificates = ({ isDisabled = false }) => {

    let { userInfo, updateUserContextInfo } = useContext(AppContext);

    const [showCertificateEntryForm, setShowCertificateEntryForm] = useState(false);

    const [certificateToUpdate, setCertificateToUpdate] = useState(null);

    const [showDeleteConfirmationMessage, setShowDeleteConfirmationMessage] = useState(false);
    const [certificateToDelete, setCertificateToDelete] = useState(null);

    const [filePreviewModal, setFilePreviewModal] = useState({
        show: false,
        indx: 0,
        files: []
    });


    useEffect(() => {
        if (certificateToUpdate !== null) setShowCertificateEntryForm(true);
    }, [certificateToUpdate]);

    useEffect(() => {
        if (!showCertificateEntryForm) setCertificateToUpdate(null);
    }, [showCertificateEntryForm]);

    useEffect(() => {
        if (certificateToDelete !== null) setShowDeleteConfirmationMessage(true);
    }, [certificateToDelete]);

    useEffect(() => {
        if (!showDeleteConfirmationMessage) setCertificateToDelete(null);
    }, [showDeleteConfirmationMessage]);

    const handleCertificateDeletion = async () => {
        try {
            let body = {};

            console.log(certificateToDelete);

            body.query = {
                "certificates.uuid": certificateToDelete.uuid
            }
            body["certificates.$"] = Object.assign(certificateToDelete, {
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
                        <div className="field-name-lg">
                            <b>Certificates</b>
                        </div>
                        <div className="field-value">
                            {
                                userInfo.certificates && userInfo.certificates.filter(m => !m.deleted).length > 0 ?
                                    <div className="mb-3 d-flex flex-column flex-wrap">
                                        {
                                            userInfo.certificates.filter(m => !m.deleted).map((certificate, indx) => {
                                                return <div key={certificate.uuid} className={`border-bottom ${indx > 0 ? "py-2" : "pb-2"}`}>
                                                    <div className="d-flex flex-row justofy-content-between">
                                                        <div style={{ flexGrow: 2 }}>
                                                            <div><b>{certificate.name} </b> ({moment(certificate.issueDate).format("DD MMM, YYYY")} - {certificate.expirationDate && certificate.expirationDate.length>0? moment(certificate.expirationDate).format("DD MMM, YYYY"):"<No expiration>"})</div>
                                                            <div className="text-muted">
                                                                <div>{certificate.issuedBy}</div>
                                                            </div>
                                                            {
                                                                userInfo.files.filter(f => f.fieldName === "certificateFiles" && f.additionalFileInfo.uuid === certificate.uuid).length > 0 ?
                                                                    <div className="my-2 d-flex flex-row">
                                                                        {
                                                                            userInfo.files.filter(f => f.fieldName === "certificateFiles" && f.additionalFileInfo.uuid === certificate.uuid).map((f, indx) => {
                                                                                return <div key={f._id} className="mr-2 border pointer" style={{ width: "100px", height: "80px" }}>
                                                                                    <DisplayUploadedFileTile
                                                                                        handleOnClick={() => { handlePreviewOnClick(userInfo.files.filter(f => f.fieldName === "certificateFiles" && f.additionalFileInfo.uuid === certificate.uuid), indx) }}
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
                                                                <button
                                                                    title="Edit Certificate"
                                                                    className="icon-button"
                                                                    disabled={isDisabled}
                                                                    onClick={() => { setCertificateToUpdate(certificate) }}>
                                                                    <i className="fas fa-pencil-alt"></i>
                                                                </button>
                                                                <button
                                                                    title="Remove Certificate"
                                                                    className="icon-button"
                                                                    disabled={isDisabled}
                                                                    onClick={() => { setCertificateToDelete(certificate) }}>
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
                                onClick={() => { setShowCertificateEntryForm(true) }}>
                                <div className="d-flex flex-row font-weight-bold justify-content-center align-items-baseline">
                                    <i className="fas fa-plus"></i>
                                    <div className="ml-2">Add Certificate </div>
                                </div>
                            </button>

                        </div>
                    </div>
                }
            }
        </AppContext.Consumer>
        {
            showCertificateEntryForm ?
                <CertificateEntryForm
                    certificateToUpdate={certificateToUpdate}
                    handleOnClose={setShowCertificateEntryForm} /> :
                null
        }

        {
            showDeleteConfirmationMessage ?
                <OnScreenMessage>
                    <div className="font-weight-bold">Remove Certificate</div>
                    <div className="mt-2">Are your sure to remove the selected Certificate  from your profile </div>
                    <div className="d-flex flex-row mt-2 justify-content-end">
                        <div className="btn btn-sm btn-link mr-2 pointer" onClick={() => { setShowDeleteConfirmationMessage(false) }}>Cancel</div>
                        <div className="btn btn-sm btn-primary pointer" onClick={() => { handleCertificateDeletion() }}> Remove</div>
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
    </>
    );
}