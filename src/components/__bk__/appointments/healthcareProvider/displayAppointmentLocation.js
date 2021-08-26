import React from "react";
import { AppointmentContext } from "../../../../contexts/appoinment";
import { DisplayPracticeAddress } from "@oi/reactcomponents/provider-practice";

export const DisplayAppointmentLocation = () => {

    return (
        <AppointmentContext.Consumer>
            {({
                selectedAppointment={}
            }) => {
                return <div className="d-flex mt-3">
                    <i className="fas fa-map-marker-alt align-top"></i>
                    <div className="ml-2">
                        <div>{selectedAppointment.facilityInfo[0].medical_facility_name}</div>
                        <div className="small text-muted">
                            <DisplayPracticeAddress address={selectedAppointment.facilityInfo[0]} />
                        </div>
                    </div>
                </div>
            }}
        </AppointmentContext.Consumer>

    )
}