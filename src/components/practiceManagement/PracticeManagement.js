import React,{useContext,useState,useEffect} from 'react';
import {DropDown} from 'core/components/buttons/dropDown/web/dropDown';
import { AppContext } from "../AppContext";

// import { AffliatePracticeForm } from "./forms/affiliatePracticeForm";
import { PracticeEntryForm } from "./forms/PracticeEntryForm";
import { getFacilityProviderDataFromServer } from "./handlers";

import { DisplayGeneralInfo } from "./display/generalInfo";
import { DisplayAddress } from './display/address';
import { DisplayPracticeContact } from "account-manager-module/lib/practiceManagement/components/display/contacts/web/displayPracticeContacts";
import { DisplayAvailability } from "account-manager-module/lib/practiceManagement/components/display/availability/web/displayAvailability";
import { PracticeUpdateButtons } from './display/practiceUpdateButtons';

export const PracticeManagement = () => {

    const [showPracticeEntryForm, setShowPracticeEntryFormFlag] = useState(false);
    const [showAffiliationEntryForm, setAffiliationEntryFormFlag]=useState(false);
    const [userPractices,setUserPractices]=useState([]);
    const [practiceToUpdate,setPracticeToUpdate]=useState(null);

    let AppLevelContext=useContext(AppContext);

    useEffect(()=>{
        try {

            getFacilityProviderDataFromServer({
                "userMongoId.$_id":AppLevelContext.userInfo._id
            }).then(response=>response.json())
            .then(data=>{console.log(data);setUserPractices(data)})
            .catch(err => console.log(err));

        } catch (error) {
            console.log(error);
        }
    },[]);

    useEffect(()=>{
        if(practiceToUpdate!==null) {setShowPracticeEntryFormFlag(true)};
    },[practiceToUpdate]);

    useEffect(()=>{
        if(!showPracticeEntryForm) setPracticeToUpdate(null);
    },[showPracticeEntryForm]);

    const handleEditPracticeInfo=(_id)=>{
        
        let _d=[...userPractices];
        let data=_d.find(i=>i._id===_id);

        //deconstruct data
        let {facilityInfo,...facilityProviderInfo}=data;
        facilityInfo=facilityInfo[0];//get the first elemt in the array 
        
        //decontructing the data 
        facilityInfo.facilityProviderId=facilityProviderInfo._id
        facilityInfo.availability=facilityProviderInfo.availability;
        facilityInfo.pictures=facilityInfo.files.filter(f=>f.fieldName==="medicalFacilityPictures");
        facilityInfo.ownershipPictures=facilityInfo.files.filter(f=>f.fieldName==="medicalFacilityOwnership");

        setPracticeToUpdate(facilityInfo);
    }

    const handleAfterPracticeSubmission=(data)=>{
        console.log(data);

        let _d=[...userPractices];
        let indx=_d.findIndex(p=>p._id===data._id);

        if(indx>-1){
            _d[indx]=data;
        }else{
            _d.push(data);
        }

        setUserPractices(_d);

    }

    const handlePracticeFacilityInfoUpdate=(practiceId,data)=>{
        //console.log(_id,data);
        let {_id,...info}=data;
        
        let _d=[...userPractices];
        let indx=_d.findIndex(i=>i._id===practiceId);

        let fIndx=_d[indx].facilityInfo.findIndex(f=>f._id===_id);

        _d[indx].facilityInfo[fIndx]=Object.assign(_d[indx].facilityInfo[fIndx],info);
        
        console.log(_d);
        setUserPractices(_d);
    }

    return (<div className="container-fluid mt-4">
        <div className="d-flex flex-row justify-content-between align-items-baseline">
            <h4>Practices:</h4>
            <div className="btn btn-primary pointer" 
                onClick={()=>{setShowPracticeEntryFormFlag(true)}}>
                <i className="fas fa-user-nurse"></i>
                <span className="ml-2">Add New Practice</span>
            </div>
            {/* <DropDown 
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
            </DropDown> */}
        </div>

        <div className="mt-3">
            {
                userPractices.length>0?
                userPractices.map(practice=>{
                    return  <div key={practice._id}>
                        <div className="p-2 bg-white position-relative mt-2 border rounded">
                            {
                                practice.facilityInfo.map(facility=>{
                                    return <div key={facility._id}>
                                        
                                        <div className="push-right">
                                            <PracticeUpdateButtons 
                                                handlePracticeFacilityInfoUpdate={handlePracticeFacilityInfoUpdate}
                                                handleOnEdit={handleEditPracticeInfo}
                                                practiceInfo={practice}
                                                facilityInfo={facility}/>
                                        </div>

                                        <div className="p-2 border-bottom">
                                            <DisplayGeneralInfo facilityInfo={facility} />
                                        </div>
                                        
                                        <div  className="p-2 border-bottom">
                                            <DisplayAddress facilityInfo={facility}/>
                                        </div>

                                        <div className="p-2 border-bottom">
                                            <div className="font-weight-bold">Contact</div>
                                            <DisplayPracticeContact contacts={facility.contacts} />
                                        </div>

                                        <div className="p-2">
                                            <DisplayAvailability availability={practice.availability} />
                                        </div>

                                    </div>
                                })
                            }
                        </div>
                    </div>
                }):
                <div style={{flex:1}}>
                    <div className="w-100 text-center">
                        <img style={{width:"100px",opacity:0.6}} src="/src/images/hospital.png"/>
                        <h4 className="mt-3 text-muted">No Practices found.</h4>
                        <div className="mt-2 btn btn-sm btn-primary" 
                            onClick={()=>{setShowPracticeEntryFormFlag(true)}}>
                            Add New Practice
                        </div>
                    </div>
                </div>
            }
        </div>

        {
            showPracticeEntryForm?
            <PracticeEntryForm 
                practiceToUpdate={practiceToUpdate!==null?{...practiceToUpdate}:null} 
                afterSubmission={handleAfterPracticeSubmission}
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