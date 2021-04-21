import React, { useEffect, useContext,useRef, useState} from "react";
import { FieldEntryError } from "form-module/fieldEntryError";

import { FormContext } from "./../formContext";

export const PracticeSettingsForm = () => {

    let contextValues=useContext(FormContext);

    let settings=useRef(contextValues.practiceToUpdate!==null?
        contextValues.practiceToUpdate.settings:
        {
            appointmentTimeGap:"15",
            allowedBookingTypes:["video","inperson"]
        }
    );

    const [validationErrors,setValidationErrors]=useState([]);

    const handleFormValues=()=>{
        contextValues.handleFormValues({
            settings:settings.current
        })
    };

    const handleOnBookingTypeChange=(e)=>{
        if(e.target.checked){
            settings.current.allowedBookingTypes.push(e.target.value);
        }else{
            settings.current.allowedBookingTypes=settings.current.allowedBookingTypes.filter(s=>s!==e.target.value);
        }
        handleFormValues();
    }

    const handleOnSubmission=()=>{
        let _v=[];
        
        if(settings.current.appointmentTimeGap.length===0) _v.push({noAppointmentTimGap:true});
        if(settings.current.allowedBookingTypes.length===0) _v.push({noBookingType:true});
        
        if(_v.length>0){
            setValidationErrors(_v);
        }else{
            setValidationErrors([]);
            contextValues.handleFormValues({
                settings:settings.current
            });
            
            contextValues.handleSubmissionPreWorkflow();//submit practice information 
        }
    
    }

    return (
        <div className="p-2" >

            <div className="mb-3 font-weight-bold text-primary">Practice Settings:</div>

            <div className="form-group">
                <label data-required="1">Time gap between appointements</label>
                <div className="mt-2 text-muted">
                    Select the time gap between your appointments.
                    This settings will be used by the system to determine your availability and also will show the appointment slots
                    spaned for the selected time gap.
                </div>
                <select 
                    className="form-control"
                    name="appointmentTimeGap" 
                    onChange={(e)=>{
                        settings.current.appointmentTimeGap=e.target.value
                        handleFormValues();
                    }}
                    defaultValue={settings.current.appointmentTimeGap}
                    placeholder="Appointment time gap" >
                    <option value="15">15 mins (default)</option>
                    <option value="30">30 mins</option>
                    <option value="45">45 mins</option>
                    <option value="60">60 mins</option>
                </select>
                {
                    validationErrors.length>0 && validationErrors.filter(v=>v.noAppointmentTimGap).length>0?
                        <FieldEntryError title="Please select the appointment time gap" prefix={null} />:
                    null
                }
            </div>
            <div className="form-group">
                <label data-required="1">Allowed appointment booking types</label>
                <div className="mt-2 text-muted">
                    Select the appointment type you would like patients to book.
                    Uncheck the options that you dont want to allow patients to book.
                </div>
                <div name="allowedBookingTypes">
                    <div className="d-flex flex-row align-items-baseline">
                        <input type="checkbox" 
                            value="inperson" 
                            defaultChecked={settings.current.allowedBookingTypes.includes("inperson")}
                            id="appointment-type-inperson" 
                            onChange={(e)=>{
                                handleOnBookingTypeChange(e);
                            }} />
                        <label className="normal ml-2" htmlFor="appointment-type-inperson">In person consultation</label>
                    </div>
                    <div className="d-flex flex-row align-items-baseline">
                        <input type="checkbox" 
                            value="video" 
                            defaultChecked={settings.current.allowedBookingTypes.includes("video")}
                            id="appointment-type-video" 
                            onChange={(e)=>{
                                handleOnBookingTypeChange(e);
                            }} />
                        <label className="normal ml-2" htmlFor="appointment-type-video">Video Call</label>
                    </div>
                </div>
                {
                    validationErrors.length>0 && validationErrors.filter(v=>v.noBookingType).length>0?
                        <FieldEntryError title="Please select atleast one booking type" prefix={null} />:
                    null
                }
            </div>

            <div className="mt-2 d-flex justify-content-between">
                <div className="btn btn-secondary pointer" 
                    onClick={()=>{contextValues.handleTabClick("availability","settings")}}>
                        <i className="mr-2 fas fa-arrow-left"></i>
                        <span>Previous</span>
                </div>
                <div className="btn btn-success pointer"
                    onClick={() => { handleOnSubmission() }}>
                    <i className="far fa-save mr-2"></i>
                    <span>Save Practice Information</span>
                </div>
            </div>

        </div>
    )
}