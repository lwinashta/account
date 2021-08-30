import React, { useEffect, useState } from 'react';

import { DisplayUploadedFileTile } from "core/components/infoDisplay/files/web/displayUploadedFileTile";
import { DisplayFilePreviewModal } from "core/components/infoDisplay/files/web/displayFilePreviewModal";

import { PracticeContext } from '../practiceContext';
import { PracticePicturesEntry } from './practicePicturesEntry';

export const PracticePictures = ({
    isDisabled = false
}) => {

    const [showPracticePicturesEntryForm, setShowPracticePicturesEntryForm] = useState(false);

    const [filePreviewModal, setFilePreviewModal] = useState({
        show: false,
        indx: 0,
        files: []
    });

    const handlePreviewOnClick = (files, indx) => {
        let _d = { ...filePreviewModal };

        _d.show = true;
        _d.indx = indx;
        _d.files = files;
        console.log(_d);
        setFilePreviewModal(_d);
    }

    const handleFilePreviewModalClose = () => {
        let _d = { ...filePreviewModal };

        _d.show = false;
        _d.indx = 0;
        _d.files = [];

        setFilePreviewModal(_d);
    }

    return (<>
        <PracticeContext.Consumer>
            {
                ({ practiceInfo }) => {
                    return <div className="d-flex flex-row align-items-top px-3">
                        <div className="field-name-lg">
                            <b>Pictures</b>
                        </div>
                        <div className="field-value">

                            {
                                practiceInfo.files.filter(f => f.fieldName === "practicePictures" ).length > 0 ?
                                    <div className="my-2 d-flex flex-row">
                                        {
                                            practiceInfo.files.filter(f => f.fieldName === "practicePictures").map((f, indx) => {
                                                return <div key={f._id} className="mr-2 border pointer" style={{ width: "100px", height: "80px" }}>
                                                    <DisplayUploadedFileTile
                                                        handleOnClick={() => { handlePreviewOnClick(practiceInfo.files.filter(f => f.fieldName === "practicePictures"), indx) }}
                                                        height={"50px"}
                                                        width={"100px"}
                                                        fileProps={f}
                                                        fileSrc={`/file/fs/${f._id}`} />
                                                </div>
                                            })
                                        }
                                    </div>
                                    :
                                    null
                            }

                            <button
                                className={`btn-classic btn-white py-2 px-3 ${practiceInfo.files.length > 0 ? "mt-2" : ""}`}
                                disabled={isDisabled}
                                onClick={() => { setShowPracticePicturesEntryForm(true) }}>
                                <div className="d-flex flex-row font-weight-bold justify-content-center align-items-baseline">
                                    <i className="fas fa-plus"></i>
                                    <div className="ml-2">Manage Pictures </div>
                                </div>
                            </button>
                        </div>

                    </div>
                }
            }
        </PracticeContext.Consumer>
        {
           showPracticePicturesEntryForm ?
                <PracticePicturesEntry
                    handleOnClose={setShowPracticePicturesEntryForm} /> :
                null
        }

        {
            filePreviewModal.show ?
                <DisplayFilePreviewModal
                    onCloseHandler={() => { handleFilePreviewModalClose(); }}
                    defaultFileIndx={filePreviewModal.indx}
                    files={filePreviewModal.files} /> :
                null
        }
    </>
    );
}