import React, { useState, useEffect, useContext } from "react";
import { FileUploadField } from "core/components/fields/web/fileUploadField/fileUploadField";

import { FormContext } from "./../formContext";

export const PracticePicturesForm = () => {

    let contextValues=useContext(FormContext);

    const handleFileUpload = (files) => {
        contextValues.handleFormValues({
            pictures:files
        });
    }

    return (
        <div>
            <div className="mb-3 font-weight-bold text-primary">Practice/Facility Pictures:</div>
            
            <div className="form-group">
                <label >Upload Practice Pictures</label>
                <div className="mt-2">
                    <FileUploadField
                        files={contextValues.formValues.pictures}
                        onUpload={handleFileUpload} />
                </div>
            </div>

            <div className="d-flex flex-row justify-content-between mt-4">
                <div className="btn btn-secondary pointer" 
                    onClick={()=>{contextValues.handleTabClick(contextValues.practiceToUpdate!==null && contextValues.practiceToUpdate.verificationState!=="in_edit_mode"?"in_review":"contacts","pictures")}}>
                        <i className="mr-2 fas fa-arrow-left"></i>
                        <span>Previous</span>
                </div>
                <div className="flex-row d-flex">
                    {
                        contextValues.practiceToUpdate!==null?
                        <div className="mr-2 btn btn-success pointer">
                            Submit Information
                        </div>:
                        null
                    }
                    <div className="btn btn-primary pointer" 
                        onClick={()=>{contextValues.handleTabClick("availability","pictures")}}>
                            <i className="mr-2 fas fa-arrow-right"></i>
                            <span>Next</span>
                    </div>
                </div>
                
            </div>

        </div>
    );
}