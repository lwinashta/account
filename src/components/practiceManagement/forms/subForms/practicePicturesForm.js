import React, { useState, useEffect } from "react";
import { FileUploadField } from "core/components/fields/web/fileUploadField/fileUploadField";

export const PracticePicturesForm = () => {

    return (
        <div>
            <div className="mb-3 font-weight-bold text-primary">Practice Pictures:</div>
            
            <div className="form-group">
                <label >Upload Practice Pictures</label>
                <div className="mt-2">
                    <FileUploadField />
                </div>
            </div>

            <div className="d-flex flex-row justify-content-between mt-4">
                <div className="btn btn-primary pointer" 
                    onClick={()=>{contextValues.handleTabClick("contact","pictures")}}>
                        <i className="mr-2 fas fa-arrow-left"></i>
                        <span>Previous</span>
                    </div>
                <div className="btn btn-primary pointer" 
                    onClick={()=>{contextValues.handleTabClick("availability","pictures")}}>
                        <i className="mr-2 fas fa-arrow-right"></i>
                        <span>Next</span>
                </div>
            </div>

        </div>
    );
}