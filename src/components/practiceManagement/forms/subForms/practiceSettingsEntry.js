import React, { useEffect, useState} from "react";
import { formjs } from "@oi/utilities/lib/js/form";


export const PracticeSettingsEntry = ({ 
    selectedPracticeInfo={}, 
    setEntryData = null ,
    onNextClick=null,
    onBackClick=null,
    onSubmission=null
}) => {

    let settingsFormRef=React.createRef();
    const [settings, setSettings]=useState(Object.keys(selectedPracticeInfo).length>0 && 'settings' in selectedPracticeInfo?selectedPracticeInfo.settings:{})

    useEffect(()=>{

        let form=$(settingsFormRef.current);

        if(Object.keys(settings).length>0){
            $(form).find('[name="appointment_time_slot_diff"]').val(settings.appointment_time_slot_diff);
            
            settings.appointment_allowed_booking_types.forEach(element => {
                $(form).find('[name="appointment_allowed_booking_types"][value="'+element+'"]').prop('checked',true);
            });
        }
        
    },[]);

    const getSettings = () => {
        
        let _formjs = new formjs();
        try {

            let form = $(settingsFormRef.current);
            let validate = _formjs.validateForm(form);

            if (validate > 0) throw new Error("validation error")

            let formData = {};

            $(form).find('.entry-field[name]').each(function () {
                let fd = _formjs.getFieldData(this);
                formData = Object.assign(formData, fd);
            });

            return formData;

        } catch (error) {
            if (error === "validation error") popup.onBottomCenterRequiredErrorMsg();
            return null;
        }

    }

    const handleOnNext = () => {

        let data = getSettings();

        if (data !== null) {
            setEntryData({
                settings: data
            });

            onNextClick();
        }

    }

    const handleOnSubmission=()=>{
        let data = getSettings();

        if (data !== null) {
            onSubmission({
                settings: data
            });
        }
    }

    return (
        <div ref={settingsFormRef} className="p-2" >
            <div className="h5 font-weight-bold text-capitalize">Practice Settings</div>
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
                        <label style={{fontSize:'small'}} className="small normal ml-2" htmlFor="appointment-type-inperson">In person consultation</label>
                    </div>
                    <div>
                        <input name="appointment_allowed_booking_types" type="checkbox" value="video" id="appointment-type-video" />
                        <label style={{fontSize:'small'}} className="small normal ml-2" htmlFor="appointment-type-video">Video consultation</label>
                    </div>
                </div>
                <p className="mt-2 small text-muted">
                    Select the appointment type you would like patients to book.
                    Uncheck the options that you dont want to allow patients to book.
                </p>
            </div>

            {
                onBackClick !== null && onNextClick !== null ?
                    <div className="mt-2 d-flex justify-content-between">
                        <div className="btn-sm btn-secondary pointer small"
                            onClick={() => { onBackClick() }}>
                            <i className="fas fa-chevron-left mr-2"></i>
                            <span>Back</span>
                        </div>
                        <div className="btn-sm btn-info pointer small"
                            onClick={() => { handleOnNext() }}>
                            <span>Next</span>
                            <i className="fas fa-chevron-right ml-2"></i>
                        </div>
                    </div> :
                onSubmission !== null ?
                        <div className="mt-2 text-center pt-2 border-top"onClick={()=>{handleOnSubmission()}}>
                            <button className="btn btn-primary w-75" type="submit">Save Information</button>
                        </div> :
                null
            }

            

        </div>
    )
}