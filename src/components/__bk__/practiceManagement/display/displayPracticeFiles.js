import { PracticeContext } from "../../../contexts/practice";
import React, { useContext,useState, useEffect }from "react";
import { Modal} from "@oi/reactcomponents";
import { FilePreview } from "@oi/reactcomponents";
import {PracticePicturesEntry} from './../entry/practicePicturesEntry'

export const DisplayPracticeFiles=()=>{

    let contextValues = useContext(PracticeContext);
    let facilityInfo=contextValues.facilityInfo;

    const [showEntryForm,setEntryFormFlag]=useState(false);

    const handleUploadPracticeFiles=(files)=>{
        
        uploadFiles(files).then(r=>{
            //insert the files 
            let _d=[...facilityInfo.files];
            _d=_d.concat(files);

            contextValues.updateFacilityStateInfo({
                _id:facilityInfo._id,
                files:_d
            });

            setEntryFormFlag(false);

            popup.onBottomCenterSuccessMessage("Practice Pictures Uploaded");
            
        }).catch(err=>{
            console.log(err);
            popup.onBottomCenterErrorOccured();
        });

    }

    const uploadFiles=(files)=>{

        let fileData = new FormData();

        Object.keys(files).forEach(key => {
            fileData.append(key, files[key]);
        });

        fileData.append("linked_mongo_id", facilityInfo._id);
        fileData.append("linked_db_name", "accounts");
        fileData.append("linked_collection_name", "healthcareFacilities");

        return $.ajax({
            "url": '/file/uploadfiles',
            "processData": false,
            "contentType": false,
            "data": fileData,
            "method": "POST"
        });
    }

    return (<div>
        <div className="pt-2 pb-2 border-bottom position-relative">
            <div className="font-weight-bold">Pictures</div>
            {
                facilityInfo.files.length > 0 ?
                <div>
                    <div className="mt-2">
                        <DisplayEachPracticeFile files={facilityInfo.files} /></div>
                    <div className="push-right" onClick={()=>{setEntryFormFlag(true)}}>
                        <div className="small pointer mr-2 btn-link">Edit</div>
                    </div> 
                </div>:
                <div className="mt-2 small pointer mr-2 btn-link" onClick={()=>{setEntryFormFlag(true)}}>Add Pictures</div>
            }
        </div>
        {
            showEntryForm?
            <Modal header={<h3>Practice Entry</h3>} 
                onCloseHandler={()=>{setEntryFormFlag(false)}}>
                <PracticePicturesEntry 
                    selectedPracticeInfo={facilityInfo} 
                    onSubmission={handleUploadPracticeFiles} />
            </Modal>:
            null
        }
    </div>)
}

export const DisplayEachPracticeFile=({files=[]})=>{
    
    const [showFilesPreviewModal,setShowFilesPreviewModalFlag]=useState(false);
    const [defaultFileIndx,setDefaultFileIndx]=useState(0);

    const handleFilePreview=(indx)=>{
        setShowFilesPreviewModalFlag(true);
        setDefaultFileIndx(indx);
    }

    useEffect(()=>{
        if(!setShowFilesPreviewModalFlag){
            setDefaultFileIndx(0);
        }
    },[showFilesPreviewModal])

    return (
        <div>
            {
            files.length > 0 ?
                <div>
                    {
                        files.map((file, indx) => {

                            let classes="img-preview mt-1 d-inline-block pointer border rounded p-2";
                            classes+=indx!==0?" ml-2 ":"";
                            
                            if (indx == 3) {
                                return <div key={indx} className="mt-2 d-inline-block btn-link ml-3 pointer" 
                                    onClick={()=>{handleFilePreview(0)}}> +{files.length - 4} more</div>
                            } else if (indx < 3) {
                                return <div key={indx} className={classes} 
                                    onClick={()=>{handleFilePreview(indx)}}>
                                    {file.file_type.match(/jpeg|jpg|png|gif/i) !== null ?
                                        <img src={"/file/fs/" + file._id} /> :
                                        <embed src={"/file/fs/" + file._id}></embed>
                                    }
                                </div>
                            }
                        })
                    }
                </div>
                : null
        }
        {
            showFilesPreviewModal?
            <FilePreview files={files} 
                onCloseHandler={()=>{setShowFilesPreviewModalFlag(false)}} 
                defaultFile={defaultFileIndx}></FilePreview>:null
        }
        </div>
        
    )
}