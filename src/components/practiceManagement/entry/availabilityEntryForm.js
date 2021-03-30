import React,{useState,useEffect} from "react";
import { formjs} from "@oi/utilities/lib/js/form";
const moment=require('moment');

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

var TIMESLOTS=[];
const getTimeSlotHours = () => {
    let loopHours = moment().hours(0).minutes(0).seconds(0);
    let td = moment().hours(0).minutes(0).seconds(0);
    while (loopHours.diff(td, 'days') <= 0) {
        TIMESLOTS.push({
            "displayFormat": loopHours.format('hh:mm a'),
            "hours": loopHours.hours(),
            "minutes": loopHours.minutes(),
            "meridian": loopHours.format('a')
        });
        loopHours.add(15, 'minutes');
    }
}
getTimeSlotHours();

const AddTimeSlot=()=>{

    const handleFromTimeChange=(e)=>{
        let fromSelectField=e.target;
        let toSelectField= $(fromSelectField).closest('.time-slot-entry').find('[name="availability_to_slot_time"]');

        let fromTime=e.target.value;
        $(toSelectField).val('');

        if(fromTime.length>0){
            $(toSelectField).removeAttr('disabled');
            $(toSelectField).find('option').removeAttr('disabled');
            
            let time=JSON.parse(fromTime);
            let formMomentTime=moment().hours(time.hours).minutes(time.minutes).second(0);
            let loopTime=moment().hours(0).minutes(0).second(0);
            
            while(loopTime.diff(formMomentTime,'minutes')<=0){
                let formattedTime=loopTime.format('hh:mm a');
                $(toSelectField).find('option[_time="'+formattedTime+'"]').attr('disabled','disabled')
                loopTime.add(15, 'minutes');
            }

        }else{
            $(toSelectField).attr('disabled','disabled')
        }
    }

    const handleRemoveSlot=(e)=>{
        $(e.target).closest('.time-slot-entry').remove();
    }
    
    return (<div className="d-flex mt-2 time-slot-entry">
        <select name="availability_from_slot_time"
            className="form-control entry-field" 
            data-required="1" placeholder="From Time" 
                onChange={(e)=>{handleFromTimeChange(e)}}>
            <option value=""> - Select From Time - </option>
            {TIMESLOTS.map((slot,indx) => {
                return <option key={indx} 
                    _time={slot.displayFormat}
                    value={JSON.stringify(slot)}>{slot.displayFormat}</option>
            })}
        </select>
        <select name="availability_to_slot_time"
            className="ml-2 form-control entry-field" 
            data-required="1" placeholder="To Time" disabled="disabled">
            <option value=""> - Select To Time - </option>
            {TIMESLOTS.map((slot,indx) => {
                return <option key={indx} 
                    _time={slot.displayFormat}
                    value={JSON.stringify(slot)}>{slot.displayFormat}</option>
            })}
        </select>
        <div className="p-2 ml-2" onClick={(e)=>{handleRemoveSlot(e)}}>
            <i className="fas fa-times text-danger"></i>
        </div>
    </div>);       
}

export const AvailabilityEntryForm=({
    onSubmission={},
    _editAvailabilityId="",
    _editAvailabilityInfo={},
    _indx=0
})=>{

    const [timeSlot,setTimeSlot]=useState(1);
    const [availabilityDays,setAvailabilityDays]=useState(Object.keys(_editAvailabilityInfo).length>0?_editAvailabilityInfo.availability_days:[]);

    let _formjs=new formjs();
    let formRef=React.createRef();

    const handleSubmission=(e)=>{
        e.preventDefault();
        let form=e.target;

        let validate=_formjs.validateForm(form);
        let availabilityTimeSlots=[];

        if($(form).find('.time-slots').find('.time-slot-entry').length===0){
            $(form).find('.time-slots label').after("<div className='required-err'>At least one time slot must be entered</div>");
            validate++;
        }

        if(validate===0){
             //Get timeslots
            $(form).find('.time-slots').find('.time-slot-entry').each(function(){
                let slot=this;
                availabilityTimeSlots.push({
                    availability_from_slot_time:$(slot).find("[name='availability_from_slot_time']").val(),
                    availability_to_slot_time:$(slot).find("[name='availability_to_slot_time']").val()
                });
            });

            onSubmission({
                availability_days:availabilityDays,
                availability_time_slots:availabilityTimeSlots,
                _id:_editAvailabilityId.length>0?_editAvailabilityId:getRandomId(_indx)
            });

        }else{
            popup.onBottomCenter("Please enter required fields");
        }

        
    }

    const handleWkDayChange=(e)=>{
        //console.log(e.target,e.target.checked);
        if(e.target.checked){
            let days=[...availabilityDays];
            days.push(e.target.value);
            setAvailabilityDays(days);
        }else{
            let days=[...availabilityDays];
            let indx=days.indexOf(e.target.value);
            days.splice(indx,1);
            setAvailabilityDays(days);
        }
    }

    useEffect(()=>{
        if(_editAvailabilityId.length>0 && Object.keys(_editAvailabilityInfo).length>0){
            //add values in the form 
            _editAvailabilityInfo.availability_days.forEach((day)=>{
                $(formRef.current)
                    .find('[name="availability_days"]')
                    .find('input[type="checkbox"][value="'+day+'"]').prop('checked',true);
            });

            _editAvailabilityInfo.availability_time_slots.forEach((slots,indx)=>{
                indx>0?setTimeSlot(timeSlot+1):null;
            });
        }
    },[]);

    useEffect(()=>{
        if(_editAvailabilityId.length>0 
                && Object.keys(_editAvailabilityInfo).length>0 
                && timeSlot===_editAvailabilityInfo.availability_time_slots.length){
            
            //add values in the form 
            _editAvailabilityInfo.availability_time_slots.forEach((slot,indx)=>{
                let indxTimeSlot=$(formRef.current).find('.time-slots').find('.time-slot-entry')[indx];
                $(indxTimeSlot).find('[name="availability_from_slot_time"]').val(slot.availability_from_slot_time);
                $(indxTimeSlot).find('[name="availability_to_slot_time"]').val(slot.availability_to_slot_time);
            });

        }
    },[timeSlot])

    return (<div>
        <form onSubmit={(e)=>{handleSubmission(e)}} ref={formRef}>
            <div className="form-group">
                <label data-required="1">Select Days</label>
                <div className="checkbox-control-group entry-field d-flex flex-wrap" 
                data-required="1" name="availability_days">
                    {
                        WKDAYS.map((day, j) => {
                            return <div key={j} className="form-check d-inline-block mr-3">
                                <input id={day.abbr+j} className="form-check-input" 
                                    type="checkbox" name="availability_day" 
                                    value={day.name} onChange={(e)=>{handleWkDayChange(e)}}/>
                                <label htmlFor={day.abbr+j}>{day.abbr}</label>
                            </div>
                    })}
                </div>
            </div>
            <div className="form-group time-slots">
                <label data-required="1">Select Hours</label>
                {   
                    [...Array(timeSlot)].map((k,i)=>{
                        return <AddTimeSlot key={i}  indx={i} />
                    })
                }
                <div className="mt-3">
                    <div className="small btn-link pointer" onClick={()=>{setTimeSlot(timeSlot+1)}}>Add Time Slot</div>
                </div>
            </div>
            <div className="mt-2 text-center pt-2" >
                <button className="btn btn-info w-75" type="submit">Save Availability Information</button>
            </div>
        </form>
    </div>);

}