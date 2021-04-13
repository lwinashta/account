
import React, { useState, useEffect, useContext, useRef } from "react";
import { v4 as uuidv4 } from 'uuid';

import { FieldEntryError } from "form-module/fieldEntryError";

import { TimeSlotForm } from "./practiceAvailabilityTimeSlotForm";

const WKDAYS = [{
    "name": "sunday",
    "abbr": "sun"
}, {
    "name": "monday",
    "abbr": "mon"
}, {
    "name": "tuesday",
    "abbr": "tue"
}, {
    "name": "wednesday",
    "abbr": "wed"
}, {
    "name": "thursday",
    "abbr": "thur"
}, {
    "name": "friday",
    "abbr": "fri"
}, {
    "name": "saturday",
    "abbr": "sat"
}];

export const DaySlotForm=({
    validationErrors=[],
    daySlotInfo=null,
    handleOnEntry=function(){}
})=>{
    
    const [timeSlots,setTimeSlots]=useState([]);

    const addTimeSlot=()=>{
        let _d = [...timeSlots];
        _d.push({
            uuid: uuidv4()
        });
        setTimeSlots(_d);
    }

    useEffect(()=>{
        if(timeSlots.length===0) addTimeSlot();
    },[]);

    const handleOnDaySelection=(val,checked)=>{
        if(checked){
            daySlotInfo.days.push(val);//add to an array

        }else if(!checked){
            daySlotInfo.days=daySlotInfo.days.filter(d=>d!==val);
        }

        handleOnEntry(daySlotInfo);
    }

    const handleOnTimeEntry=(val)=>{

        //Check if slot already exists 
        let indx=daySlotInfo.timeSlots.findIndex(t=>t.uuid===val.uuid);
        if(indx>-1){
            daySlotInfo.timeSlots[indx]=val;
        }else{
            daySlotInfo.timeSlots.push(val);
        }
        
        handleOnEntry(daySlotInfo);
    }

    const removeTimeSlot=(val)=>{
        let _d=[...timeSlots];
        let indx=_d.findIndex(i=>i.uuid===val.uuid);
        _d.splice(indx,1);
        setTimeSlots(_d);
    }

    return(<div>
        <div className="p-2 form-group border rounded">
                <label data-required="1">Select days and Time slots</label>
                <div 
                    className="d-flex flex-row flex-wrap"
                    name="availability">
                    {
                        WKDAYS.map((day) => {
                            return <div key={day.name} className="mr-3">
                                <input 
                                    id={daySlotInfo.uuid+day.name}
                                    type="checkbox" 
                                    name="availabilityDay" 
                                    value={day.name} 
                                    onChange={(e)=>{
                                        handleOnDaySelection(e.target.value,e.target.checked);  
                                    }}/>
                                <label className="normal ml-1 text-capitalize" htmlFor={daySlotInfo.uuid+day.name}>{day.abbr}</label>
                            </div>
                    })}
                    
                </div>

                {
                    validationErrors.length>0 && validationErrors.filter(v=>v.noDaysSelected && v.daySlotUuid===daySlotInfo.uuid).length>0?
                    <FieldEntryError title="Please select the day(s)" 
                        prefix={null} />:
                    null
                }

                <div className="mt-2">
                {
                    timeSlots.length > 0 ?
                        <div>
                            {
                                timeSlots.map((t) => {
                                    return <div key={t.uuid} className="d-flex flex-row align-items-baseline">
                                        <div>
                                            <TimeSlotForm
                                                validationErrors={validationErrors}
                                                timeSlotInfo={t}
                                                handleOnEntry={handleOnTimeEntry} />
                                        </div>
                                        <div className="ml-2">
                                            <div className="icon-button" 
                                                onClick={()=>{
                                                    removeTimeSlot(t)
                                                }}><i className="fas fa-times"></i></div>
                                        </div>
                                    </div>
                                })
                            }

                            {
                                validationErrors.length>0 && validationErrors.filter(v=>v.noTimeSlots && v.daySlotUuid===daySlotInfo.uuid).length>0?
                                <FieldEntryError title="Please select the timeslots" 
                                    prefix={null} />:
                                null
                            }

                            <div className="mt-2 pt-2 pb-2">
                                <div className="btn-link pointer" 
                                    onClick={() => { addTimeSlot() }}>Add Time Slot</div>
                            </div>
                        </div>:
                        null
                }
                    
                </div>
            </div>
    </div>)

}


