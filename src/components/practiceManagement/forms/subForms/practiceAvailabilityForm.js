import React, { useState, useEffect, useContext, useRef } from "react";
import { v4 as uuidv4 } from 'uuid';

import { FieldEntryError } from "form-module/fieldEntryError";

import { FormContext } from "./../formContext";
import { DaySlotForm } from "./practiceAvailabilityDaySlotForm";

export const PracticeAvailabilityForm = () => {

    let contextValues=useContext(FormContext);

    const [daySlots, setDaySlots] = useState([]);
    const [validationErrors,setValidationErrors]=useState([]);

    const addDaySlot=()=>{
        let _d = [...daySlots];
        _d.push({
            days:[],
            timeSlots:[],
            uuid: uuidv4()
        });
        setDaySlots(_d);
    }

    const handleOnEntry=(data)=>{

        let _d=[...daySlots];

        let indx=_d.findIndex(i=>i.uuid===data.uuid);
        _d[indx]=Object.assign(_d[indx],data);

        contextValues.handleFormValues({
            availability: _d
        });

        setDaySlots(_d);
    }

    const validateData=()=>{
        let _d=contextValues.getFormValues("availability");
        let _v=[];

        if(_d.length===0){
            _v.push({
                "noAvailability":true
            });
        }else{
            _d.forEach(element => {

                if(element.days.length===0) _v.push({
                    "noDaysSelected":true,
                    "daySlotUuid":element.uuid
                });
                if(element.timeSlots.length===0) _v.push({
                    "noTimeSlots":true,
                    "daySlotUuid":element.uuid
                });
    
                if(element.timeSlots.length>0){
                    element.timeSlots.forEach(t=>{
                        if(!('from' in t)) _v.push({
                            "noFromTimeSlot":true,
                            "timeSlotUuid":t.uuid
                        });
                        if(!('to' in t)) _v.push({
                            "noToTimeSlot":true,
                            "timeSlotUuid":t.uuid
                        });
                    })
    
                }
            });
        }
    
        return _v;
    }
    
    const handleNextClick=()=>{
        let _v=validateData();
        //console.log(_v);
        if(_v.length>0){
            setValidationErrors(_v);
        }else{
            setValidationErrors([]);
            contextValues.handleTabClick("settings","availability");
        }
        
    }

    const handlePrevClick=()=>{
        let _v=validateData();
        if(_v.length>0){
            setValidationErrors(_v);
        }else{
            setValidationErrors([]);
            contextValues.handleTabClick("pictures","availability")
        }
        
    }

    return (
        <div>
            <div className="mb-3 font-weight-bold text-primary">Your Availability:</div>
            <div className="mb-3 text-muted">
                Your availability information will be visible to all users or patients
                viewing your profile. System will determine the next available
                appointments per the availability provided here.
            </div>

            <div className="mt-2" >
                <div className="p-2">
                    {
                        daySlots.length>0?
                            daySlots.map(d=>{
                                return <DaySlotForm 
                                    validationErrors={validationErrors}
                                    handleOnEntry={handleOnEntry}
                                    key={d.uuid} 
                                    daySlotInfo={d} /> 
                            }):
                        null
                    }
                </div>

                {
                    validationErrors.length>0 && validationErrors.filter(v=>v.noAvailability).length>0?
                        <FieldEntryError title="Please enter availabily. No availabily has been entered." prefix={null} />:
                    null
                }

                <div className="mt-2 pt-2 pb-2 border-top border-bottom">
                    <div className="btn-link pointer" onClick={() => { addDaySlot() }}>Add Availability</div>
                </div>
                
            </div>

            <div className="d-flex flex-row justify-content-between mt-4">
                <div className="btn btn-primary pointer" 
                    onClick={()=>{handlePrevClick()}}>
                        <i className="mr-2 fas fa-arrow-left"></i>
                        <span>Previous</span>
                    </div>
                <div className="btn btn-primary pointer" 
                    onClick={()=>{handleNextClick()}}>
                        <i className="mr-2 fas fa-arrow-right"></i>
                        <span>Next</span>
                </div>
            </div>

        </div>);
}
