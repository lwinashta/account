import React, { useState } from 'react';
import { AppointmentContext } from "../../../contexts/appoinment";

export const DisplayAppointmentState=()=>{

    return (
        <AppointmentContext.Consumer>
            {({appointment={}})=>{
                return <div className={`d-flex btn-tooltip ${appointment.appointment_state==="confirmed"?" text-success ":
                    appointment.appointment_state==="pending"?" text-warning":
                    appointment.appointment_state==="canceled"?" text-danger":""}`} tip={
                        appointment.appointment_state==="confirmed"?"Appointment Confirmed":
                        appointment.appointment_state==="pending"?"Appointment Pending Confirmation":
                        appointment.appointment_state==="canceled"?"Appointment Canceled":""
                    }>

                    <i className={`${appointment.appointment_state==="confirmed"?"fas fa-check-circle":
                    appointment.appointment_state==="pending"?"fas fa-exclamation-triangle":
                    appointment.appointment_state==="canceled"?"fas fa-minus-circle":""}`}></i>

                    <div className="ml-1 small text-capitalize">
                        {appointment.appointment_state}
                    </div>

                </div>
            }}
        </AppointmentContext.Consumer>
    )
}