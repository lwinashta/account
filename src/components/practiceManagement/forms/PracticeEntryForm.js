import React, { useEffect, useState, useRef, useContext } from "react";

import { Modal } from "core/components/modal/web/modal";
import { form } from "form-module/form";

import { FormContext } from "./formContext";

const _iForm = new form();
_iForm.formConfig = require('account-manager-module/lib/practiceManagement/form/config.json');

import './practiceForm.css';
import { GeneralPracticeInfoForm } from "./subForms/generalPracticeInfoForm";
import { PracticeAddressForm } from "./subForms/practiceAddressForm";
import { PracticeContactEntry } from "./subForms/practiceContactEntry";
import {PracticePicturesForm} from './subForms/practicePicturesForm'

export const PracticeEntryForm = ({ 
    afterSubmission = {} ,
    practiceToUpdate=null,
    onCloseHandler=function(){}
}) => {
    
    const [selectedTabs, setTabs] = useState(["general"]);
    const [currentTab, setCurrentTab] = useState("general");
    const [validationErrors,setValidationErrors]=useState([]);

    let formValues = useRef(practiceToUpdate!==null?
        Object.assign(_iForm.getInitialFormObject(),practiceToUpdate) : _iForm.getInitialFormObject());

    const handleFormValues = (params) => {
        formValues.current = Object.assign(formValues.current, params);
        console.log(formValues.current);
    }

    const validateEntriesOnCurrentTab=(tabName)=>{
        
        let fieldConfigs=_iForm.formConfig.filter(i=>i.tabName===tabName);
        let _d=[];
        
        fieldConfigs.forEach(config => {
            let validation=_iForm.validateEachEntry(formValues.current[config.name],config,formValues.current);
            validation!==null?_d.push(validation):null;
        });

        return _d;
    }

    //currentTabName=Current tab user is on the screen
    //clickedTabName= tab name user wants to navigate to.
    const handleTabClick=(clickedTabName,currentTabName)=>{

        function goNext(){
            if (!selectedTabs.includes(clickedTabName)) {
                setTabs([...selectedTabs].concat(clickedTabName));
            }
            setCurrentTab(clickedTabName);
        }

        //validate enteries for the current tab 
        if(currentTab!==null){
            
            let validations=validateEntriesOnCurrentTab(currentTabName);
            if(validations.length>0){
                console.log(validations);
                setValidationErrors(validations);
                _iForm.validationErrors=validations;
    
            }else{
                goNext();
            }

        }else{
            goNext();
        }
    }

    const displayValidationError=(fieldName)=>{
        return _iForm.validationErrors.length > 0 ?
            _iForm.displayValidationError(fieldName) : null
    }

    const setDefaultValueForFields = (fieldName) => {
        return (practiceToUpdate !== null
            && (fieldName in practiceToUpdate)) ?
            practiceToUpdate[fieldName] : null
    }

    /**
     * 
     * @Submission Execution Flow: 
     * 1. Start Loader 
     * 2. Deconstruct the data
     * 3. Save facility information
     * 4. Save Facility User Information
     * 5. Save Facility Files
     * 6. Get the Facility Info from server 
     * 7. Set the Facility Info as Practice Info for the User
     * 8. Stop Loader
     */


    return (
        <FormContext.Provider value={
            {
                practiceToUpdate:practiceToUpdate,
                currentTab:currentTab,
                setTabs:setTabs,
                handleTabClick:handleTabClick,
                setCurrentTab:setCurrentTab,
                handleFormValues:handleFormValues,
                formValues:formValues.current,
                validationErrors: validationErrors,
                displayValidationError:displayValidationError,
                setDefaultValueForFields:setDefaultValueForFields
            }
        }>
            
            <Modal
                onCloseHandler={()=>{onCloseHandler(false)}}
                headerHeight={100}
                header={<HeaderTabs
                    selectedTabs={selectedTabs}
                    currentTab={currentTab}
                    handleTabClick={handleTabClick} />}>

                <div className="px-2 mt-2">
                    <div style={currentTab === "general" ? null : {display:"none"} }>
                        <GeneralPracticeInfoForm />
                    </div>
                    <div style={currentTab === "address" ? null : {display:"none"} }>
                        <PracticeAddressForm />
                    </div>
                    <div style={{ display: currentTab === "contacts" ? null : "none" }}>
                        <PracticeContactEntry />
                    </div>
                    <div style={currentTab === "pictures" ? null : {display:"none"} }>
                        <PracticePicturesForm />
                    </div>
                    <div style={{ display: currentTab === "availability" ? null : "none" }}>

                    </div>
                    <div style={{ display: currentTab === "settings" ? null : "none" }}>

                    </div>
                </div>

            </Modal>

        </FormContext.Provider>

    );
}

