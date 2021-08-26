import React, { useEffect, useState, useContext, useRef } from "react";
const moment = require('moment')
import { v4 as uuidv4 } from 'uuid';

import { form } from "form-module/form";
import { Modal } from "core/components/modal/web/modal";
import { FileUploadField } from "core/components/fields/web/fileUploadField/fileUploadField";
import { uploadFilesToServer } from "fileManagement-module/lib/handlers";

import { AppContext } from "../../AppContext";

const _iForm = new form();
_iForm.formConfig = require('account-manager-module/lib/user/qualification/certifications/form/config.json');

const sd = moment().subtract(50, 'years').year();
const td = moment().year();

const startYears = Array.from(new Array(51)).map((x, i) => { return sd + i });

//Goes back 80 years from current year and goes ahead 30 years
const expirationYears = Array.from(new Array(50))
    .map((x, i) => { return sd + i })
    .concat(Array.from(new Array(10))
        .map((x, i) => { return td + i }))
    .sort();

const months = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];

export const CertificationForm = ({
    onCloseHandler = function () { },
    certificateToUpdate = null
}) => {

    let AppLevelContext = useContext(AppContext);

    let formValues = useRef(certificateToUpdate !== null ?
        Object.assign(_iForm.getInitialFormObject(), certificateToUpdate) : _iForm.getInitialFormObject());
    
    let filesToUpload = useRef({
        registrationFiles: []
    });

    const [validationError, setValidationError] = useState([]);

    const setDefaultValueForFields = (fieldName) => {
        return (certificateToUpdate !== null
            && (fieldName in certificateToUpdate)) ?
            certificateToUpdate[fieldName] : null
    }

    const handleFileUpload = (files) => {
        filesToUpload.current.certificateFiles = files;
        formValues.current.certificateFiles = formValues.current.certificateFiles.concat(files);
    }

    const handleFormValues = (params) => {
        formValues.current = Object.assign(formValues.current, params);
    }

    const handleCertificationSubmission = async (e) => {
        try {

            e.preventDefault();

            //validation check 
            let _d = _iForm.validateForm(formValues.current);
            console.log(formValues.current,_d);
            setValidationError(_d);

            if (_d.length > 0) {
                alert("Please enter required information.");

            } else {
                //Insert necessary values in the data 
                let data={};

                let { certificateFiles, ...certificateData } = formValues.current;

                if (certificateToUpdate === null) {
                    certificateData.uuid = uuidv4();
                    data["$push"] = {
                        certificates:certificateData
                    }

                } else if (certificateToUpdate !== null) {
                    data.query = {
                        "certificates.uuid": certificateToUpdate.uuid
                    }
                    data["certificates.$"] = certificateData;
                }

                data._id=AppLevelContext.userInfo._id;

                let updatedUserInfo = await fetch("/account/api/user/profile/update", {
                    method: "POST",
                    body: JSON.stringify(data),
                    headers: {
                        "content-type": "application/json"
                    }
                });

                //insert Files 
                let newFiles = certificateFiles ? certificateFiles.filter(f => !('_id' in f)):[];

                if (newFiles.length > 0) {
                    let uploadFiles = await uploadFilesToServer(newFiles,{
                        linkedMongoId:AppLevelContext.userInfo._id,
                        linkedDatabaseName: "accounts",
                        linkedCollectionName: "users",
                        fieldName:"certificateFiles",
                        additionalFileInfo:{
                            uuid:certificateData.uuid
                        }
                    });
                }

                //reset user info
                let resetUserInfo = await AppLevelContext.resetUserInformation();

                AppLevelContext.setPopup({
                    show:true,
                    message:certificateToUpdate===null?"Certificate added":"Certificate updated",
                    messageType:"success"
                });

                onCloseHandler(false);

            }

        } catch (error) {
            console.log(error);

        }
    }

    /** Render */
    return (<Modal
        header={<h3>Certification Entry</h3>}
        onCloseHandler={() => { onCloseHandler(false) }}>
        <form onSubmit={(e) => { handleCertificationSubmission(e) }}>
            <div className="form-group">
                <label data-required="1">Name </label>
                <input type="text"
                    name="certificationName"
                    onInput={(e) => {
                        handleFormValues({
                            certificationName: e.target.value
                        })
                    }}
                    className="form-control"
                    data-required="1"
                    defaultValue={setDefaultValueForFields("certificationName")}
                    placeholder="Certification Name" />
                {validationError.length > 0 ?
                    _iForm.displayValidationError("certificationName") : null
                }
            </div>

            <div className="form-group">
                <label>Issued By</label>
                <input type="text"
                    name="issuedBy"
                    onInput={(e) => {
                        handleFormValues({
                            issuedBy: e.target.value
                        })
                    }}
                    className="form-control"
                    data-required="1"
                    defaultValue={setDefaultValueForFields("issuedBy")}
                    placeholder="Educational Institute/ University" />
                {validationError.length > 0 ?
                    _iForm.displayValidationError("issuedBy") : null
                }
            </div>

            <div className="form-group d-flex flex-row" style={{ justifyContent: "space-evenly" }}>
                <div className="px-2" style={{ flexGrow: 1 }}>
                    <label htmlFor="issueMonth-certificate" data-required="1">Issued On month & year</label>
                    <div>
                        <select name="issueMonth"
                            onChange={(e) => {
                                handleFormValues({ issueMonth: _iForm.sanitizeValues(e.target.value) });
                            }}
                            defaultValue={setDefaultValueForFields("issueMonth")}
                            id="issueMonth-certificate"
                            className="form-control"
                            data-required="1"
                            placeholder="Issue Month" >
                            <option value="">Month</option>
                            {months.map(month => {
                                return <option key={month} value={month}>{month} </option>
                            })}
                        </select>
                        {validationError.length > 0 ?
                            _iForm.displayValidationError("issueMonth") : null
                        }
                    </div>
                    <div className="mt-2">
                        <select name="issueYear"
                            onChange={(e) => {
                                handleFormValues({ issueYear: _iForm.sanitizeValues(e.target.value) });
                            }}
                            defaultValue={setDefaultValueForFields("issueYear")}
                            id="issueYear-certificate"
                            className="form-control"
                            data-required="1"
                            placeholder="Issue Year" >
                            <option value="">Year</option>
                            {startYears.map(year => {
                                return <option key={year} value={year}>{year} </option>
                            })}
                        </select>
                        {validationError.length > 0 ?
                            _iForm.displayValidationError("issueYear") : null
                        }
                    </div>
                </div>

                <div className="px-2" style={{ flexGrow: 1 }}>
                    <label htmlFor="expirationMonth-certificate" data-required="1">Expiration month & year</label>
                    <div>
                        <select name="expirationMonth"
                            onChange={(e) => {
                                handleFormValues({ expirationMonth: _iForm.sanitizeValues(e.target.value) });
                            }}
                            defaultValue={setDefaultValueForFields("expirationMonth")}
                            id="expirationMonth-certificate"
                            className="form-control"
                            data-required="1"
                            placeholder="Expiration Month" >
                            <option value="">Month</option>
                            {months.map(month => {
                                return <option key={month} value={month}>{month} </option>
                            })}
                        </select>
                        {validationError.length > 0 ?
                            _iForm.displayValidationError("expirationMonth") : null
                        }
                    </div>
                    <div className="mt-2">
                        <select name="expirationYear"
                            onChange={(e) => {
                                handleFormValues({ expirationYear: _iForm.sanitizeValues(e.target.value) });
                            }}
                            defaultValue={setDefaultValueForFields("expirationYear")}
                            id="expirationYear-certificate"
                            className="form-control"
                            data-required="1"
                            placeholder="Expiration Year" >
                            <option value="">Year</option>
                            {expirationYears.map(year => {
                                return <option key={year} value={year}>{year} </option>
                            })}
                        </select>
                        {validationError.length > 0 ?
                            _iForm.displayValidationError("expirationYear") : null
                        }
                    </div>
                </div>

            </div>

            <div className="form-group">
                <label htmlFor="certificateFiles" data-required="1">Upload Medication Registration </label>
                <div className="mt-2">
                    <FileUploadField
                        files={certificateToUpdate!==null 
                                && AppLevelContext.userInfo.files.length>0 ?
                                AppLevelContext.userInfo.files.filter(f=>f.fieldName==="certificateFiles" 
                                    && f.additionalFileInfo && f.additionalFileInfo.uuid===certificateToUpdate.uuid)
                                :null}
                        required
                        onUpload={handleFileUpload} />
                </div>
            </div>                

            <div className="mt-2 text-center">
                <button className="btn btn-primary w-75" type="submit">Save Certificate</button>
            </div>

        </form>
    </Modal>
    )
}