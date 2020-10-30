import React, { useState, useEffect } from "react";
import { fileUploadField } from "@oi/utilities/lib/js/form";

export const PracticePicturesEntry = ({ 
        selectedPracticeInfo = {}, 
        onNextClick = null, 
        onBackClick=null,
        setEntryData = null,
        onSubmission=null
    }) => {

    const [facilityFiles, setFacilityFiles] = useState({});

    let practicePicturesRef = React.createRef();

    useEffect(() => {

        //Set values if edit mode 
        //Bind the form upload pics 
        let _manageFiles = new fileUploadField();

        _manageFiles.container = $(practicePicturesRef.current).find('.droppable-file-container');
        _manageFiles.multiple = true;
        _manageFiles.name = $(practicePicturesRef.current).find('.droppable-file-container').attr('name');
        _manageFiles.onFileSelectionCallback = function (file, allUploaded) {
            setFacilityFiles(allUploaded);
        };
        _manageFiles.bind();//bind file drg and drop

        //Check if edit mode 
        if (Object.keys(selectedPracticeInfo).length > 0) {

            //Insert files 
            _manageFiles.fileData = selectedPracticeInfo.files;//files are only linked to facility, not facilityUser Data
            _manageFiles.insertFiles();

        }

    }, []);

    //** handlers */
    const handleOnNext = (e) => {
        
        setEntryData({
            facilityFiles:facilityFiles
        });
        onNextClick();

    }

    return (
        <div ref={practicePicturesRef}>
            <div className="form-group">

                <label htmlFor="insurance-file" className="h5 font-weight-bold text-capitalize">Attach Practice Pictures </label>
                <div className="text-muted small">Attach your practice pictures. The pictures will be viewable to everyone who will be viewing your profile.</div>
                <div id="practice-pics-file-container"
                    name="medical_facility_pictures"
                    className="mt-2 p-2 position-relative droppable-file-container entry-field"
                    placeholder="Practice Pictures">

                    <div className="droppable-file-action-container">

                        <div className="small text-muted d-inline-block">Drag and drop or upload the file</div>

                        <div className="position-relative ml-2 upload-file-container d-inline-block">
                            <input type="file" id="insurance-file" className="form-control" multiple="multiple" />
                            <div className="btn-info p-1 rounded text-center input-overlay small">Upload File</div>
                        </div>

                    </div>

                    <div className="droppable-file-preview-container"></div>

                </div>

            </div>

            {
                onBackClick !== null && onNextClick !== null ?
                    <div className="mt-2 d-flex justify-content-between">
                        <div className="btn-sm btn-secondary pointer small"
                            onClick={() => { onBackClick() }}>
                            <i className="fas fa-chevron-left mr-2"></i>
                            <span>Back</span>
                        </div>
                        <div className="btn-sm btn-info pointer small"
                            onClick={() => { handleOnNext() }}>
                            <span>Next</span>
                            <i className="fas fa-chevron-right ml-2"></i>
                        </div>
                    </div> :
                onSubmission !== null ?
                        <div className="mt-2 text-center pt-2 border-top" onClick={()=>{onSubmission(facilityFiles)}}>
                            <button className="btn btn-primary w-75" type="submit">Save Information</button>
                        </div> :
                null
            }

        </div>
    );
}