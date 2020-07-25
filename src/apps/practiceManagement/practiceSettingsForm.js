import React, { useState, useEffect, useContext } from "react";
import { UserInfo } from "../../contexts/userInfo";
import { updatePracticeUser } from "./methods";
import { formjs } from "@oi/utilities/lib/js/form";

export const PracticeSettingsForm = ({ afterSubmission = {} }) => {

    let formRef=React.createRef();
    let contextValues=useContext(UserInfo);

    useEffect(()=>{

        let form=$(formRef.current);
        let data=contextValues.selectedPracticeInfo;

        //console.log(data);

        if(Object.keys(data).length>0 && 'settings' in data){
            $(form).find('[name="appointment_time_slot_diff"]').val(data.settings.appointment_time_slot_diff);
            data.settings.appointment_allowed_booking_types.forEach(element => {
                $(form).find('[name="appointment_allowed_booking_types"][value="'+element+'"]').prop('checked',true);
            });
        }
        
    },[])

    const handlePracticeSettingsSubmission=(e)=>{
        
        e.preventDefault();

        let _formjs=new formjs();
        let form=$(formRef.current);
        let validate=_formjs.validateForm(form);
        let formData={};

        if(validate===0){

            $(form).find('.entry-field[name]').each(function () {
                let fd = _formjs.getFieldData(this);
                formData = Object.assign(formData, fd);
            });

            let data={
                "_id":contextValues.selectedPracticeInfo._id,
                "settings":formData
            }

            //console.log(data);
            updatePracticeUser(data).then(response=>{
                console.log(response);
                afterSubmission(data);

            }).catch(err=>{
                console.error(err);
                popup.onBottomCenterErrorOccured("Error occured while updating. try again.");
            })

        }
    }

    return (
        <UserInfo.Consumer>
            {({selectedPracticeInfo={}}) => {
                return <form ref={formRef} className="p-2" onSubmit={(e) => {handlePracticeSettingsSubmission(e) }}>
                    <div className="mt-2 mb-4 text-muted">
                        The <span className="font-weight-bold text-info">{Object.keys(selectedPracticeInfo).length>0  && 'facilityInfo' in selectedPracticeInfo ? selectedPracticeInfo.facilityInfo[0].medical_facility_name:""}</span> practice settings are linked to your account. 
                        If there are other providers affiliated to this practice, their settings will not be impacted. 
                    </div>
                    <div className="h5 font-weight-bold text-capitalize" htmlFor="appointment-settings">Appointment Settings</div>
                    <div className="form-group">
                        <label data-required="1">Appointment slots time gap</label>
                        <select className="form-control entry-field" 
                            name="appointment_time_slot_diff" 
                            data-required="1" placeholder="Appointment time gap" >
                            <option value=""></option>
                            <option value="15">15 mins (default)</option>
                            <option value="30">30 mins</option>
                            <option value="45">45 mins</option>
                            <option value="60">60 mins</option>
                        </select>
                        <p className="mt-2 small text-muted">
                            Select the time gap between your appointments. 
                            This settings will be used by the system to determine your availability and also will show the appointment slots 
                            spaned for the selected time gap.
                        </p>
                    </div>
                    <div className="form-group">
                        <label data-required="1">Appointment types allowed</label>
                        <div name="appointment_allowed_booking_types" className="checkbox-control-group entry-field" data-required="1">
                            <div>
                                <input name="appointment_allowed_booking_types" type="checkbox" value="inperson" id="appointment-type-inperson" />
                                <label style={{fontSize:'small'}} className="normal ml-2" htmlFor="appointment-type-inperson">In person consultation</label>
                            </div>
                            <div>
                                <input name="appointment_allowed_booking_types" type="checkbox" value="video" id="appointment-type-video" />
                                <label style={{fontSize:'small'}} className="normal ml-2" htmlFor="appointment-type-video">Video consultation</label>
                            </div>
                            <div>
                                <input name="appointment_allowed_booking_types" id="appointment-type-call" type="checkbox" value="call" />
                                <label style={{fontSize:'small'}} className="normal ml-2" htmlFor="appointment-type-call">Call for consultation</label>
                            </div>
                        </div>
                        <p className="mt-2 small text-muted">
                            Select the appointment type you would like patients to book. 
                            Uncheck the options that you dont want to allow patients to book.
                        </p>
                    </div>
                    <div className="mt-3 text-center pt-2">
                        <button className="btn btn-primary w-75" type="submit">Save Information</button>
                    </div>
                </form>

            }}
        </UserInfo.Consumer>
    )
}