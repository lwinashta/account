import React,{useContext,useState,useEffect} from 'react';
import {DropDown} from 'core/components/buttons/dropDown/web/dropDown';

// import { AffliatePracticeForm } from "./forms/affiliatePracticeForm";
import { PracticeEntryForm } from "./forms/PracticeEntryForm";

export const PracticeManagement = () => {

    const [showPracticeEntryForm, setShowPracticeEntryFormFlag] = useState(false);
    const [showAffiliationEntryForm, setAffiliationEntryFormFlag]=useState(false);

    return (<div className="container-fluid mt-4">
        <div className="d-flex flex-row justify-content-between align-items-baseline">
            <h4>Practices:</h4>
            <DropDown 
                defaultButton={<div onClick={()=>{setShowPracticeEntryFormFlag(true)}}>
                    <i className="mr-2 fas fa-user-nurse"></i>
                    <span>Add New Practice</span>
                </div>}>
                <div className="item py-2 px-3" onClick={()=>{setShowPracticeEntryFormFlag(true)}}>
                    <i className="fas fa-user-nurse"></i>
                    <span>Add New Practice</span>
                </div>
                <div className="item py-2 px-3" onClick={()=>{setAffiliationEntryFormFlag(true)}}>
                    <i className="fas fa-clinic-medical"></i>
                    <span>Affliate to Practice</span>
                </div>
            </DropDown>
        </div>

        <div className="mt-3">
            {/* {Display Practices} */}
        </div>

        {
            showPracticeEntryForm?
            <PracticeEntryForm 
                onCloseHandler={setShowPracticeEntryFormFlag}/>:
            null
        }

        {
            showAffiliationEntryForm?
            <div></div>:
            null
        }

    </div>)
}