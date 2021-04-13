import React, { useEffect, useState, useRef, useContext } from "react";

import { Modal } from "core/components/modal/web/modal";
import { uploadFilesToServer } from "fileManagement-module/lib/handlers";
import { form } from "form-module/form";
const countries = require('@oi/utilities/lists/countries.json');

import { AppContext } from "../../AppContext";
import { FormContext } from "./formContext";

const _iForm = new form();
_iForm.formConfig = require('account-manager-module/lib/practiceManagement/form/config.json');

import './practiceForm.css';
import { GeneralPracticeInfoForm } from "./subForms/generalPracticeInfoForm";
import { PracticeAddressForm } from "./subForms/practiceAddressForm";
import { PracticeContactForm } from "./subForms/practiceContactForm";
import { PracticePicturesForm } from './subForms/practicePicturesForm';
import { PracticeAvailabilityForm } from "./subForms/practiceAvailabilityForm";
import { PracticeSettingsForm } from "./subForms/practiceSettingsEntry";
import { ValidateAddress } from "./subForms/validateAddress";
import { AddressVerification } from "./../../../utils/addressVerification";

export const PracticeEntryForm = ({ 
    afterSubmission = function(){},
    onCloseHandler=function(){},
    practiceToUpdate=null,
}) => {
    
    const [selectedTabs, setTabs] = useState(["general"]);
    const [currentTab, setCurrentTab] = useState("general");
    const [validationErrors,setValidationErrors]=useState([]);
    const [validatedAddress, setValidatedAddress] = useState(null);

    let AppLevelContext=useContext(AppContext);

    let formValues = useRef(practiceToUpdate!==null?
        Object.assign(_iForm.getInitialFormObject(),practiceToUpdate) : _iForm.getInitialFormObject());

    const handleFormValues = (params) => {
        formValues.current = Object.assign(formValues.current, params);
        console.log(formValues.current);
    }

    const getFormValues=(key)=>{
        return formValues.current[key];
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

    const validateAddress = async () => {
        
        try {

            AppLevelContext.setOnScreenLoader({
                message:"Verifying Address",
                show:true
            });

            let addr = new AddressVerification({
                enteredAddress: {
                    addressStreet1: formValues.current.addressStreet1,
                    addressStreet2: formValues.current.addressStreet2,
                    city: formValues.current.city,
                    state: formValues.current.state,
                    zipCode: formValues.current.zipCode,
                    country: formValues.current.country.name,
                }
            });

            let response = await addr.init();

            //find if any of the address components is not match 
            console.log(response);
            formValues.current.validatedAddress = response;

            let isMatch = 0;
            Object.keys(response).forEach(key => {
                if (response[key] !== null && ("isMatch" in response[key]) && (!response[key].isMatch)) isMatch++;
            });

            AppLevelContext.removeOnScreenLoader();

            if (isMatch > 0) {
                setValidatedAddress(response);

            } else {
                handleAddressVerification(response,true);//the address is total match
                submitPracticeInformation();//submit the information to server

            }

        } catch (error) {
            AppLevelContext.removeOnScreenLoader();

            if(error==="invalid_address"){
                alert("Address you have entered is invalid. Please ");
                handleTabClick("address","settings");
            }
            console.log(error);
        }

    }

    const handleAddressVerification=(validatedAddress, clickedRecommended)=>{
        
        if(!clickedRecommended){
            handleFormValues({
                cordinates:[validatedAddress.cordinates.lng, validatedAddress.cordinates.lat]
            });

        }else{
            handleFormValues({
                addressStreet1:validatedAddress.addressStreet1.text,
                addressStreet2:validatedAddress.addressStreet2!==null?validatedAddress.addressStreet2.text:null,
                city:validatedAddress.city.text,
                state:validatedAddress.state.text,
                zipCode:validatedAddress.zipCode.text,
                country:countries.find(c=>c._id===validatedAddress.country._id),
                cordinates:[validatedAddress.cordinates.lng, validatedAddress.cordinates.lat]
            });
        }

        setValidatedAddress(null);
        submitPracticeInformation();
    }

    /**
     * 
     * @Submission Execution Flow: 
     * 1. Verify the data again
     * 2. If data check is successfull, start the loader 
     * 3. Deconstruct the data
     * 4. Save facility information
     * 5. Save Facility User Information
     * 6. Save Facility Files
     * 7. Get the Facility Info from server 
     * 8. Set the Facility Info as Practice Info for the User
     * 9. Stop Loader
     */

    const submitPracticeInformation = async() => {
        
        try {

            console.log(formValues.current);

            //validation check - validate all data again 
            let _d = _iForm.validateForm(formValues.current);

            if (_d.length > 0) {
                alert("Please enter required information");

            } else {

                AppLevelContext.setOnScreenLoader({
                    message:"Saving Practice Information",
                    show:true
                });
                
                //decontruct the data 
                //availability, pictures, ownerShipPictures, is attached to user 
                let { availability, pictures, ownershipPictures, ...practiceData } = formValues.current;
                
                ///console.log(availability, pictures, ownershipPictures,practiceData);

                //Save facility data
                let facilityInfo=await saveMedicalFacilityInfo(practiceData);
                if(!facilityInfo.ok) throw "error_in_saving_facilityinfo";

                facilityInfo=await facilityInfo.json();

                //Save facility User
                let facilityProvider=await saveMedicalProvider({
                    "availability":availability,
                    "facilityId.$_id":facilityInfo._id,
                    "userMongoId.$_id":AppLevelContext.userInfo._id,
                    "deleted.$boolean":false
                });

                if(!facilityProvider.ok) throw "error_in_saving_facilityprovider";

                facilityProvider=await facilityProvider.json();

                //check if there are any new pictures 
                let facilityPictures=pictures.filter(p=>!("_id" in p));
                if(facilityPictures.length>0){
                    let uploadFacilityFiles = await uploadFilesToServer(facilityPictures,{
                        linkedMongoId:facilityInfo._id,
                        linkedDatabaseName: "accounts",
                        linkedCollectionName: "medicalFacilities",
                        fieldName:"medicalFacilityPictures"
                    });
                }

                let facilityOwnershipFiles=ownershipPictures.filter(p=>!("_id" in p));
                if(facilityOwnershipFiles.length>0){
                    let uploadFacilityOwnershipFiles = await uploadFilesToServer(facilityOwnershipFiles,{
                        linkedMongoId:facilityInfo._id,
                        linkedDatabaseName: "accounts",
                        linkedCollectionName: "medicalFacilities",
                        fieldName:"medicalFacilityOwnership"
                    });
                }

                //Get the 
                
            }
        } catch (error) {
            AppLevelContext.removeOnScreenLoader();
            console.log(error);
        }
    }

    const saveMedicalFacilityInfo=(data)=>{
        let uri='/account/api/practice/medicalfacility/create';
        if("_id" in data) uri='/account/api/practice/medicalfacility/update';

        return fetch(uri,{
            method:"POST",
            body:JSON.stringify(data),
            headers:{
                "content-type": "application/json"
            }
        });
    }

    const saveMedicalProvider=(data)=>{
        let uri='/account/api/practice/medicalprovider/create';
        if("_id" in data) uri='/account/api/practice/medicalprovider/update';

        return fetch(uri,{
            method:"POST",
            body:JSON.stringify(data),
            headers:{
                "content-type": "application/json"
            }
        });
    }

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
                getFormValues:getFormValues,
                validationErrors: validationErrors,
                displayValidationError:displayValidationError,
                setDefaultValueForFields:setDefaultValueForFields,
                submitPracticeInformation:submitPracticeInformation
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
                        <PracticeContactForm />
                    </div>
                    <div style={currentTab === "pictures" ? null : {display:"none"} }>
                        <PracticePicturesForm />
                    </div>
                    <div style={{ display: currentTab === "availability" ? null : "none" }}>
                        <PracticeAvailabilityForm />
                    </div>
                    <div style={{ display: currentTab === "settings" ? null : "none" }}>
                        <PracticeSettingsForm 
                            validateAddress={validateAddress} />
                    </div>
                </div>

            </Modal>

            {
                validatedAddress !==null ?
                    <ValidateAddress 
                        enteredAddress={formValues.current}
                        validatedAddress={validatedAddress} 
                        onSubmission={handleAddressVerification}/>:
                    null
            }
            
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

