import React from "react";
import { AppointmentContext } from "./../../../contexts/appoinment";
import { DisplayAppointmentAttendees } from './displayAppointmentAttendees';
import { DisplayInsuranceInfo } from "./displayInsuranceInfo";
import { DisplayAppointmentTitle } from './displayAppointmentTitle';
import { DisplayAppointmentDateTime } from './displayAppointmentDateTime';
import { DisplayAppointmentLocation } from "./displayAppointmentLocation";

export const AppointmentDetailsOnDblClick = () => {

    return (
        <AppointmentContext.Consumer>
            {({
                selectedAppointment = {}
            }) => {
                return <div>
                    <div className="p-2">
                        <DisplayAppointmentTitle />
                        <DisplayAppointmentDateTime />
                        <DisplayAppointmentLocation />
                        <div className="mt-4">
                            <b>Attendees</b>
                            <div className="mt-2">
                                <DisplayAppointmentAttendees />
                            </div>
                        </div>

                        {
                            'insurance_information' in selectedAppointment && Object.keys(selectedAppointment.insurance_information).length > 0 ?
                                <div className="mt-4">
                                    <b>Insurance Information</b>
                                    <DisplayInsuranceInfo />
                                </div> : null
                        }

                        <div className="mt-4">
                            <b>Comments</b>
                            <div className="mt-2 small">
                                {
                                    selectedAppointment.comments.length > 0 ?
                                        <div>{selectedAppointment.comments}</div> :
                                        <div className="text-muted">No additional comments provided</div>
                                }
                            </div>
                        </div>
                        
                        
                    </div>
                </div>
            }}
        </AppointmentContext.Consumer>

    )
}