import React from 'react';
import { AppointmentContext } from "./../../../contexts/appoinment";
import { DisplayPracticeAddress } from "@oi/reactcomponents/provider-practice";

export const DisplayAppointmentLocation = () => {

    return (<AppointmentContext.Consumer>
        {({appointment={}})=>{
            //console.log(appointment);
            let facilityInfo=appointment.facilityInfo[0];
            return <div className="d-flex">
                <i className="fas fa-map-marker-alt align-top"></i>
                <div className="ml-2">
                    <div>{facilityInfo.medical_facility_name}</div>
                    <div className="small text-muted">
                        <DisplayPracticeAddress address={facilityInfo} />
                    </div>
                </div>
            </div>
        }}
    </AppointmentContext.Consumer>
    )
}