const HeaderTabs = ({
    handleTabClick,
    currentTab,
    selectedTabs
}) => {
    return (<>
        <h4>Practice Entry</h4>
        <div className="px-3">
            <div className="form-tabs">
                <div className="each-tab d-flex flex-row justify-content-center align-items-center">
                    <div className="mr-2 each-tab-content"
                        onClick={() => {
                            if(selectedTabs.includes("general")) handleTabClick("general",currentTab);
                        }}>
                        <div className={`tab-icon ${selectedTabs.includes("general") ? "tab-icon-active" : ""}`} ><i className="fas fa-user-nurse"></i></div>
                        <div className="tab-name">General</div>
                    </div>
                </div>
                <div className="each-tab d-flex flex-row justify-content-center align-items-center">
                    <div className={`h-line ${selectedTabs.includes("address") ? "h-line-active" : ""}`}></div>
                    <div className="each-tab-content" onClick={() => {
                        if(selectedTabs.includes("address")) handleTabClick("address",currentTab);
                    }}>
                        <div className={`tab-icon ${selectedTabs.includes("address") ? "tab-icon-active" : ""}`}><i className="far fa-address-card"></i></div>
                        <div className="tab-name">Address</div>
                    </div>
                </div>
                <div className="each-tab d-flex flex-row justify-content-center align-items-center">
                    <div className={`h-line ${selectedTabs.includes("contacts") ? "h-line-active" : ""}`}></div>
                    <div className="each-tab-content" onClick={() => {
                        if(selectedTabs.includes("contacts")) handleTabClick("contacts",currentTab);
                    }}>
                        <div className={`tab-icon ${selectedTabs.includes("contacts") ? "tab-icon-active" : ""}`}><i className="fas fa-phone"></i></div>
                        <div className="tab-name">Contact </div>
                    </div>
                </div>
                <div className="each-tab d-flex flex-row justify-content-center align-items-center">
                    <div className={`h-line ${selectedTabs.includes("pictures") ? "h-line-active" : ""}`}></div>
                    <div className="each-each-tab-content" onClick={() => {
                        if(selectedTabs.includes("pictures")) handleTabClick("pictures",currentTab);
                    }}>
                        <div className={`tab-icon ${selectedTabs.includes("pictures") ? "tab-icon-active" : ""}`}><i className="fas fa-images"></i></div>
                        <div className="tab-name">Pictures</div>
                    </div>
                </div>
                <div className="each-tab d-flex flex-row justify-content-center align-items-center">
                    <div className={`h-line ${selectedTabs.includes("availability") ? "h-line-active" : ""}`}></div>
                    <div className="each-tab-content" onClick={() => {
                        if(selectedTabs.includes("availability")) handleTabClick("availability",currentTab);
                    }}>
                        <div className={`tab-icon ${selectedTabs.includes("availability") ? "tab-icon-active" : ""}`}><i className="fas fa-user-clock"></i></div>
                        <div className="tab-name">Availability </div>
                    </div>
                </div>
                <div className="each-tab d-flex flex-row justify-content-center align-items-center">
                    <div className={`h-line ${selectedTabs.includes("settings") ? "h-line-active" : ""}`}></div>
                    <div className="each-tab-content" onClick={() => {
                        if(selectedTabs.includes("settings")) handleTabClick("settings",currentTab);
                    }}>
                        <div className={`tab-icon ${selectedTabs.includes("settings") ? "tab-icon-active" : ""}`}><i className="fas fa-cog"></i></div>
                        <div className="tab-name">Settings </div>
                    </div>
                </div>
            </div>
        </div>

    </>)
}

