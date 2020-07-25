import React, { useEffect, useState, useContext } from 'react';
import { UserInfo } from "../../contexts/userInfo";
import { PracticeEntryForm } from "./practiceEntryForm";
import { PracticeSettingsForm } from "./practiceSettingsForm";
import { Modal, ConfirmationBox} from "@oi/reactcomponents";
import {ShowAvailability, 
        DisplayPracticeAddress,
        DisplayPracticeContact,
        DisplayPracticeTypes } from "@oi/reactcomponents/provider-practice";
import { DisplayPracticeFiles,
        DisplayPracticeVerification,
        DisplayPracticeUserVerification} from "./displayComponents";
import {AffliatePracticeForm} from './affiliatePracticeForm';

export const App = () => {

    const [userInfo, setUserInfo] = useState({});
    const [userPractices, setUserPractices] = useState([]);
    const [appLoader, setAppLoader] = useState(true);
    
    const [showPracticeEntryForm, setShowPracticeEntryFormFlag] = useState(false);
    const [showPracticeSettingsEntryForm, setShowPracticeSettingsEntryFormFlag] = useState(false);
    const [facilityTypes, setFacilityType] = useState([]);

    const [showAffiliationEntryForm, setAffiliationEntryFormFlag]=useState(false);

    const [selectedPracticeId, setSelectedPracticeId] = useState("");
    const [selectedPracticeInfo, setSelectedPracticeInfo] = useState({});

    const [showSelectedPracticeDetails, setShowPracticeDetailsFlag] = useState(false);
    const [showDeleteConfirmationBox, setDeleteConfirmationBoxFlag]=useState(false);
    
    const detailsModalRef=React.createRef();

    //On Load 
    useEffect(() => {
        //Get data
        
        Promise.all([getUserInfo(),getFacilityTypes()]).then(response => {
            
            //console.log(response);
            setUserInfo(response[0]);
            setFacilityType(response[1]);

            return getUserPractices(response[0]._id);

        }).then(practiceResponse => {
            console.log(practiceResponse);
            setUserPractices(practiceResponse);
            setAppLoader(false);            

        });

    }, []);

    useEffect(()=>{
        if(!appLoader){
            $('#practice-management-container').find('.has-dropdown-menu').hideOffFocus();
        }
    },[appLoader])

    useEffect(()=>{
        $(detailsModalRef.current).find('.tab').tab();
        $(detailsModalRef.current).find('.tab[showel="pop-practice-details"]').trigger('click');
    },[showSelectedPracticeDetails]);

    useEffect(()=>{
        if(!showSelectedPracticeDetails && !showPracticeEntryForm && !showDeleteConfirmationBox && !showPracticeSettingsEntryForm){
            setSelectedPracticeId("");
            setSelectedPracticeInfo({});
        }
    },[showSelectedPracticeDetails,showPracticeEntryForm,showDeleteConfirmationBox,showPracticeSettingsEntryForm]);

    /** Get Data ***/
    const getUserInfo = () => {
        return $.post('/account/api/user/verifytoken')
    }

    const getFacilityTypes=()=>{
        return $.getJSON('healthcare/api/facilities/getAll');
    }

    const getUserPractices = (userId) => {

        return $.ajax({
            "url": '/account/api/heathcarefacilityuser/getbyuserid',
            "processData": true,
            "contentType": "application/json; charset=utf-8",
            "data": {
                "user_mongo_id": userId
            },
            "method": "GET"
        });
    }

    /** Handle Events ***/
    const handlePracticeDetailsEdit = (_id) => {
        setSelectedPracticeId(_id);
        setSelectedPracticeInfo(userPractices.filter(p => p._id === _id)[0]);
        setShowPracticeEntryFormFlag(true);
    }

    const handlePracticeSettingsEdit=(_id)=>{
        setSelectedPracticeId(_id);
        setSelectedPracticeInfo(userPractices.filter(p => p._id === _id)[0]);
        setShowPracticeSettingsEntryFormFlag(true);
    }

    const handleViewPracticeDetails = (_id) => {

        //get practice info
        setSelectedPracticeId(_id);
        setSelectedPracticeInfo(userPractices.filter(p => p._id === _id)[0]);
        setShowPracticeDetailsFlag(true);

    }

    const handleAfterPracticeSubmission=(data)=>{
        let _d=[...userPractices];
        if(Object.keys(selectedPracticeInfo).length>0){
            //update mode 
            let indx=_d.findIndex(p=>p._id===selectedPracticeInfo._id);
            _d[indx]=data[0];
        }else{
            //create mode 
            _d.splice(0,0,data[0]);
        }

        setUserPractices(_d);
        setShowPracticeEntryFormFlag(false);
        setAffiliationEntryFormFlag(false);

        popup.onBottomCenterSuccessMessage("Practice Saved");
    }

    const handleAfterPracticeSettingSubmission=(data)=>{
        let _d=[...userPractices];
        
        if(Object.keys(selectedPracticeInfo).length>0){
            //update mode 
            let indx=_d.findIndex(p=>p._id===selectedPracticeInfo._id);
            console.log(indx);
            if('settings' in _d[indx]){
                _d[indx].settings=Object.assign(_d[indx].settings,data.settings);
            }else{
                _d[indx].settings=data.settings;
            }

            console.log(_d[indx]);
        }

        //console.log(_d);

        setUserPractices(_d);
        setShowPracticeSettingsEntryFormFlag(false);

        popup.onBottomCenterSuccessMessage("Practice Settings Saved");
    }

    const handlePracticeDeletion=(_id)=>{
        setSelectedPracticeId(_id);
        setSelectedPracticeInfo(userPractices.filter(p => p._id === _id)[0]);
        setDeleteConfirmationBoxFlag(true);
    }

    const deletePractice=()=>{
        popup.onScreen("Deleting ...");
        console.log(selectedPracticeId);
        $.ajax({
            "url": '/account/api/heathcarefacilityuser/update',
            "data": JSON.stringify({
                "_id":selectedPracticeId,
                "deleted.$boolean":true
            }),
            "processData": false,
            "contentType": "application/json; charset=utf-8",
            "method": "POST"
        }).then(deleteResponse=>{

            //Update the userPractice 
            let indx=userPractices.findIndex(p => p._id === selectedPracticeId);
            let allPractices=[...userPractices];

            allPractices.splice(indx,1);

            setUserPractices(allPractices);

            popup.remove();
            popup.onBottomCenterSuccessMessage("Practice Deleted");

            setDeleteConfirmationBoxFlag(false);
        });
    }

    const handleAddNewPracticeEntry=()=>{
        setAffiliationEntryFormFlag(false);
        setShowPracticeEntryFormFlag(true);
    }

    /** Layout */
    return (
        <UserInfo.Provider value={{
            userInfo: userInfo,
            userPractices: userPractices,
            selectedPracticeId:selectedPracticeId,
            selectedPracticeInfo:selectedPracticeInfo,
            facilityTypes:facilityTypes
        }}>{
                appLoader ?
                    <div className="mt-2 p-2 text-center">
                        <img src="/efs/core/images/core/loading.gif" style={{ width: "40px" }}></img>
                    </div> :
                    <div id="practice-management-container" className="container-fluid mt-3">
                        <div className="position-relative mb-3">
                            <h4>My Practices</h4>
                            <div className="push-right t-0 ">
                                <div className="has-dropdown-menu">
                                    <div className="pointer mb-2 align-middle pl-2 pr-2 pt-1 pb-1 border rounded show-menu-on-click bg-white">
                                        <i className="fas fa-clinic-medical align-middle"></i>
                                        <span className="small ml-2">Add Practice</span>
                                    </div>
                                    <div className="dropdown-menu-container hide-off-focus-inner-container rounded shadow" position="right">
                                        <div className="mt-2 p-2 border-bottom bg-grey-on-hover dropdown-item pointer" 
                                        onClick={() => { setShowPracticeEntryFormFlag(true) }}>
                                            <i className="fas fa-user-nurse align-middle"></i>
                                            <span className="small ml-2">New Practice</span>
                                        </div>
                                        <div className="p-2 border-bottom bg-grey-on-hover dropdown-item pointer" 
                                            onClick={() => { setAffiliationEntryFormFlag(true) }}>
                                            <i className="fas fa-clinic-medical align-middle"></i>
                                            <span className="small ml-2">Affiliate to Practice</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {
                            userPractices.length > 0 ?
                                <div>
                                    {
                                        userPractices.map((practice, indx) => {
                                            let facilityInfo = practice.facilityInfo[0];
                                            return <div key={practice._id}
                                                className="bg-white p-2 border rounded position-relative mt-2 mb-2" >
                                                <div>
                                                    <div className="pb-1 border-bottom">{facilityInfo.medical_facility_name}</div>
                                                    <div className="small mt-2 pb-1 border-bottom">
                                                        <DisplayPracticeVerification verified={facilityInfo.verified} />
                                                        <DisplayPracticeUserVerification verified={practice.verified} />
                                                    </div>
                                                    <div className="small mt-2">
                                                        {"medical_facility_description" in facilityInfo && facilityInfo.medical_facility_description.length>0?<div className="mt-1 mb-1 pb-1 border-bottom">{facilityInfo.medical_facility_description}</div>:""}
                                                        <div className="text-muted">
                                                            <DisplayPracticeAddress address={facilityInfo} />
                                                        </div>
                                                        <div className="mt-2 pb-1">
                                                            <DisplayPracticeTypes 
                                                                types={facilityInfo.medical_facility_type} 
                                                                facilityTypes={facilityTypes} />
                                                        </div>
                                                        <div className="mt-2 mb-2">
                                                            <DisplayPracticeFiles files={facilityInfo.files} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="push-right d-flex">
                                                    <div className="pointer btn-tooltip p-1" tip="View All Details" onClick={() => handleViewPracticeDetails(practice._id)}>
                                                        <i className="fas fa-info-circle"></i>
                                                    </div>
                                                    <div className="pointer btn-tooltip ml-3 p-1" tip="Edit Practice Details" onClick={() => { handlePracticeDetailsEdit(practice._id) }}>
                                                        <i className="far fa-edit"></i>
                                                    </div>
                                                    <div className="pointer btn-tooltip ml-3 p-1" tip="Edit Practice Settings" onClick={() => { handlePracticeSettingsEdit(practice._id) }}>
                                                        <i className="fas fa-cog"></i>
                                                    </div>
                                                    <div className="pointer btn-tooltip text-danger ml-3 p-1" tip="Delete Practice" onClick={() => { handlePracticeDeletion(practice._id) }}>
                                                        <i className="far fa-trash-alt"></i>
                                                    </div>
                                                </div>
                                            </div>
                                        })
                                    }
                                </div> :
                                <div className="text-center">
                                    <div>
                                        <i className="fas fa-clinic-medical" style={{ fontSize: "3em" }}></i>
                                    </div>
                                    <div className="mt-2 text-muted">
                                        No practices found for your profile.
                                    <div className="btn-primary p-2 small rounded d-inline-block">
                                            <i className="fas fa-plus"></i>
                                            <span className="ml-2">Add New Practice</span>
                                        </div>
                                    </div>
                                </div>
                        }

                        {
                            showSelectedPracticeDetails ?
                            <Modal header={<h3>Practice Details</h3>} onCloseHandler={() => { setShowPracticeDetailsFlag(false) }}>
                                    <div className="tab-parent-container" ref={detailsModalRef}>
                                        <div className="d-flex pt-2 pb-2 font-weight-bold text-secondary">
                                            <div className="tab mr-4" showel="pop-practice-details"><i className="fas fa-info-circle mr-2"></i><span>Details</span></div>
                                            <div className="tab mr-4" showel="pop-practice-settings"><i className="fas fa-cog mr-2"></i><span>Settings</span></div>
                                        </div>
                                        <div className="tab-content-container mt-4">
                                            <div className="tab-content position-relative" id="pop-practice-details">
                                                <div className="d-flex push-right">
                                                    <div className="small pointer mr-2 btn-link" onClick={() => { handlePracticeDetailsEdit(selectedPracticeInfo._id) }}>Edit</div>
                                                </div>
                                                <div className="mt-2">
                                                    <h4>{selectedPracticeInfo.facilityInfo[0].medical_facility_name}</h4>
                                                    <div className="mt-1 mb-1">{"medical_facility_description" in selectedPracticeInfo.facilityInfo[0] && selectedPracticeInfo.facilityInfo[0].medical_facility_description.length>0?selectedPracticeInfo.facilityInfo[0].medical_facility_description:""}</div>
                                                    <div className="text-muted">
                                                        <DisplayPracticeAddress address={selectedPracticeInfo.facilityInfo[0]} />
                                                    </div>
                                                    <div className="mt-2 small">
                                                        <DisplayPracticeTypes 
                                                            types={selectedPracticeInfo.facilityInfo[0].medical_facility_type} 
                                                            facilityTypes={facilityTypes} />
                                                    </div>
                                                </div>
                                                <div className="mt-3">
                                                    <div className="font-weight-bold">Contact Information: </div>
                                                    <div className="mt-1 small">
                                                        <DisplayPracticeContact contacts={selectedPracticeInfo.facilityInfo[0].medical_facility_contact_information} />
                                                    </div>
                                                </div>
                                                <div className="mt-3">
                                                    <div className="font-weight-bold">Files:</div>
                                                    <div className="ml-2">
                                                        <DisplayPracticeFiles files={selectedPracticeInfo.facilityInfo[0].files} />
                                                    </div>
                                                </div>
                                                <div className="mt-3">
                                                    <div className="font-weight-bold">Availability:</div>
                                                    <div className="mt-2 ml-2 small">
                                                        <ShowAvailability availability={selectedPracticeInfo.availability_information} />
                                                    </div>
                                                </div>

                                            </div>
                                            <div className="tab-content position-relative" id="pop-practice-settings">
                                                <div className="border-bottom ">
                                                    <h4>Appointment Settings:</h4>
                                                    <div className="d-flex push-right">
                                                        <div className="small pointer mr-2 btn-link">Edit</div>
                                                    </div>
                                                    <div className="mt-2 border-bottom  pt-2 pb-2">
                                                        <div className="font-weight-bold">Appointment Slot:</div>
                                                        <div className="text-muted">Appointment slot gap are set to 15 minutes</div>
                                                    </div>
                                                    <div className="mt-2 pt-2 pb-2">
                                                        <div className="font-weight-bold">Allowed Appointment Booking Types:</div>
                                                        <div className="text-muted">Video Consultation, In Person Consultation, On Call Consultation</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </Modal> : null
                        }

                        {
                            showDeleteConfirmationBox?
                            <ConfirmationBox>
                                <h4>Delete Confirmation</h4>
                                <div>
                                    Are you sure to delete <b>{selectedPracticeInfo.facilityInfo[0].medical_facility_name}</b> practice?
                                    <div className="text-muted small">Deleting the practice will remove practice to be displayed in the searhc results and user will no longer able to book appointments or view your practice.</div>
                                </div>
                                <div className="text-right mt-2">
                                    <div className="d-inline-block btn btn-danger btn-sm pointer" onClick={()=>{deletePractice()}}> Yes</div>
                                    <div className="d-inline-block btn btn-link btn-sm ml-2 pointer" onClick={()=>{setDeleteConfirmationBoxFlag(false)}}> No</div>
                                </div>
                            </ConfirmationBox>:null
                        }

                        {
                            showPracticeSettingsEntryForm ? 
                            <Modal
                                header={<h3>Practice Settings</h3>}
                                onCloseHandler={() => { setShowPracticeSettingsEntryFormFlag(false) }}>
                                <PracticeSettingsForm afterSubmission={handleAfterPracticeSettingSubmission} />
                            </Modal> : null
                        }

                        {
                            showPracticeEntryForm ? 
                            <Modal
                                header={<h3>Practice Entry</h3>}
                                onCloseHandler={() => { setShowPracticeEntryFormFlag(false) }}>
                                <PracticeEntryForm afterSubmission={handleAfterPracticeSubmission}/>
                            </Modal> : null
                        }

                        {
                            showAffiliationEntryForm ? 
                            <Modal
                                header={<h3>Affiliate Yourself to Practice</h3>}
                                onCloseHandler={() => { setAffiliationEntryFormFlag(false) }}>
                                <AffliatePracticeForm 
                                    handleAddNewPracticeEntry={handleAddNewPracticeEntry} 
                                    afterSubmission={handleAfterPracticeSubmission} />
                            </Modal> : null
                        }

                    </div>

            }
        </UserInfo.Provider>
    );
} 