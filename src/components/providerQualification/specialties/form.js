import React, { useEffect, useState, useContext, useRef } from "react";

import { Modal } from "core/components/modal/web/modal";
import { MultiSelectField } from "core/components/fields/web/multiselectField";
const specialties=require('@oi/utilities/lists/specialties.json');

import { AppContext } from "../../AppContext";
import App from "../../App";

export const SpecialtyEntryForm = ({
    onCloseHandler=function(){}
}) => {

    let AppLevelContext = useContext(AppContext);
    
    let formValues=useRef({
        specialties:null
    });

    const handleSpecialtyEntry=(e)=>{
        
        try {
            
            e.preventDefault();

            fetch('/account/api/user/profile/update',{
                method:"POST",
                body:JSON.stringify({
                    _id:AppLevelContext.userInfo._id,
                    "$push": {
                        specialties: {
                            $each:formValues.current.specialties
                        }
                    }
                }),
                headers: {
                    "content-type": "application/json",
                }
            })
            .then(response=>response.json())
            .then(data=>{
                
                AppLevelContext.updateUserContextInfo({
                    specialties:data.specialties
                });

                AppLevelContext.setPopup({
                    show:true,
                    message:"Specialty saved successfully"
                });

                onCloseHandler();

            }).catch(err=>{
                alert("Issue in updating birthdate. Please try again later");
            });

        } catch (error) {
            console.log(error);
        }
    }

    const handleOnItemSelection=(selectedItem)=>{
        formValues.current.specialties=selectedItem;
    }

    /** Render */
    return (<Modal
        header={<h4> Specialty Entry </h4>}
        onCloseHandler={() => { onCloseHandler() }}>
        <form onSubmit={(e) => { handleSpecialtyEntry(e) }}>
            <div className="form-group mt-2">
                <label data-required="1">Specialty</label>
                <p className="text-muted small  my-2">Search and add multiple specialties </p>
                <div>
                    <MultiSelectField  
                        handleOnItemSelection={handleOnItemSelection}
                        data={
                            ("specialties" in AppLevelContext.userInfo) && AppLevelContext.userInfo.specialties.length>0?
                                specialties.reduce((acc,ci)=>{
                                    //exclude items from data which are alreadu added to profile
                                    if(AppLevelContext.userInfo.specialties.find(s=>s._id===ci._id)===undefined){
                                        acc.push(ci);
                                    }
                                    return acc;
                                },[]):
                            specialties
                        } />
                </div>
            </div>
            <div className="mt-2 text-center">
                <button className="btn btn-primary w-75" type="submit">Save Information</button>
            </div>
        </form>
    </Modal>)
}