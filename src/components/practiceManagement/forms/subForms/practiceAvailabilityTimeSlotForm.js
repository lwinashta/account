import React, { useState, useEffect, useContext, useRef } from "react";
const moment = require('moment');

import { FieldEntryError } from "form-module/fieldEntryError";

const TIMEINCREMENT=15;

const TIMESLOTS=[];

let loopHours = moment().hours(0).minutes(0).seconds(0);
let td = moment().hours(0).minutes(0).seconds(0);

while (loopHours.diff(td, 'days') <= 0) {
    TIMESLOTS.push({
        "displayFormat": loopHours.format('hh:mm a'),
        "hours": loopHours.hours(),
        "minutes": loopHours.minutes(),
        "meridian": loopHours.format('a')
    });
    loopHours.add(TIMEINCREMENT, 'minutes');
}

export const TimeSlotForm=({
    validationErrors=[],
    timeSlotInfo=null,
    handleOnEntry=function(){}
})=>{

    const [fromTimeOptions,setFromTimeOptions]=useState(TIMESLOTS);
    const [toTimeOptions,setToTimeOptions]=useState(TIMESLOTS);

    const [fromTime,setFromTime]=useState(null);
    const [toTime,setToTime]=useState(null);

    const handleOnChange=(val)=>{
        timeSlotInfo=Object.assign(timeSlotInfo,val);
        handleOnEntry(timeSlotInfo);
    }

    //Effect triggers when user selected from time 
    useEffect(()=>{
        if(fromTime!==null && fromTime.length>0){

            let time=JSON.parse(fromTime);
            let formMomentTime=moment().hours(time.hours)
                    .minutes(time.minutes).second(0).add(15,'minutes');

            let limitTime=moment().hours(23).minutes(45).second(0);
            
            let _d=[];

            while(formMomentTime.diff(limitTime,'minutes')<=0){
                _d.push({
                    "displayFormat": formMomentTime.format('hh:mm a'),
                    "hours": formMomentTime.hours(),
                    "minutes": formMomentTime.minutes(),
                    "meridian": formMomentTime.format('a')
                });
                formMomentTime.add(TIMEINCREMENT, 'minutes');
            }

            setToTimeOptions(_d);

        }else{
            document.getElementById(`availability=${timeSlotInfo.uuid}-from-options`).selectedIndex=-1;
        }

    },[fromTime]);

    return (<div className="d-flex flex-row mt-2">
        <div>
            <select name="from"
                id={`availability=${timeSlotInfo.uuid}-from-options`}
                className="form-control" 
                data-required="1"
                onChange={(e)=>{
                    handleOnChange({from:e.target.value});
                    setFromTime(e.target.value);
                }}>
                <option value=""> - Select From Time - </option>
                {fromTimeOptions.map((slot,indx) => {
                    return <option key={indx} value={JSON.stringify(slot)}>{slot.displayFormat}</option>
                })}
            </select>
            {
                validationErrors.length>0 && validationErrors.filter(v=>v.noFromTimeSlot && v.timeSlotUuid===timeSlotInfo.uuid).length>0?
                <FieldEntryError title="Please select -from- time" 
                    prefix={null} />:
                null
            }
        </div>
        
        <div>
            <select name="to"
                id={`availability=${timeSlotInfo.uuid}-to-options`}
                className="form-control ml-2"
                disabled={fromTime !== null && fromTime.length > 0 ? null : "disabled"}
                onChange={(e) => {
                    handleOnChange({ to: e.target.value });
                    setToTime(e.target.value);
                }}>
                <option value=""> - Select To Time - </option>
                {toTimeOptions.map((slot, indx) => {
                    return <option key={indx} value={JSON.stringify(slot)}>{slot.displayFormat}</option>
                })}
            </select>
            {
                validationErrors.length > 0 && validationErrors.filter(v => v.noToTimeSlot && v.timeSlotUuid === timeSlotInfo.uuid).length > 0 ?
                    <FieldEntryError title="Please select -to- time"
                        prefix={null} /> :
                    null
            }
        </div>
        
</div>)
}