import React, { useEffect, useState, useContext, useRef } from "react";
const moment = require('moment')

import { form } from "form-module/form";
import { Modal } from "core/components/modal/web/modal";
import { FileUploadField } from "core/components/fields/web/fileUploadField/fileUploadField";
import { uploadFilesToServer } from "fileManagement-module/lib/handlers";
const countries = require('@oi/utilities/lists/countries.json');

import { AppContext } from "../../AppContext";

const _iForm = new form();
_iForm.formConfig = require('account-manager-module/lib/user/qualification/medicalRegistration/form/config.json');

export const MedicalRegistrationForm = ({
    onCloseHandler = function () { }
}) => {

    let AppLevelContext = useContext(AppContext);

    let formValues = useRef(("medicalRegistration" in AppLevelContext.userInfo)?
        Object.assign(_iForm.getInitialFormObject(),AppLevelContext.userInfo.medicalRegistration) : _iForm.getInitialFormObject());

    let filesToUpload = useRef({
        registrationFiles: []
    });

    const [validationError, setValidationError] = useState([]);

    const setDefaultValueForFields = (fieldName) => {
        return ('medicalRegistration' in AppLevelContext.userInfo)
            && (fieldName in AppLevelContext.userInfo.medicalRegistration) ?
            AppLevelContext.userInfo.medicalRegistration[fieldName] : null
    }

    const handleFileUpload = (files) => {
        filesToUpload.current.registrationFiles = files;
        formValues.current.registrationFiles = formValues.current.registrationFiles.concat(files);
    }

    const handleFormValues = (params) => {
        formValues.current = Object.assign(formValues.current, params);
    }

    const handleMedicalRegistrationSubmission = async (e) => {

        try {

            e.preventDefault();

            //validation check 
            let _d = _iForm.validateForm(formValues.current);
            
            setValidationError(_d);

            if (_d.length > 0) {
                alert("Please enter required information.");

            } else {
                //Insert necessary values in the data 
                let { registrationFiles, issueDate, expirationDate, ...data } = formValues.current;

                data["issueDate.$date"] = issueDate;//convert to date value
                data["expirationDate.$date"] = expirationDate;

                let quaification = await fetch("/account/api/user/profile/update", {
                    method: "POST",
                    body: JSON.stringify({
                        _id: AppLevelContext.userInfo._id,
                        "medicalRegistration.$object": data
                    }),
                    headers: {
                        "content-type": "application/json"
                    }
                });

                //insert Files 
                let newFiles = registrationFiles ? registrationFiles.filter(f => !('_id' in f)):[];

                if (newFiles.length > 0) {
                    let uploadFiles = await uploadFilesToServer(newFiles,{
                        linkedMongoId:AppLevelContext.userInfo._id,
                        linkedDatabaseName: "accounts",
                        linkedCollectionName: "users",
                        fieldName:"medicalRegistrationFile"
                    });
                }

                //reset user info
                let resetUserInfo = await AppLevelContext.resetUserInformation();

                AppLevelContext.setPopup({
                    show:true,
                    message:"Medical Registration Updated",
                    messageType:"success"
                });

                onCloseHandler(false);
                
            }

        } catch (error) {
            console.log(error);

        }
    }


    /** Render */
    return (
        <Modal header={<h3>Medical Registration Entry</h3>}
            onCloseHandler={() => { onCloseHandler(false) }}>
            <form onSubmit={(e) => { handleMedicalRegistrationSubmission(e) }} >
                
                <div className="form-group">
                    <label data-required="1">Registration/License Number </label>
                    <input type="text"
                        name="registrationNumber"
                        onInput={(e) => {
                            handleFormValues({
                                registrationNumber: e.target.value
                            })
                        }}
                        className="form-control entry-field"
                        data-required="1"
                        defaultValue={setDefaultValueForFields("registrationNumber")}
                        placeholder="Medical Registration Number" />
                    {validationError.length > 0 ?
                        _iForm.displayValidationError("registrationNumber") : null
                    }
                </div>

                <div className="form-group">
                    <label htmlFor="registrationFile" data-required="1">Upload Medication Registration </label>
                    <div className="mt-2">
                        <FileUploadField
                            files={AppLevelContext.userInfo.files.length>0 ?AppLevelContext.userInfo.files.filter(f=>f.fieldName==="medicalRegistrationFile"):null}
                            required
                            onUpload={handleFileUpload} />
                        {validationError.length > 0 ?
                            _iForm.displayValidationError("registrationFiles") : null
                        }
                    </div>
                </div>

                <div className="form-group mt-2">
                    <label data-required="1">Issue Date</label>
                    <input id="issueDate"
                        name="issueDate"
                        onInput={(e) => {
                            handleFormValues({
                                issueDate: e.target.value
                            })
                        }}
                        className='form-control'
                        type="date"
                        max={moment().format('YYYY-MM-DD')}
                        placeholder="Date registration was issued"
                        defaultValue={moment(setDefaultValueForFields("issueDate")).format('YYYY-MM-DD')} />
                    {validationError.length > 0 ?
                        _iForm.displayValidationError("issueDate") : null
                    }
                </div>

                <div className="form-group mt-2">
                    <label data-required="1">Expiration Date</label>
                    <input id="expirationDate"
                        name="issueDaexpirationDatete"
                        onInput={(e) => {
                            handleFormValues({
                                expirationDate: e.target.value
                            })
                        }}
                        min={moment().format('YYYY-MM-DD')}
                        className='form-control'
                        type="date"
                        placeholder="Date registration will expire"
                        defaultValue={moment(setDefaultValueForFields("expirationDate")).format('YYYY-MM-DD')} />
                    {validationError.length > 0 ?
                        _iForm.displayValidationError("expirationDate") : null
                    }
                </div>
                
                <div className="form-group">
                    <label htmlFor="countryOfIssuance-registration" data-required="1">Country of Issuance</label>
                    <select name="countryOfIssuance"
                        onChange={(e) => {
                            handleFormValues({ countryOfIssuance: countries.find(_c => _c._id === e.target.value) });
                        }}
                        defaultValue={setDefaultValueForFields("countryOfIssuance")._id}
                        id="countryOfIssuance-registration"
                        className="form-control"
                        data-required="1"
                        placeholder="Country" >
                        <option value=""></option>
                        {countries.map(c => {
                            return <option key={c._id}
                                value={c._id}>{c.name} </option>
                        })}
                    </select>
                    {validationError.length > 0 ?
                        _iForm.displayValidationError("countryOfIssuance") : null
                    }
                </div>

                <div className="form-group">
                    <label data-required="1">State of Issuance </label>
                    <input type="text"
                        name="stateOfIssuance"
                        onInput={(e) => {
                            handleFormValues({
                                stateOfIssuance: e.target.value
                            })
                        }}
                        className="form-control"
                        data-required="1"
                        defaultValue={setDefaultValueForFields("stateOfIssuance")}
                        placeholder="State of Issuance" />
                    {validationError.length > 0 ?
                        _iForm.displayValidationError("stateOfIssuance") : null
                    }
                </div>

                <div className="mt-2 text-center">
                    <button className="btn btn-primary w-75" type="submit">Save Medical Registration</button>
                </div>
            </form>
        </Modal>
    )
}



// const uploadMedicalRegistration = async (files) => {

//     //console.log(files);
//     let fileData = new FormData();

//     $.each(files, function (indx, file) {
//         fileData.append(`medicalRegistrationFile-${indx}`, file);
//     });

//     fileData.append("linkedMongoId", AppLevelContext.userInfo._id);
//     fileData.append("linkedDatabaseName", "accounts");
//     fileData.append("linkedCollectionName", "users");

//     return fetch('/file/uploadfiles', {
//         "method": "PUT",
//         body: fileData
//     });
// }