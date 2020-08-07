import React, { useEffect, useState, useContext } from "react";
import { UserInfo } from "../../contexts/userInfo";
import { Modal, FilePreview, ConfirmationBox } from "@oi/reactcomponents";
import { formjs, fileUploadField, insertValues } from "@oi/utilities/lib/js/form";
import * as userFunctions from '../reusable/userInfoFunctions';
const moment=require("moment");

const _formjs = new formjs();

export const ManageProviderCertifications = () => {

    let contextValues = useContext(UserInfo);

    const [userCertifications, setUserCertifications] = useState("medical_certifications" in contextValues.userInfo ? contextValues.userInfo.medical_certifications : []);
    const [allUserCertificationFiles, setAllUserCertificationFiles] = useState("files" in contextValues.userInfo ? contextValues.userInfo.files.filter(f => f.field_name === "medical_certifications_files") : []);

    const [userCertificationEditProps, setUserCertificationEditProps] = useState({});
    const [selectedCertFiles, setSelectedCertFiles] = useState([]);

    const [userCertificationEntryForm, setCertificationFormEntryFlag] = useState(false);

    const [selectedFilesForPreview, setSelectedFilesForPreview] = useState([]);
    const [showCertificationsFilesPreviewModal, setCertificationsFilesPreviewModalFlag] = useState(false);

    const [uploadedCertificationsFiles, setUploadedCertificationsFiles] = useState([]);

    const [showDeletionConfirmationBox,setDeleteConfirmationBoxFlag]=useState(false);

    let formRef = React.createRef();

    /** UseEffect Hooks */

    //When the entry form is closed
    useEffect(() => {

        if (userCertificationEntryForm) {

            let _manageFiles = new fileUploadField({
                container: $(formRef.current).find('.droppable-file-container'),
                multiple: true,
                name: $(formRef.current).find('.droppable-file-container').attr('name'),
                onFileSelectionCallback: function (file, allUploaded) {
                    setUploadedCertificationsFiles(allUploaded);
                },
                onFileDeletionCallback: function (deletedFile) {
                    //console.log(deletedFile);
                    if(deletedFile._id!==null){
                        
                        let _f = [...contextValues.userInfo.files];
                        let _d=[...contextValues.userInfo.medical_certifications];

                        let fIndx = _f.findIndex(f => f._id === deletedFile._id);
                        let removedFile = _f.splice(fIndx, 1);   

                        //update fileIds for the medical registration
                        let dIndx=_d.findIndex(_dd=>_dd._id===userCertificationEditProps._id);

                        _d[dIndx].fileIds=_d[dIndx].fileIds.filter(_ff=>_ff!==deletedFile._id);

                        userFunctions.submitUserUpdates({
                            medical_certifications:_d,
                            _id:contextValues.userInfo._id

                        }).then(response=>{

                            //Update the context values 
                            contextValues.updateUserInfoContext({
                                medical_certifications:_d,
                                files:_f
                            });

                            //find index and remove the file form the state 
                            setUserCertifications(_d);
                            setAllUserCertificationFiles(_f);

                        })

                    }else{

                        //removed the file which was not uploaded to server
                        setUploadedCertificationsFiles(deletedFile.uploadedFiles);
                    }
                    
                }
            });

            _manageFiles.bind();//bind file drag and drop

            if ("_id" in userCertificationEditProps) {

                //selected certification details
                let _cert = userCertifications.filter(_d => _d._id === userCertificationEditProps._id)[0];

                //get files for the selected certification 
                _manageFiles.fileData = allUserCertificationFiles.reduce((acc, ci) => {
                    if (_cert.fileIds.includes(ci._id)) {
                        acc.push(ci);
                    }
                    return acc;
                }, []);

                setSelectedCertFiles(_manageFiles.fileData);//sets the files for selected Cert

                _manageFiles.insertFiles();//insert Files if exists 

                //Insert other values
                let _insertValues = new insertValues({
                    container: $(formRef.current)
                });

                //load the data in the form 
                _insertValues.insert(_cert);

            }
        }

        //Reset Values on form close
        if (!userCertificationEntryForm) {
            setUploadedCertificationsFiles([]);
            setUserCertificationEditProps({});
            setSelectedCertFiles([]);
        }

    }, [userCertificationEntryForm]);

    //When the delete confirmation box is closed
    useEffect(()=>{
        if(!showDeletionConfirmationBox){
            setUserCertificationEditProps({});
        }
    },[showDeletionConfirmationBox])

    //When Edit props are set 
    useEffect(()=>{
        //console.log('_id' in userCertificationEditProps);
        if(('_id' in userCertificationEditProps) && userCertificationEditProps.mode==="update"){
            setCertificationFormEntryFlag(true);

        }else if(('_id' in userCertificationEditProps) && userCertificationEditProps.mode==="delete"){
            setDeleteConfirmationBoxFlag(true);
        }

    },[userCertificationEditProps]);

    //When files are selected to preview from profile page
    useEffect(() => {
        if (selectedFilesForPreview.length > 0) {
            setCertificationsFilesPreviewModalFlag(true);
        }
    }, [selectedFilesForPreview]);

    //When preview file modal is closed
    useEffect(() => {
        if (!showCertificationsFilesPreviewModal) {
            setSelectedFilesForPreview([]);
        }
    }, [showCertificationsFilesPreviewModal]);

    /******************** */
    /** Event Handlers */
    const handleCertificationFileUpload = () => {

        return new Promise((resolve, reject) => {
            console.log(uploadedCertificationsFiles);
            if (Object.keys(uploadedCertificationsFiles).length > 0) {

                userFunctions.uploadUserProfileFiles(uploadedCertificationsFiles, contextValues.userInfo._id).then(response => {

                    if (Array.isArray(response)) {

                        //set cert files in state
                        resolve(response);

                    } else {
                        resolve([]);
                    }

                }).catch(err => {
                    console.log(err);
                    reject("Error uploading files");
                });

            } else {
                resolve([]);
            }

        });

    }

    const handleCertificationSubmission = (e) => {

        e.preventDefault();

        popup.onScreen("Saving Certification...");

        let form = e.target;
        let validation = _formjs.validateForm(form);

        if (validation === 0) {

            let title = $(form).find('input[name="medical_certification_title"]').val();
            let dateOfIssue = $(form).find('input[name="medical_certification_issue_date"]').val();

            let _d = [...userCertifications];
            let _f=[...contextValues.userInfo.files];

            //check if any new files uploaded 
            handleCertificationFileUpload().then(filesUploaded => {

                //console.log(filesUploaded);
                let uploadedFileIds = filesUploaded.length > 0 ? filesUploaded.reduce((acc, ci) => {
                    acc.push(ci._id);
                    return acc;
                }, []) : [];

                if(uploadedFileIds.length>0){
                    _f=_f.concat(filesUploaded);
                }

                //check if its edit mode 
                if ("_id" in userCertificationEditProps) {
                    //Update mode 

                    let indx = _d.findIndex(_c => _c._id === userCertificationEditProps._id);

                    _d[indx].medical_certification_title = title;
                    _d[indx].medical_certification_issue_date = dateOfIssue;

                    _d[indx].fileIds = _d[indx].fileIds.concat(uploadedFileIds);

                } else {
                    //create mode
                    _d.push({
                        medical_certification_title: title,
                        medical_certification_issue_date: dateOfIssue,
                        fileIds: uploadedFileIds,
                        _id: getRandomId(_d.length + 1)
                    });
                }

                //update the data 
                userFunctions.submitUserUpdates({
                    "medical_certifications": _d,
                    "_id": contextValues.userInfo._id

                }).then(response => {
                    //console.log(_d);

                    //set user certification state
                    contextValues.updateUserInfoContext({
                        medical_certifications:_d,
                        files:_f
                    });

                    setUserCertifications(_d);
                    setAllUserCertificationFiles(_f);
                    setCertificationFormEntryFlag(false);//close the form

                    popup.remove();
                    popup.onBottomCenterSuccessMessage("Certification Saved");

                }).catch(err => {
                    console.log(err);
                    popup.onBottomCenterErrorOccured();
                    console.error("Error updating user cert info");
                });

            }).catch(err => {
                console.log(err);
                popup.remove();
                popup.onBottomCenterErrorOccured();
                console.error("Error uploading files");
            });

        } else {
            popup.remove();
            popup.onBottomCenterRequiredErrorMsg();
        }
    }

    const handleCertificationDeletion = () => {

        popup.onScreen("Deleting ...");

        let _d = [...userCertifications];
        let _f = [...contextValues.userInfo.files];

        //check if its edit mode 
        if ("_id" in userCertificationEditProps) {
            //Update mode 

            let indx = _d.findIndex(_c => _c._id === userCertificationEditProps._id);

            //delete the linked files
            userFunctions.deleteUserProfileFiles(_d[indx].fileIds).then(deleteFileResponse=>{
                
                //delete files from the context variable 
                _d[indx].fileIds.forEach(_fId => {
                    let fIndx = _f.findIndex(_ff => _ff._id === _fId);
                    _f.splice(fIndx, 1);
                });

                _d.splice(indx, 1);//splice the dataset to remove the deleted items

                //update the data 
                return userFunctions.submitUserUpdates({
                    "medical_certifications": _d,
                    "_id": contextValues.userInfo._id
                });

            }).then(updateResponse => {

                //set user certification state
                contextValues.updateUserInfoContext({
                    medical_certifications: _d,
                    files:_f
                });

                setUserCertifications(_d);
                setDeleteConfirmationBoxFlag(false);//close the form

                popup.remove();
                popup.onBottomCenterSuccessMessage("Certification Deleted");

            }).catch(err => {
                console.log(err);
                popup.remove();
                popup.onBottomCenterErrorOccured("Error occured while deleting. Try again.");
                console.error("Error deleting the certification");
            });

        }

    }

    /** Render */
    return (<div className="border-bottom pt-2 pb-2 position-relative">
        <UserInfo.Consumer>
            {({ userInfo = {} }) => {
                return <div>
                    {
                        !("medical_certifications" in userInfo) || userInfo.medical_certifications.length === 0 ?
                            <div className="small">
                                <div className="text-muted">Add any certifications and/or training that you have obtained relating to your professional </div>
                                <div className="mt-1 btn-link pointer" onClick={() => { setCertificationFormEntryFlag(true) }}>Add Certifications or Trainings</div>
                            </div> :
                            <div>
                                {
                                    userInfo.medical_certifications.map(certs => {

                                        let _files = certs.fileIds.reduce((acc, ci) => {
                                            acc.push(userInfo.files.filter(_f => _f._id === ci)[0]);
                                            return acc;
                                        }, []);

                                        return <div className="border-bottom position-relative pt-2 pb-2" key={certs._id}>
                                            <div className="small">
                                                <div>{certs.medical_certification_title}</div>
                                                {
                                                    certs.medical_certification_issue_date.length > 0 ?
                                                        <div className="text-muted">Issued on {moment(certs.medical_certification_issue_date).format("DD MMM YYYY")} ({moment(certs.medical_certification_issue_date).fromNow()})</div> : null
                                                }
                                                <div className="btn-link pointer d-inline-block" onClick={() => setSelectedFilesForPreview(_files)}>{_files.length > 0 ? _files.length + " files" : ""}</div>
                                            </div>
                                            <div className="push-right d-flex">
                                                <div className="small btn-link pointer" onClick={() => { setUserCertificationEditProps({
                                                    _id:certs._id,
                                                    mode:"update"
                                                })}}>Edit</div>
                                                <div className="small btn-link text-danger pointer ml-2" onClick={() => { setUserCertificationEditProps({
                                                    _id:certs._id,
                                                    mode:"delete"
                                                })}}>Delete</div>
                                            </div>
                                        </div>
                                    })
                                }
                                <div className="pt-2 pb-1 btn-link small pointer" onClick={() => { setCertificationFormEntryFlag(true) }}>Add Certifications or Trainings</div>
                            </div>
                    }
                </div>

            }}
        </UserInfo.Consumer>
        {
            userCertificationEntryForm ?
                <Modal header={<h3>Attach other files</h3>} onCloseHandler={() => { setCertificationFormEntryFlag(false) }}>
                    <form ref={formRef} onSubmit={(e) => { handleCertificationSubmission(e) }} >

                        <div className="form-group">
                            <label data-required="1">Title </label>
                            <input type="text" name="medical_certification_title"
                                className="form-control entry-field" data-required="1"
                                placeholder="Medical Certification/Training Title" />
                        </div>

                        <div className="form-group">
                            <label data-required="1">Date of Issue </label>
                            <input type="date" name="medical_certification_issue_date"
                                className="form-control entry-field" data-required="1"
                                placeholder="Date Certification/Training was issued" />
                        </div>

                        <div className="form-group">

                            <label htmlFor="certifications-file" data-required="1">Attach Insurance Card </label>

                            <div id="medical-certifications-files-container"
                                name="medical_certifications_files"
                                className="mt-2 p-2 position-relative droppable-file-container entry-field"
                                data-required="1"
                                placeholder="Certifications and Trainings">

                                <div className="droppable-file-action-container">

                                    <div className="small text-muted d-inline-block">Drag and drop or upload the file</div>

                                    <div className="position-relative ml-2 upload-file-container d-inline-block">
                                        <input type="file" id="certifications-file" className="form-control" multiple="multiple" />
                                        <div className="btn-info p-1 rounded text-center input-overlay small">Upload File</div>
                                    </div>

                                </div>

                                <div className="droppable-file-preview-container"></div>

                            </div>

                        </div>
                        <div className="mt-2 text-center">
                            <button className="btn btn-primary w-75" type="submit">Save Information</button>
                        </div>
                    </form>
                </Modal> : null
        }

        {
            showCertificationsFilesPreviewModal ?
                <FilePreview files={selectedFilesForPreview} onCloseHandler={() => { setCertificationsFilesPreviewModalFlag(false) }}></FilePreview> : null
        }

        {
            showDeletionConfirmationBox?
            <ConfirmationBox >
                <h3>Certification Deletion Confirmation</h3>
                <div className="font-weight-bold">Are you sure to delete the <span className="text-danger">
                {
                    contextValues.userInfo.medical_certifications.filter(_c=>_c._id===userCertificationEditProps._id).length>0?
                    contextValues.userInfo.medical_certifications.filter(_c=>_c._id===userCertificationEditProps._id)[0].medical_certification_title:null
                }
                </span> certification?</div>
                <div className="small">It will delete all linked attachements to this certifications</div>
                <div className="mt-2 text-right d-flex justify-content-end">
                    <div className="btn-sm btn-danger pointer" onClick={()=>{handleCertificationDeletion()}}>Yes</div>
                    <div className="btn-sm btn-link ml-2 pointer" onClick={()=>{setDeleteConfirmationBoxFlag(false)}}>No</div>
                </div>
            </ConfirmationBox>:
            null
        }
    </div>
    )
}