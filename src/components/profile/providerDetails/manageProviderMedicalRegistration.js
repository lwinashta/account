import React, { useEffect, useState, useContext } from "react";
import { UserInfo } from "../contexts/userInfo";
import { Modal,FilePreview } from "@oi/reactcomponents";
import { formjs,fileUploadField,insertValues } from "@oi/utilities/__bk__/form";
import * as userFunctions from './../reusable/userInfoFunctions';

const _formjs = new formjs();

export const ManageProviderMedicalRegistration = () => {

    let contextValues = useContext(UserInfo);

    const [userMedicalRegNumber, setMedicalRegNumber] = useState("medical_registration_number" in contextValues.userInfo ? contextValues.userInfo.medical_registration_number : "");
    const [userMedicalRegistrationFiles, setUserMedicalRegistrationFiles] = useState("files" in contextValues.userInfo ? contextValues.userInfo.files.filter(f => f.field_name === "medical_registration_files") : []);

    const [showMedicalRegistraionFilesPreviewModal, setMedicalRegistraionFilesPreviewModalFlag] = useState(false);
    const [showMedicalRegistraionEntryForm, setShowMedicalRegistrationEntryFormFlag] = useState(false);
    
    const [uploadedRegistrationFiles,setUploadedRegistrationFiles]=useState([]);

    let formRef = React.createRef();

    /** UseEffect Hooks */

    useEffect(() => {
        if (showMedicalRegistraionEntryForm) {

            let _manageFiles = new fileUploadField({
                container: $(formRef.current).find('.droppable-file-container'),
                multiple: true,
                name: $(formRef.current).find('.droppable-file-container').attr('name'),
                onFileSelectionCallback: function (file, allUploaded) {
                    setUploadedRegistrationFiles(allUploaded);
                },
                fileData: userMedicalRegistrationFiles,
                onFileDeletionCallback: function (deletedFile) {
                    if(deletedFile._id!==null){
                        
                        let regFiles = [...userMedicalRegistrationFiles];

                        //find the file 
                        let indx = regFiles.findIndex(f => f._id === deletedFile._id);
                        let removedFile = regFiles.files.splice(indx, 1);

                        setUserMedicalRegistrationFiles(removedFile);

                    }else{

                        //rmeoved the file which was not uploaded to server
                        setUploadedRegistrationFiles(deletedFile.uploadedFiles);
                    }
                    
                }
            });
            _manageFiles.bind();//bind file drg and drop
            _manageFiles.insertFiles();

            let _insertValues = new insertValues({
                container: $(formRef.current)
            });

            //load the data in the form 
            _insertValues.insert({
                "medical_registration_number": userMedicalRegNumber
            });
        }

        if (!setShowMedicalRegistrationEntryFormFlag) {
            setUploadedRegistrationFiles([]);
        }

    }, [showMedicalRegistraionEntryForm]);

    /******************** */
    /** Event Handlers */
    const addMedicalRegistrationFiles = (files) => {
        //console.log(files);
        let fileData = new FormData();

        Object.keys(files).forEach(key => {
            fileData.append(key, files[key]);
        });

        fileData.append("linked_mongo_id", contextValues.userInfo._id);
        fileData.append("linked_db_name", "accounts");
        fileData.append("linked_collection_name", "users");

        return $.ajax({
            "url": '/g/uploadfiles',
            "processData": false,
            "contentType": false,
            "data": fileData,
            "method": "POST"
        })
    }

    const handleMedicalRegistrationSubmission = (e) => {
        e.preventDefault();

        let form = e.target;
        let validation = _formjs.validateForm(form);

        if (validation === 0) {
            //update the registration number 
            let medRegNum = $(form).find('[name="medical_registration_number"]').val();
            userFunctions.submitUserUpdates({
                "medical_registration_number": medRegNum,
                "_id": contextValues.userInfo._id

            }).then(response => {
                setMedicalRegNumber(medRegNum);

                //check if any new files uploaded 
                if (Object.keys(uploadedRegistrationFiles).length > 0) {
                    return addMedicalRegistrationFiles(uploadedRegistrationFiles);

                }

            }).then(response => {
                
                if (Array.isArray(response)) {
                    setUserMedicalRegistrationFiles(userMedicalRegistrationFiles.concat(response));
                }
                popup.remove();

                //Update the context
                contextValues.updateUserInfoContext({
                    medical_registration_number: medRegNum
                });

                popup.onBottomCenterSuccessMessage("Medical Registration Updated");
                setShowMedicalRegistrationEntryFormFlag(false);

            }).catch(err => {
                console.log(err);
                popup.onBottomCenterErrorOccured("Error while updating the info. Try again.");
            });

        } else {
            popup.onBottomCenterRequiredErrorMsg();
        }
    }

    /** Render */
    return (<div className="border-bottom pt-2 pb-3 position-relative">
        <div className="font-weight-bold" data-required="1">Medical Registration/ License Number</div>
        {
            userMedicalRegNumber.length === 0 ?
                <div className="small">
                    <div className="mt-1 btn-link pointer" onClick={() => { setShowMedicalRegistrationEntryFormFlag(true) }}>Add Medical Registration/ License Number</div>
                    <div className="text-muted">You will also need your medical registration certificate as an attachment to verify your qualitifcation.</div>
                </div> :
                <div>
                    {
                        'qualification_verification_status' in contextValues.userInfo &&
                        contextValues.userInfo.qualification_verification_status.length > 0 && 
                        contextValues.userInfo.qualification_verification_status === "pending" ?
                            <div className="push-right">
                                <div className="small btn-link pointer" onClick={() => { setShowMedicalRegistrationEntryFormFlag(true) }}>Edit</div>
                            </div> : null
                    }
                    <div className="small">
                        <div className="text-muted">{userMedicalRegNumber}</div>
                        <div className="btn-link pointer" onClick={() => setMedicalRegistraionFilesPreviewModalFlag(true)}>{userMedicalRegistrationFiles.length > 0 ? userMedicalRegistrationFiles.length + " files" : ""}</div>
                    </div>
                </div>
        }

        {
            showMedicalRegistraionEntryForm ?
                <Modal header={<h3>Medical Registration Entry</h3>} onCloseHandler={() => { setShowMedicalRegistrationEntryFormFlag(false) }}>
                    <form ref={formRef} onSubmit={(e) => { handleMedicalRegistrationSubmission(e) }} >
                        <div className="form-group">
                            <label data-required="1">Registration/License Number </label>
                            <input type="text" name="medical_registration_number"
                                className="form-control entry-field" data-required="1"
                                placeholder="Medical Registration Number" />
                        </div>
                        <div className="form-group">

                            <label htmlFor="medical-registration-file" data-required="1">Attach Insurance Card </label>

                            <div id="medical-registration-file-container"
                                name="medical_registration_files"
                                className="mt-2 p-2 position-relative droppable-file-container entry-field"
                                data-required="1"
                                placeholder="Medical Registration">

                                <div className="droppable-file-action-container">

                                    <div className="small text-muted d-inline-block">Drag and drop or upload the file</div>

                                    <div className="position-relative ml-2 upload-file-container d-inline-block">
                                        <input type="file" id="medical-registration-file" className="form-control" multiple="multiple" />
                                        <div className="btn-info p-1 rounded text-center input-overlay small">Upload File</div>
                                    </div>

                                </div>

                                <div className="droppable-file-preview-container"></div>

                            </div>

                        </div>
                        <div className="mt-2 text-center">
                            <button className="btn btn-primary w-75" type="submit">Save Medical Registration</button>
                        </div>
                    </form>
                </Modal> : null
        }

        {
            showMedicalRegistraionFilesPreviewModal ?
                <FilePreview files={userMedicalRegistrationFiles} onCloseHandler={() => { setMedicalRegistraionFilesPreviewModalFlag(false) }}></FilePreview> : null
        }

    </div>


    )
}