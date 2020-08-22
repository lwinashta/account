import React from "react";
import { AppointmentContext } from "./../../../contexts/appoinment";

export const DisplayAppointmentTitle = () => {

    return (
        <AppointmentContext.Consumer>
            {({
                selectedAppointment={}
            }) => {
                return <div>
                    <div className="mt-2 mb-2 h4 text-capitalize">{selectedAppointment.appointment_type}</div>    
                </div>
            }}
        </AppointmentContext.Consumer>

    )
}