import React, { useEffect, useState, useContext } from "react";
const moment=require('moment');

import { OnScreenMessage } from "core/components/popups/web/popups";
import { DisplayUploadedFileTile } from "core/components/infoDisplay/files/web/displayUploadedFileTile";
import { DisplayFilePreviewModal } from "core/components/infoDisplay/files/web/displayFilePreviewModal";

import { AppContext } from "../../AppContext";
import { CertificationForm } from "./form";

export const ManageCertifications = () => {

    let AppLevelContext = useContext(AppContext);

    const [showCertificationsEntryForm, setShowCertificationEntryFormFlag] = useState(false);
    const [certificateToUpdate,setCertificateToUpdate]=useState(null);

    const [filePreviewModal,setFilePreviewModal]=useState({
        show:false,
        indx:0,
        files:[]
    });

    useEffect(()=>{
        if(certificateToUpdate!==null) setShowCertificationEntryFormFlag(true);
    },[certificateToUpdate]);

    useEffect(()=>{
        if(!showCertificationsEntryForm) setCertificateToUpdate(null);
    },[showCertificationsEntryForm]);


    const handlePreviewOnClick=(indx)=>{
        let _d={...filePreviewModal};
        _d.show=true;
        _d.indx=indx;
        setFilePreviewModal(_d);
    }

    const handleFilePreviewModalClose=()=>{
        let _d={...filePreviewModal};
        _d.show=false;
        _d.indx=0;
        setFilePreviewModal(_d);
    }

    /** Render */
    return (<>
        <div className="tile bg-white">
            <div className=" p-2 border-bottom">
                <div className="d-flex flex-row justify-content-between">
                    <div className="d-flex flex-row">
                        <div className="font-weight-bold">Certificates</div>
                        <div className="font-weight-bold text-success ml-2 text-uppercase small">(Optional)</div>
                    </div>
                    <div title="Add Certificates" className="pointer" 
                    onClick={() => {
                        setShowCertificationEntryFormFlag(true);
                    }}><i className="fas fa-plus"></i></div>
                </div>
                <div className="text-muted"> Adding certification is optional. Certification will displayed on your profile. </div>
            </div>

            {
                ("certificates" in AppLevelContext.userInfo) 
                    && AppLevelContext.userInfo.certificates.length > 0 ?
                    AppLevelContext.userInfo.certificates.map((item)=>{
                        return <div className="border-bottom last-child-no-border p-2" 
                                key={item.uuid}>
                            <div className="d-flex flex-row justify-content-between">
                                <div>
                                    <div>{item.certificationName}</div>
                                    <div className="text-muted">
                                        {"issuedBy" in item?<div>{item.issuedBy}</div>:null}
                                        <div className="d-flex flex-row">
                                            {("issueMonth" in item && item.issueMonth!==null) 
                                                && (("issueYear" in item && item.issueYear!==null))?<div className="mr-2">Issued {item.issueMonth} {item.issueYear} -</div>:null}
                                            {("expirationMonth" in item && item.expirationMonth!==null) 
                                                && (("expirationYear" in item && item.expirationYear!==null))?<div> {item.expirationMonth} {item.expirationYear}</div>:
                                                <div>No Expiration</div>}
                                        </div>
                                    </div>
                                    
                                    {
                                        AppLevelContext.userInfo.files.length > 0
                                            && AppLevelContext.userInfo.files.filter(f => f.fieldName === "certificateFiles" && f.additionalFileInfo && f.additionalFileInfo.uuid===item.uuid).length > 0  ?
                                            <div className="d-flex flex-row mt-2">
                                                {
                                                    AppLevelContext.userInfo.files.filter(f => f.fieldName === "certificateFiles" && f.additionalFileInfo && f.additionalFileInfo.uuid===item.uuid).map((fr, indx) => {
                                                        return <div className="mr-2 border"
                                                            style={{ width: "100px" }}
                                                            key={fr._id}>
                                                            <DisplayUploadedFileTile
                                                                handleOnClick={() => {
                                                                    handlePreviewOnClick(indx);
                                                                }}
                                                                fileProps={fr}
                                                                fileSrc={`/file/fs/${fr._id}`} />
                                                        </div>
                                                    })
                                                }
                                            </div>:
                                        null
                                    }
                                </div>
                                <div>
                                    <div className="d-flex flex-row">
                                        <div title="Edit Certification" className="icon-button"
                                            onClick={() => { setCertificateToUpdate(item) }}>
                                            <i className="fas fa-pencil-alt"></i>
                                        </div>
                                        {/* <div title="Remove Address" className="icon-button"
                                            onClick={() => { setAddressToDelete(address) }}>
                                            <i className="far fa-trash-alt"></i>
                                        </div> */}
                                    </div>
                                </div>
                            </div>

                        </div>
                    }):
                    // No certificates found
                    <div className="my-2" >
                        <div className="btn btn-sm btn-primary pointer" onClick={() => {
                            setShowCertificationEntryFormFlag(true);
                        }}>
                            <i className="fas fa-plus mr-2"></i>
                            <span>Add Certificate</span>
                        </div>
                    </div>
            }
        </div>
        {
            showCertificationsEntryForm ?
                <CertificationForm
                    certificateToUpdate={certificateToUpdate}
                    onCloseHandler={() => setShowCertificationEntryFormFlag(false)} /> :
                null
        }
        {
            filePreviewModal.show?
                <DisplayFilePreviewModal 
                    onCloseHandler={()=>{
                        handleFilePreviewModalClose();
                    }}
                    defaultFileIndx={filePreviewModal.indx}
                    files={AppLevelContext.userInfo.files.filter(f=>f.fieldName==="certificateFile")} />:
            null
        }
    </>)
}
