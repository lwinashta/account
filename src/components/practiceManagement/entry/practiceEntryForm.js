import React, { useEffect, useState, useContext } from "react";
import { UserInfo } from "../../../contexts/userInfo";

import './practiceForm.css';

import { PracticeInformationEntry } from "./practiceInformationEntry";
import { PracticeAddressEntry } from "./practiceAddressEntry";
import { PracticePicturesEntry } from "./practicePicturesEntry";
import { PracticeContactEntry } from "./practiceContactEntry";
import { PracticeAvailabilityEntry } from "./practiceAvailabilityEntry";
import { PracticeSettingsEntry } from "./practiceSettingsEntry";
import { PracticeEntrySubmissionConfirmation } from "./practiceEntrySubmissionConfirmation";

import { saveNewPracticeUser } from "./../common/methods";
import { formjs } from "@oi/utilities/lib/js/form";

export const PracticeEntryForm = ({ afterSubmission = {} }) => {

    let entryFormContaineRef = React.createRef();
    let entryFormTabContentRef = React.createRef();

    let contextValues = useContext(UserInfo);

    //TabNames:
    //practice-general-info, practice-address, practice-pictures,practice-contact, practice-availability, practice-settings
    const [selectedTabs, setTabs] = useState(["practice-general-info"]);
    const [currentTab, setCurrentTab] = useState("");

    const [practiceEntryData, setPracticeEntryData] = useState({});

    const [showPracticeEntrySubmission, setShowPracticeEntrySubmission] = useState(false);

    const [goToConfirmationPage, setGotoConfirmationPage] = useState(false);

    useEffect(() => {
        setCurrentTab('practice-general-info');
        $(entryFormContaineRef.current).closest('.responsive-modal-body').css('overflow-y', 'inherit')
    }, []);

    const insertTabValue = (value) => {
        let tabs = [...selectedTabs];
        if (!(tabs.includes(value))) {
            tabs.push(value);
        }
        setTabs(tabs);
    }

    const setEntryData = (data) => {
        let _d = { ...practiceEntryData };
        _d = Object.assign(_d, data);
        console.log(_d);
        setPracticeEntryData(_d);
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
    const handlePracticeSubmission = () => {

        popup.onScreen("Saving Information...");
                    
        //Deconstruct the data 
        let {facilityFiles,availability_information,settings,...facilityInfo}=practiceEntryData;

        facilityInfo.registration_number = contextValues.userInfo.registration_number;
        facilityInfo["deleted.$boolean"] = false;
        facilityInfo["verified.$boolean"] = false;

        let facilityId = "";
        let facilityUserId = "";

        //Save the new Facility Information 
        handleNewFacilitySubmission(facilityInfo).then(r1=>{
            facilityId=r1;
            return saveNewPracticeUser(contextValues.userInfo._id, facilityId, availability_information,settings, "self");

        }).then(r2=>{
            facilityUserId=r2.insertedId;

            //Save Facility files 
            if (typeof facilityFiles!=="undefined" && Object.keys(facilityFiles).length>0) {
                return addNewFacilityFiles(facilityId,facilityFiles);//Promise afer all files are uploaded 
            }

        }).then(r3=>{
            return  $.getJSON('account/api/heathcarefacilityuser/get', {
                "_id": facilityUserId
            });

        }).then(r4=>{
            afterSubmission(r4);//Triggers the aftersubmission callback from parent componenet

        }).catch(err=>{
            console.error(err);
            popup.onBottomCenterErrorOccured();
        })

    }

    const handleNewFacilitySubmission = (data) => {
        let _formjs=new formjs();
        return new Promise((resolve, reject) => {

            //Save the facility Info .
            $.ajax({
                "url": '/account/api/heathcarefacility/create',
                "processData": false,
                "contentType": false,
                "data": _formjs.convertJsonToFormdataObject(data),
                "method": "POST"
            }).then(facility => {
                resolve(facility.insertedId);

            }).catch(err => {
                console.log(err);
                reject(err);
            });
        })
    }

    const addNewFacilityFiles = (linkedMongoId,facilityFiles) => {

        let files = facilityFiles;
        let fileData = new FormData();

        Object.keys(files).forEach(key => {
            fileData.append(key, files[key]);
        });

        fileData.append("linked_mongo_id", linkedMongoId);
        fileData.append("linked_db_name", "accounts");
        fileData.append("linked_collection_name", "healthcareFacilities");

        return $.ajax({
            "url": '/g/uploadfiles',
            "processData": false,
            "contentType": false,
            "data": fileData,
            "method": "POST"
        });
    }

    return (
        <UserInfo.Consumer>
            {({
                selectedPracticeInfo = {}
            }) => {
                return <div ref={entryFormContaineRef}>
                        <div className="mt-3 pb-3 border-bottom d-flex justify-content-center practice-form-container">
                            <div className="action-tab"
                                active={selectedTabs.indexOf('practice-general-info') > -1 ? "true" : "false"}>
                                <div className="tab-icon"><i className="fas fa-user-nurse"></i></div>
                                <div className="tab-name">General</div>
                            </div>
                            <div className="action-tab"
                                active={selectedTabs.indexOf('practice-address') > -1 ? "true" : "false"}>
                                <div className="tab-icon">
                                    <i className="far fa-address-card"></i>
                                </div>
                                <div className="tab-name">Address</div>
                            </div>
                            <div className="action-tab" active={selectedTabs.indexOf('practice-pictures') > -1 ? "true" : "false"}>
                                <div className="tab-icon">
                                    <i className="fas fa-images"></i>
                                </div>
                                <div className="tab-name">Pictures</div>
                            </div>
                            <div className="action-tab" active={selectedTabs.indexOf('practice-contact') > -1 ? "true" : "false"}>
                                <div className="tab-icon">
                                    <i className="fas fa-phone"></i>
                                </div>
                                <div className="tab-name">Contact</div>
                            </div>
                            <div className="action-tab" active={selectedTabs.indexOf('practice-availability') > -1 ? "true" : "false"}>
                                <div className="tab-icon">
                                    <i className="fas fa-user-clock"></i>
                                </div>
                                <div className="tab-name">Availability</div>
                            </div>
                            <div className="action-tab" active={selectedTabs.indexOf('practice-settings') > -1 ? "true" : "false"}>
                                <div className="tab-icon">
                                    <i className="fas fa-cog"></i>
                                </div>
                                <div className="tab-name">Settings</div>
                            </div>
                            <div className="action-tab" active={selectedTabs.indexOf('practice-submission') > -1 ? "true" : "false"}>
                                <div className="tab-icon">
                                    <i className="fas fa-check-circle"></i>
                                </div>
                                <div className="tab-name">Submit</div>
                            </div>
                        </div>

                        {/* {Tab Content} */}
                        <div ref={entryFormTabContentRef} id="practice-entry-tab-content-container">
                            <div className="p-3" style={{ display: currentTab === "practice-general-info" ? null : 'none' }}>
                                <PracticeInformationEntry
                                    selectedPracticeInfo={selectedPracticeInfo}
                                    onNextClick={!goToConfirmationPage?() => {
                                        setCurrentTab("practice-address");
                                        insertTabValue("practice-address");
                                    }:()=>{
                                        setCurrentTab("practice-submission");
                                        insertTabValue("practice-submission");
                                    }}
                                    setEntryData={setEntryData} />
                            </div>
                            <div className="p-3" style={{ display: currentTab === "practice-address" ? null : 'none' }}>
                                <PracticeAddressEntry
                                    selectedPracticeInfo={selectedPracticeInfo}
                                    onNextClick={!goToConfirmationPage?() => {
                                        setCurrentTab("practice-pictures");
                                        insertTabValue("practice-pictures");
                                    }:()=>{
                                        setCurrentTab("practice-submission");
                                        insertTabValue("practice-submission");
                                    }}
                                    onBackClick={() => {
                                        setCurrentTab("practice-general-info");
                                    }}
                                    setEntryData={setEntryData} />
                            </div>
                            <div className="p-3" style={{ display: currentTab === "practice-pictures" ? null : 'none' }}>
                                <PracticePicturesEntry
                                    selectedPracticeInfo={selectedPracticeInfo}
                                    onNextClick={!goToConfirmationPage?() => {
                                        setCurrentTab("practice-contact");
                                        insertTabValue("practice-contact");
                                    }:()=>{
                                        setCurrentTab("practice-submission");
                                        insertTabValue("practice-submission");
                                    }}
                                    onBackClick={() => {
                                        setCurrentTab("practice-address");
                                    }}
                                    setEntryData={setEntryData} />
                            </div>
                            <div className="p-3" style={{ display: currentTab === "practice-contact" ? null : 'none' }}>
                                <PracticeContactEntry
                                    selectedPracticeInfo={selectedPracticeInfo}
                                    onNextClick={!goToConfirmationPage?() => {
                                        setCurrentTab("practice-availability");
                                        insertTabValue("practice-availability");
                                    }:()=>{
                                        setCurrentTab("practice-submission");
                                        insertTabValue("practice-submission");
                                    }}
                                    onBackClick={() => {
                                        setCurrentTab("practice-pictures");
                                    }}
                                    setEntryData={setEntryData} />
                            </div>
                            <div className="p-3" style={{ display: currentTab === "practice-availability" ? null : 'none' }}>
                                <PracticeAvailabilityEntry
                                    selectedPracticeInfo={selectedPracticeInfo}
                                    onNextClick={!goToConfirmationPage?() => {
                                        setCurrentTab("practice-settings");
                                        insertTabValue("practice-settings");
                                    }:()=>{
                                        setCurrentTab("practice-submission");
                                        insertTabValue("practice-submission");
                                    }}
                                    onBackClick={() => {
                                        setCurrentTab("practice-contact");
                                    }}
                                    setEntryData={setEntryData} />
                            </div>

                            <div className="p-3" style={{ display: currentTab === "practice-settings" ? null : 'none' }}>
                                <PracticeSettingsEntry
                                    selectedPracticeInfo={selectedPracticeInfo}
                                    onNextClick={!goToConfirmationPage?() => {
                                        setShowPracticeEntrySubmission(true);
                                        setCurrentTab("practice-submission");
                                        insertTabValue("practice-submission");
                                        setGotoConfirmationPage(true);
                                    }:()=>{
                                        setCurrentTab("practice-submission");
                                        insertTabValue("practice-submission");
                                    }}
                                    onBackClick={() => {
                                        setCurrentTab("practice-availability");
                                    }}
                                    setEntryData={setEntryData} />
                            </div>

                            {
                                showPracticeEntrySubmission ?
                                    <div className="p-3" style={{ display: currentTab === "practice-submission" ? null : 'none' }}>
                                        <PracticeEntrySubmissionConfirmation
                                            practiceEntryData={practiceEntryData}
                                            setCurrentTab={setCurrentTab}
                                            onSubmission={handlePracticeSubmission}
                                            setEntryData={setEntryData} />
                                    </div> :
                                    null
                            }
                        </div>
                    </div>

            }}
        </UserInfo.Consumer>
    );
}
