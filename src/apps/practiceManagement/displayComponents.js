
import React, { useState, useEffect }from "react";
import { FilePreview } from "@oi/reactcomponents";

/**
 * Display practice uploaded files 
 * @param {FileList} files 
 */
export const DisplayPracticeFiles=({files=[]})=>{
    
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
                <div className="d-flex flex-wrap">
                    {
                        files.map((file, indx) => {

                            let classes="img-preview mt-1 pointer ";
                            classes+=indx!==0?" ml-2 ":"";
                            
                            if (indx == 3) {
                                return <div key={indx} className="btn-link ml-3 pointer" style={{ lineHeight: '100px' }} 
                                    onClick={()=>{handleFilePreview(0)}}> +{files.length - 4} more</div>
                            } else if (indx < 3) {
                                return <div key={indx} className={classes} 
                                    onClick={()=>{handleFilePreview(indx)}}>
                                    {file.file_type.match(/jpeg|jpg|png|gif/i) !== null ?
                                        <img src={"/g/fs/" + file._id} /> :
                                        <embed src={"/g/fs/" + file._id}></embed>
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

export const DisplayPracticeVerification=({verified=false})=>{
    return (
        <div>
            {verified?
                <div className="d-flex mt-2">
                    <div className="text-success align-top">
                        <span className="fas fa-check"></span>
                    </div>
                    <div className="ml-2 text-success align-top">
                        This practice has been <b>verified</b> by our complaince team. 
                        Practice is now viewable to patients in the search results. 
                        Please contact us to update practice information.
                    </div>
                </div>
                :
                <div className="d-flex mt-2">
                    <div className="text-danger align-top">
                        <span className="fas fa-exclamation"></span>
                    </div>
                    <div className="ml-2 text-danger align-top">
                        This practice is <b>pending verification</b> from our compliance team. 
                        Verification generally takes 24-48 hours depending on the location. Please contact us if you there are any concerns.
                    </div>
                </div>
            }
        </div>
    );
}

export const DisplayPracticeUserVerification=({verified=false})=>{
    return (
        <div>
            {verified?
                <div className="d-flex mt-2">
                    <div className="text-success align-top">
                        <span className="fas fa-check"></span>
                    </div>
                    <div className="ml-2 text-success align-top">
                        Your affiliation with this practice has been <b>verified</b> by our complaince team. Your profile will now be viewable and searchable.
                    </div>
                </div>
                :
                <div className="d-flex mt-2">
                    <div className="text-danger align-top">
                        <span className="fas fa-exclamation"></span>
                    </div>
                    <div className="ml-2 text-danger align-top">
                        Your affiliation with this practice  is <b>pending verification</b> from our compliance team. 
                        Verification generally takes 24-48 hours depending on the location. Please contact us if you there are any concerns.
                    </div>
                </div>
            }
        </div>
    );
}
