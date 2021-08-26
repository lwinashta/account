import React, { useEffect, useState, useContext } from "react";

import { AppContext } from "../../AppContext";

import * as handlers from '../handlers';

import { MedicalDegreeForm } from "./form";

export const ManageMedicalDegree = () => {

    let AppLevelContext = useContext(AppContext);

    const [showMedicalDegreeEntryForm, setShowMedicalDegreeEntryFormFlag] = useState(false);
    const [medicalDegreeToUpdate,setMedicalDegreeToUpdate]=useState(null);

    useEffect(()=>{
        if(medicalDegreeToUpdate!==null) setShowMedicalDegreeEntryFormFlag(true);
    },[medicalDegreeToUpdate]);

    useEffect(()=>{
        if(!showMedicalDegreeEntryForm) setMedicalDegreeToUpdate(null);
    },[showMedicalDegreeEntryForm]);

    /** Render */
    return (
        <>
        <div className="tile bg-white">
            <div className=" p-2 border-bottom">
                <div className="d-flex flex-row justify-content-between">
                    <div className="d-flex flex-row">
                        <div className="font-weight-bold">Medical Degrees</div>
                        <div className="font-weight-bold text-danger ml-2 text-uppercase small">(* Required)</div>
                    </div>
                    {
                        handlers.checkIfAllowedEdit(AppLevelContext.userInfo)?
                        <div title="Add Medical Degree" className="pointer" onClick={() => {
                            setShowMedicalDegreeEntryFormFlag(true);
                        }}><i className="fas fa-plus"></i></div>:
                        null
                    }
                    
                </div>
                <div className="text-muted"> Atleast one degree is required. Medical degrees will be displayed on profile screen </div>
            </div>
            
            {
                ("medicalDegrees" in AppLevelContext.userInfo) && AppLevelContext.userInfo.medicalDegrees.length > 0 ?
                    AppLevelContext.userInfo.medicalDegrees.map(item=>{
                        return <div className="border-bottom last-child-no-border p-2" key={item.uuid}>
                            <div className="d-flex flex-row justify-content-between">
                                <div>
                                    <div>{
                                        item.degrees.map(iitem=>{
                                            return <span key={iitem._id}>{iitem.name}</span>
                                        })   
                                    }</div>
                                    <div>{item.educationalInstitute}, {item.educationalInstitute}</div>
                                    <div>{item.startYear} - {item.completionYear} </div>
                                </div>
                                <div>
                                    {
                                        handlers.checkIfAllowedEdit(AppLevelContext.userInfo)?
                                        <div className="d-flex flex-row">
                                            <div title="Edit Medical Degree" className="icon-button"
                                                onClick={() => { setMedicalDegreeToUpdate(item) }}>
                                                <i className="fas fa-pencil-alt"></i>
                                            </div>
                                            {/* <div title="Remove Address" className="icon-button"
                                                onClick={() => { setAddressToDelete(address) }}>
                                                <i className="far fa-trash-alt"></i>
                                            </div> */}
                                        </div>:
                                        null
                                    }
                                </div>
                            </div>

                        </div>
                    }):
                    null
            }
        </div>
        {
            showMedicalDegreeEntryForm ?
                <MedicalDegreeForm
                    medicalDegreeToUpdate={medicalDegreeToUpdate}
                    onCloseHandler={() => setShowMedicalDegreeEntryFormFlag(false)} /> :
                null
        }
    </>
    )
}