import React, { useContext } from "react";
import { AppointmentContext } from "../../../contexts/appoinment";

export const ConfirmAppointmentButton = () => {

    let contextValues=useContext(AppointmentContext);
    
    //console.log("loaded");
    //Confirming appointment sends a SMS to patient 
    //Sends Email to patient
    //Saves the information in DB 

    const updateAppointmentData = (_d) => {

        //update selected appointment
        contextValues.setSelectedAppointment(_d);
        
        let _a=[...contextValues.userAppointments];
        let indx=_a.findIndex(a=>a._id===_d._id);

        _a[indx]=_d;

        //-- update all appointments array ---
        contextValues.setUserAppointments(_a);

    }

    const handleAppointmentConfirmation=()=>{
        //console.log('clicked');
        $.ajax({
            "url": "/appointments/update",
            "processData": false,
            "contentType": "application/json; charset=utf-8",
            "data": JSON.stringify({
                _id:contextValues.selectedAppointment._id,
                confirmed_by_provider:true,
                confirmation_datetime:new Date()
            }),
            "method": "POST"

        }).then(response => {
            
            let _d = { ...contextValues.selectedAppointment};

            //console.log(_d);

            _d.confirmed_by_provider = true;
            _d.confirmation_datetime = new Date();

            updateAppointmentData(_d);

            //Send SMS to the user
            

        });
    }

    //Rejection sends email and sms to patient with reason of cancellation
    const handleAppointmentRejection=(appt)=>{
        
    }
    
    return (
        <AppointmentContext.Consumer>
            {({
                selectedAppointment={}
            })=>{
                return <div>
                        {
                            selectedAppointment.confirmed_by_provider?
                            <div className="btn-sm pointer btn-danger small">Cancel Appointment</div>:
                            <div className="btn-sm pointer btn-primary small" onClick={()=>{handleAppointmentConfirmation()}}>Confirm Appointment</div>
                        }
                    </div>

            }}
        </AppointmentContext.Consumer>
        
    )    
} 