import React, { useEffect, useState, useContext } from "react";
const moment=require('moment');

import { OnScreenMessage } from "core/components/popups/web/popups";
import { DisplayUploadedFileTile } from "core/components/infoDisplay/files/web/displayUploadedFileTile";
import { DisplayFilePreviewModal } from "core/components/infoDisplay/files/web/displayFilePreviewModal";

import { AppContext } from "../../AppContext";
import * as handlers from '../handlers';

import { MedicalRegistrationForm } from "./form";

export const ManageRegistration = () => {

    let AppLevelContext = useContext(AppContext);

    const [showMedicalRegistraionEntryForm, setShowMedicalRegistrationEntryFormFlag] = useState(false);
    const [filePreviewModal,setFilePreviewModal]=useState({
        show:false,
        indx:0,
        files:[]
    });

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
            <div className="d-flex flex-row justify-content-between p-2 border-bottom">
                <div className="d-flex flex-row">
                    <div className="font-weight-bold">Medical Registration </div>
                    <div className="font-weight-bold text-danger ml-2 text-uppercase small">(* Required)</div>
                </div>
                {
                    handlers.checkIfAllowedEdit(AppLevelContext.userInfo)?
                    <div>
                        {
                            ("medicalRegistration" in AppLevelContext.userInfo) && Object.keys(AppLevelContext.userInfo.medicalRegistration).length > 0 ?
                                <div title="Edit Registration" className="pointer" onClick={() => {
                                    setShowMedicalRegistrationEntryFormFlag(true);
                                }}><i className="fas fa-pencil-alt"></i></div> :
                                <div title="Add Registration" className="pointer" onClick={() => {
                                    setShowMedicalRegistrationEntryFormFlag(true);
                                }}><i className="fas fa-plus"></i></div>
                        }
                    </div>:
                    null
                }
                
            </div>
            {
                !("medicalRegistration" in AppLevelContext.userInfo) ?

                    <div className="px-2 pt-2">
                        Medical Registration is required information for the approval of your profile.
                        Please add all the required details for medical registration for timely approval.
                    </div> :
                    null
            }

            {
                ("medicalRegistration" in AppLevelContext.userInfo) && Object.keys(AppLevelContext.userInfo.medicalRegistration).length > 0 ?
                    <div className="d-flex flex-column flex-wrap p-2">
                        <div><b>Registration/License:</b> {AppLevelContext.userInfo.medicalRegistration.registrationNumber}</div>
                        <div><b>Issued On: </b>{moment(AppLevelContext.userInfo.medicalRegistration.issueDate).format('DD MMM, YYYY')}</div>
                        <div><b>Expires On: </b>{moment(AppLevelContext.userInfo.medicalRegistration.expirationDate).format('DD MMM, YYYY')}</div>
                        <div><b>Issuing Location: </b>{AppLevelContext.userInfo.medicalRegistration.countryOfIssuance.name}, {AppLevelContext.userInfo.medicalRegistration.stateOfIssuance}</div>
                            {
                                AppLevelContext.userInfo.files.length>0 && AppLevelContext.userInfo.files.filter(f=>f.fieldName==="medicalRegistrationFile").length>0 ?
                                <div className="d-flex flex-row mt-2">
                                    {
                                        AppLevelContext.userInfo.files.filter(f=>f.fieldName==="medicalRegistrationFile").map((fr,indx)=>{
                                            return <div className="mr-2 border" 
                                                style={{width:"100px"}} 
                                                key={fr._id}>
                                                <DisplayUploadedFileTile 
                                                    handleOnClick={()=>{
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
                    </div> :
                    null
            }
        </div>
        {
            showMedicalRegistraionEntryForm ?
                <MedicalRegistrationForm
                    onCloseHandler={() => setShowMedicalRegistrationEntryFormFlag(false)} /> :
                null
        }
        {
            filePreviewModal.show?
                <DisplayFilePreviewModal 
                    onCloseHandler={()=>{
                        handleFilePreviewModalClose();
                    }}
                    defaultFileIndx={filePreviewModal.indx}
                    files={AppLevelContext.userInfo.files.filter(f=>f.fieldName==="medicalRegistrationFile")} />:
            null
        }
    </>)
}

// Name : KAMISETTI DHANANJAYA
// Address : E AMHERST NY
// Profession : MEDICINE
// License No: 165332
// Date of Licensure : 01/30/1986
// Additional Qualification :  
// Status : REGISTERED
// Registered through last day of : 02/22
// Medical School: TIRUPATI UNIV-SRI VENKATE     Degree Date : 06/30/1979
