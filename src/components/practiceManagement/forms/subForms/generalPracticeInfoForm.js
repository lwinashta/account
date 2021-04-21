import React, { useContext, useEffect } from "react";

const facilityTypes=require('@oi/utilities/lists/medicalFacilitiesTypes.json');
import { SearchableMultiselectField } from "core/components/fields/web/multiselect/searchableMultiselectField";
import { FileUploadField } from "core/components/fields/web/fileUploadField/fileUploadField";

import { FormContext } from "./../formContext";

export const GeneralPracticeInfoForm = () => {

    let contextValues=useContext(FormContext);

    const handleFileUpload = (files) => {
        contextValues.handleFormValues({
            ownershipPictures:files
        });
    }

    return (
        <div>
            <div className="mb-4 font-weight-bold text-primary">General Practice Entry:</div>
            
            <div className="form-group">
                <label data-required="1">Practice Name </label>
                <input type="text"
                    name="name"
                    onInput={(e) => {
                        contextValues.handleFormValues({
                            name: e.target.value
                        })
                    }}
                    className="form-control"
                    defaultValue={contextValues.setDefaultValueForFields("name")}
                    placeholder="Practice Name" />
                    {
                        contextValues.validationErrors.length>0?
                            contextValues.displayValidationError("name"):
                            null
                    }
            </div>

            <div className="form-group mt-2">
                <label data-required="1">Facility Type:</label>
                <div>
                    <SearchableMultiselectField  
                        handleOnItemSelection={(items)=>{
                            contextValues.handleFormValues({
                                facilityTypes: items
                            })
                        }}
                        dataToUpdate={contextValues.practiceToUpdate!==null 
                            && ('facilityTypes' in contextValues.practiceToUpdate) 
                            && contextValues.practiceToUpdate.facilityTypes.length>0? 
                                
                            contextValues.practiceToUpdate.facilityTypes:null
                        }
                        selections={facilityTypes} />
                </div>
                {
                    contextValues.validationErrors.length>0?
                        contextValues.displayValidationError("facilityTypes"):
                        null
                }
            </div>

            <div className="form-group">
                <label data-required="1">Upload Proof of Ownership</label>
                <div className="mt-2 text-muted">Upload images or documents that proves the onwership of the practice. This will help the verification process to move faster </div>
                <div className="mt-2">
                    <FileUploadField
                        files={contextValues.formValues.ownershipPictures}
                        onUpload={handleFileUpload} />
                </div>
            </div>

            <div className="form-group">
                <div>
                    <label htmlFor="private-practice-description">Practice Description/ Services Available
                        <i className="small text-muted ml-2">(Optional)</i>
                    </label>
                    <div className="text-muted"> Please provide brief description about the facility and services provided
                    (e.g., general and specialty surgical services, x ray/radiology services, laboratory services).
                    Providing descripton helps patients to understand if it right choice for them</div>
                </div>
                <textarea className="mt-2 form-control entry-field"
                    name="description" 
                    onInput={(e) => {
                        contextValues.handleFormValues({
                            description: e.target.value
                        })
                    }}
                    defaultValue={contextValues.setDefaultValueForFields("description")}
                    placeholder="Description"></textarea>
                {
                    contextValues.validationErrors.length>0?
                        contextValues.displayValidationError("description"):
                        null
                }
            </div>

            <div className="d-flex flex-row justify-content-end">
                {
                    contextValues.practiceToUpdate!==null?
                    <div className="mr-2 btn btn-success pointer">
                        Submit Information
                    </div>:
                    null
                }
                <div className="btn btn-primary pointer" 
                    onClick={()=>{contextValues.handleTabClick("address","general")}}>
                        <i className="mr-2 fas fa-arrow-right"></i>
                        <span>Next</span>
                    </div>
            </div>

        </div>
    );
}