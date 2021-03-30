import React, { useEffect, useState, useContext } from 'react';
import { UserInfo } from "../../contexts/userInfo";
import { PracticeEntryForm } from "./entry/practiceEntryForm";
import { Modal, ConfirmationBox} from "@oi/reactcomponents";
import { DisplayEachPractice } from "./display/displayEachPractice";
import {AffliatePracticeForm} from './entry/affiliatePracticeForm';

export const App = () => {

    const [userInfo, setUserInfo] = useState({});
    const [userPractices, setUserPractices] = useState([]);
    const [appLoader, setAppLoader] = useState(true);
    
    const [showPracticeEntryForm, setShowPracticeEntryFormFlag] = useState(false);
    const [facilityTypes, setFacilityType] = useState([]);

    const [showAffiliationEntryForm, setAffiliationEntryFormFlag]=useState(false);

    const [selectedPracticeId, setSelectedPracticeId] = useState("");
    const [selectedPracticeInfo, setSelectedPracticeInfo] = useState({});

    const [showDeleteConfirmationBox, setDeleteConfirmationBoxFlag]=useState(false);
    
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
        if(!showDeleteConfirmationBox){
            setSelectedPracticeId("");
            setSelectedPracticeInfo({});
        }
    },[showDeleteConfirmationBox]);

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

    //Updatinf the Facility Information 
    const updateFacilityStateInfo=(data)=>{
        let _d=[...userPractices];

        //Find the index of the facility inside the facilityUser data 
        let indx=_d.findIndex(p=>p.facilityInfo[0]._id===data._id);
        
        //Deconstructing _id from data
        let {_id,..._de}=data;  

        //Assinging the updates
        //Index =0 is the only index for the each data  
        _d[indx].facilityInfo[0]=Object.assign(_d[indx].facilityInfo[0],_de);

        setUserPractices(_d);
    }

    //Updatinf the Facility Information 
    const updateFacilityUserInfo=(data)=>{
        let _d=[...userPractices];

        //Find the index of the facility inside the facilityUser data 
        let indx=_d.findIndex(p=>p._id===data._id);
        
        //Deconstructing _id from data
        let {_id,..._de}=data;  

        //Assinging the updates
        //Index =0 is the only index for the each data  
        _d[indx]=Object.assign(_d[indx],_de);

        setUserPractices(_d);
    }

    /** Layout */
    return (
        <UserInfo.Provider value={{
            userInfo: userInfo,
            userPractices: userPractices,
            updateFacilityStateInfo:updateFacilityStateInfo,
            updateFacilityUserInfo:updateFacilityUserInfo,
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
                                            return <DisplayEachPractice practice={practice}  key={practice._id} />
                                        })
                                    }
                                </div> :
                                <div className="text-center">
                                    <div>
                                        <i className="fas fa-clinic-medical" style={{ fontSize: "3em" }}></i>
                                    </div>
                                    <div className="mt-2 text-muted">
                                        <div>No practices found for your profile.</div>
                                        <div className="d-flex justify-content-center mt-2">
                                            <div className="pointer btn-sm btn-primary p-2" onClick={() => { setShowPracticeEntryFormFlag(true) }}>
                                                <i className="fas fa-user-nurse align-middle"></i>
                                                <span className="ml-2">Add New Practice</span>
                                            </div>
                                            <div className="pointer ml-2 btn-sm btn-warning p-2" onClick={() => { setAffiliationEntryFormFlag(true) }}>
                                                <i className="fas fa-clinic-medical align-middle"></i>
                                                <span className="ml-2">Affiliate to Practice</span>
                                            </div>
                                        </div>
                                        
                                    </div>
                                </div>
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