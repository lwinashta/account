import React, { useEffect, useState, useRef, useContext } from "react";

import { Modal } from "core/components/modal/web/modal";
import { uploadFilesToServer } from "fileManagement-module/lib/handlers";
import { form } from "form-module/form";
const countries = require('@oi/utilities/lists/countries.json');
import { constructAddress } from "@oi/utilities/lib/ui/utils";

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
import { ValidateAddress } from "./subForms/validateAddressPopup";
import { AddressVerification } from "./../../../utils/addressVerification";

import * as handlers from './handlers';
import { getFacilityProviderDataFromServer } from "../handlers"; 
import { InReviewItems } from "../display/inReviewItems";

export const PracticeEntryForm = ({ 
    afterSubmission = function(){},
    onCloseHandler=function(){},
    practiceToUpdate=null,
}) => {
    
    const [selectedTabs, setTabs] = useState(practiceToUpdate!==null && (practiceToUpdate.verificationState==="in_review" || practiceToUpdate.verificationState==="approved")?
                ["in_review","pictures","availability","settings"]:
            practiceToUpdate!==null && practiceToUpdate.verificationState==="in_edit_mode"?
                ["general","address","contacts","pictures","availability","settings"]:
            ["general"]);
    const [currentTab, setCurrentTab] = useState(practiceToUpdate!==null && practiceToUpdate.verificationState==="in_edit_mode"?"general":"in_review");
    const [validationErrors,setValidationErrors]=useState([]);
    const [validatedAddress, setValidatedAddress] = useState(null);

    let AppLevelContext=useContext(AppContext);

    let formValues = useRef(practiceToUpdate!==null?
        Object.assign(_iForm.getInitialFormObject(),{...practiceToUpdate}) : _iForm.getInitialFormObject());

    const handleFormValues = (params) => {
        formValues.current = Object.assign(formValues.current, params);
        console.log(formValues.current);
    }

    const getFormValues=(key)=>{
        return formValues.current[key];
    }

    /*** Form Validation  */
    const validateEntriesOnCurrentTab=(tabName)=>{
        
        let fieldConfigs=_iForm.formConfig.filter(i=>i.tabName===tabName);
        let _d=[];
        
        fieldConfigs.forEach(config => {
            let validation=_iForm.validateEachEntry(formValues.current[config.name],config,formValues.current);
            validation!==null?_d.push(validation):null;
        });

        return _d;
    }

    const displayValidationError=(fieldName)=>{
        return _iForm.validationErrors.length > 0 ?
            _iForm.displayValidationError(fieldName) : null
    }

    /** Handle Tab click */
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


    const setDefaultValueForFields = (fieldName) => {
        return (practiceToUpdate !== null
            && (fieldName in practiceToUpdate)) ?
            practiceToUpdate[fieldName] : null
    }

    const handleSubmissionPreWorkflow = () => {

        try {
            //check if practice to be updated 

            //If practice to be updated. 
            //Check if Address has been changed 
            if (practiceToUpdate !== null && constructAddress(practiceToUpdate) === constructAddress(formValues.current)) {
                throw "address_not_updated";

            //If practice need to be updated and address was updated then validate the address
            //OR its new entry where practiceToUpdate is null
            }else if((practiceToUpdate!==null 
                    && constructAddress(practiceToUpdate) !== constructAddress(formValues.current)) 
                    || practiceToUpdate===null){
                validateAddress();//its async function but we are not waiting for response here

            }

        } catch (error) {
            if(error==="address_not_updated"){
                submitPracticeInformation();//submit the information to server
            }
        }

    }

    /** Verify the entered address with the address from google api
     *  If it an update mode, check if address was updated. If not, no need to verify the address
     */
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
                handleOnAddressVerification(response,true);//the address is total match
                submitPracticeInformation();//submit the information to server

            }

        } catch (error) {

            console.log(error);
            AppLevelContext.removeOnScreenLoader();

            if(error==="invalid_address"){
                alert("Address you have entered is invalid. Please ");
                handleTabClick("address","settings");

            }
        }

    }

    const handleOnAddressVerification=(validatedAddress, clickedRecommended)=>{
        
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

    /**
     * @noInputs
     * @returns 
     */
    const deconstructData = () => {
        let dataToSubmit = {};

        if (practiceToUpdate !== null) {

            //map all the values from the formconfig and remove all other dat
            dataToSubmit = _iForm.formConfig.reduce((acc, ci) => {
                acc[ci.name] = formValues.current[ci.name];
                return acc;
            }, {});

            dataToSubmit._id=practiceToUpdate._id;

        } else {
            dataToSubmit = formValues.current;
            dataToSubmit.verificationState = "in_edit_mode";
            dataToSubmit["verificationStateTransitions.$object"] = [{
                "fromState":null,
                "toState":"in_edit_mode",
                "transitionDate.$date":new Date()
            }];
        }

        //decontruct the data 
        //availability, pictures, ownerShipPictures, is attached to user 
        let { availability, pictures, validatedAddress, ownershipPictures, ...practiceData } = dataToSubmit;

        return { availability:availability, pictures:pictures, ownershipPictures:ownershipPictures, practiceData:practiceData };  
    }

    /**
     * 
     * @param {*} data 
     * @param {*} facilityId 
     * @returns 
     */
    const constructProviderData=(data,facilityId)=>{
        //Save facility User
        let providerData={};

        if(practiceToUpdate!==null){
            providerData.availability=data.availability;
            providerData._id=practiceToUpdate.facilityProviderId;

        }else{
            providerData={
                "availability":data.availability,
                "facilityId.$_id":facilityId,
                "userMongoId.$_id":AppLevelContext.userInfo._id,
                "deleted.$boolean":false
            };
        }

        return providerData;
    }

    /**
     * Submit Practice Information
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

                let deconstructedData=deconstructData();

                console.log(deconstructedData);
                
                //** Saving Facility Info */
                let facilityInfo=await handlers.saveMedicalFacilityInfo(deconstructedData.practiceData);
                if(!facilityInfo.ok) throw "error_in_saving_facilityinfo";

                facilityInfo=await facilityInfo.json();

                let facilityId=practiceToUpdate!==null?practiceToUpdate._id:facilityInfo._id;

                 //** Saving Facility Provider Info */
                let facilityProvider=await handlers.saveMedicalProvider(constructProviderData(deconstructedData,facilityId));
                if(!facilityProvider.ok) throw "error_in_saving_facilityprovider";

                facilityProvider=await facilityProvider.json();

                //** Saving Facility Pictures */
                //check if there are any new pictures 
                let facilityPictures=deconstructedData.pictures.filter(p=>!("_id" in p));
                if(facilityPictures.length>0){
                    let uploadFacilityFiles = await uploadFilesToServer(facilityPictures,{
                        linkedMongoId:facilityId,
                        linkedDatabaseName: "accounts",
                        linkedCollectionName: "medicalFacilities",
                        fieldName:"medicalFacilityPictures"
                    });
                }

                //** Saving Facility Ownership Proof Pictures */
                let facilityOwnershipFiles=deconstructedData.ownershipPictures.filter(p=>!("_id" in p));
                if(facilityOwnershipFiles.length>0){
                    let uploadFacilityOwnershipFiles = await uploadFilesToServer(facilityOwnershipFiles,{
                        linkedMongoId:facilityId,
                        linkedDatabaseName: "accounts",
                        linkedCollectionName: "medicalFacilities",
                        fieldName:"medicalFacilityOwnership"
                    });
                }

                //** Get the faciltyProvider info from server
                let info=await getFacilityProviderDataFromServer({
                    "_id.$_id":practiceToUpdate!==null?practiceToUpdate.facilityProviderId:facilityProvider._id
                });

                let responseData=await info.json();

                afterSubmission(responseData.pop());//send first element of the data
                
                AppLevelContext.removeOnScreenLoader();//removes the loader

                AppLevelContext.setPopup({
                    "show":true,
                    "message":"Practice information saved",
                    "messageType":"success"
                });

                onCloseHandler();//closes the form
                
            }
        } catch (error) {
            AppLevelContext.removeOnScreenLoader();
            console.log(error);
        }
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
                submitPracticeInformation:submitPracticeInformation,
                handleSubmissionPreWorkflow:handleSubmissionPreWorkflow
            }
        }>
            
            <Modal
                onCloseHandler={()=>{onCloseHandler(false)}}
                headerHeight={100}
                header={<HeaderTabs
                    practiceToUpdate={practiceToUpdate}
                    selectedTabs={selectedTabs}
                    currentTab={currentTab}
                    handleTabClick={handleTabClick} />}>

                <div className="px-2 mt-2">
                    {
                        practiceToUpdate!==null && (practiceToUpdate.verificationState==="in_review" || practiceToUpdate.verificationState==="approved")?
                        <div style={currentTab === "in_review" ? null : { display: "none" }}>
                            <InReviewItems facilityInfo={practiceToUpdate} />
                        </div>:
                            <>
                                <div style={currentTab === "general" ? null : { display: "none" }}>
                                    <GeneralPracticeInfoForm />
                                </div>
                                <div style={currentTab === "address" ? null : { display: "none" }}>
                                    <PracticeAddressForm />
                                </div>
                                <div style={{ display: currentTab === "contacts" ? null : "none" }}>
                                    <PracticeContactForm />
                                </div>
                            </>
                    }
                    <div style={currentTab === "pictures" ? null : { display: "none" }}>
                        <PracticePicturesForm />
                    </div>
                    <div style={{ display: currentTab === "availability" ? null : "none" }}>
                        <PracticeAvailabilityForm />
                    </div>
                    <div style={{ display: currentTab === "settings" ? null : "none" }}>
                        <PracticeSettingsForm />
                    </div>
                    
                </div>

            </Modal>

            {
                validatedAddress !==null ?
                    <ValidateAddress 
                        enteredAddress={formValues.current}
                        validatedAddress={validatedAddress} 
                        onSubmission={handleOnAddressVerification}/>:
                    null
            }
            
        </FormContext.Provider>

    );
}

const HeaderTabs = ({
    practiceToUpdate=null,
    handleTabClick,
    currentTab,
    selectedTabs
}) => {

    return (<>
        <h4>Practice Entry</h4>
        <div className="px-3">
            <div className="form-tabs">
                {
                    practiceToUpdate!==null && (practiceToUpdate.verificationState==="in_review" || practiceToUpdate.verificationState==="approved")?
                        <div className="each-tab d-flex flex-row justify-content-center align-items-center">
                            <div className="mr-2 each-tab-content"
                                onClick={() => {
                                    if(selectedTabs.includes("in_review")) handleTabClick("in_review",currentTab);
                                }}>
                                <div className={`tab-icon ${selectedTabs.includes("in_review") ? "tab-icon-active" : ""}`} ><i className="fas fa-glasses"></i></div>
                                <div className="tab-name">In Review</div>
                            </div>
                        </div>:
                        <>
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
                        </>
                }
                
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

