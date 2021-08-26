import React from "react";
import { AppointmentContext } from "../../../../contexts/appoinment";

export const DisplayAppointmentDateTime = () => {

    return (
        <AppointmentContext.Consumer>
            {({
                selectedAppointment={}
            }) => {
                return <div className="mt-3 d-flex">
                    <i className="far fa-clock"></i>
                    <div className="ml-2">{moment(selectedAppointment.appointment_datetime).format('ddd, DD MMM YYYY, @hh:mm a')}</div>
                </div>
            }}
        </AppointmentContext.Consumer>

    )
}