
import React, { useState, useEffect }from "react";
import { formjs} from "@oi/utilities/lib/js/form";
import { UserInfo } from "../../contexts/userInfo";
import { FilePreview } from "@oi/reactcomponents";

/**
 * Display address in single line 
 * @param {Object} address  
 */
export const DisplayPracticeAddress=({address={}})=>{
    return (
        <div>
            {address.medical_facility_street_address_1},
            {address.medical_facility_street_address_2.length > 0 ? address.medical_facility_street_address_2 : ""}
            {address.medical_facility_city},
            {address.medical_facility_state},
            {address.medical_facility_zip_code},
            {address.medical_facility_country}
        </div>
    )
};

/**
 * Display practice contact information 
 * @param {Array of contact objects} contacts 
 */
export const DisplayPracticeContact=({contacts=[]})=>{
    return (
        <div>
            {contacts.length > 0 ?
                <div>
                    {
                        contacts.map((contact, indx) => {
                            return <div key={indx} >
                                <span className="mr-2">
                                    {
                                        contact.contact_type.match(/phone|mobile|fax/i)!==null?
                                        <i className="fas fa-phone-alt"></i>:
                                        <i className="fas fa-envelope"></i>
                                    }
                                </span>
                                <span>{contact.contact_info} ({contact.contact_type})</span>
                            </div>
                        })
                    }
                </div> :
                null
            }
        </div>
    )
}

/**
 * Display practice types information 
 * @param {Array} types 
 */
export const DisplayPracticeTypes=({types=[]})=>{
    return (
        <UserInfo.Consumer>
            {({facilityTypes=[]})=>{
                return <div className="d-flex flex-wrap">
                    {
                        types.length>0 && facilityTypes.length>0?
                        types.map((type,indx)=>{
                            
                            let classes="bg-light p-1 mt-1 border rounded";
                            classes+=indx!==0?" ml-2 ":"";
                            
                            let val=facilityTypes.filter(f=>f._id===type)[0];
                            return <div key={indx} className={classes}>{val.name}</div>

                        }):null
                    }
                </div>
            }}
        </UserInfo.Consumer>
        
    );
}

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
                                        <img src={"/fs/" + file._id} /> :
                                        <embed src={"/fs/" + file._id}></embed>
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
