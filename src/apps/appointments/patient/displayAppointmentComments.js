import React from 'react';
import { AppointmentContext } from "./../../../contexts/appoinment";

export const DisplayAppointmentComments=()=>{
    return (
        <AppointmentContext.Consumer>
            {({appointment={}})=>{
                return <div className="d-flex">
                    <div><i className="fas fa-comments align-top"></i></div>
                    <div className="ml-2 small">
                        {appointment.comments}
                    </div>
                </div>
            }}
        </AppointmentContext.Consumer>
    )
}