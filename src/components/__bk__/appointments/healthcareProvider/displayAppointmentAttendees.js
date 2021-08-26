import React from "react";
import { getUserProfilePictureUri } from "@oi/reactcomponents";
import { AppointmentContext } from "../../../../contexts/appoinment";

export const DisplayAppointmentAttendees = () => {

    return (
        <AppointmentContext.Consumer>
            {({
                selectedAppointment = {},
                userInfo = {}
            }) => {
                return <div>
                    {
                        selectedAppointment.attendeesInfo.map(attendee => {
                            let attendeeLookup = selectedAppointment.attendees.filter(a => a._id === attendee._id);
                            //console.log(attendeeLookup,selectedAppointment.attendees,attendee._id);
                            if (attendee._id !== userInfo._id) {//attendee id is not the user who is viewing then render the view
                                return <div className="d-flex mt-2 pt-2 pb-2 border-bottom" key={attendee._id}>
                                    <div className="sm-img">
                                        <img className="rounded-circle" src={getUserProfilePictureUri(attendee, true)} />
                                    </div>
                                    <div className="ml-2">
                                        <div>{attendee.first_name} {attendee.last_name} {attendeeLookup.length > 0 ? <span className="text-capitalize">({attendeeLookup[0].user_type.replace(/\_/g, " ")})</span> : ""}</div>
                                        {
                                            attendeeLookup.length > 0 && 'user_contact_info' in attendeeLookup[0] ?
                                                <div className="text-muted small">
                                                    <i className="fas fa-phone-alt"></i>
                                                    <span>({attendeeLookup[0].user_contact_info.dial_code}){attendeeLookup[0].user_contact_info.contact_number}</span>
                                                </div> : null
                                        }
                                    </div>
                                </div>
                            }
                        })
                    }
                    {
                        selectedAppointment.dependentInfo.map(dependent => {
                            //console.log(selectedAppointment);
                            let attendeeLookup = selectedAppointment.attendees.filter(a => a._id === dependent._id);
                            return <div className="d-flex mt-2 pt-2 pb-2 border-bottom" key={dependent._id}>
                                <div className="sm-img">
                                    <img className="rounded-circle" src={getUserProfilePictureUri(dependent, true)} />
                                </div>
                                <div className="ml-2">
                                    <div>{dependent.first_name} {dependent.last_name} {attendeeLookup.length > 0 ? <span className="text-capitalize">({attendeeLookup[0].user_type.replace(/\_/g, " ")})</span> : ""}</div>
                                    <div className="text-muted small">
                                        <div> Dependent of {
                                            selectedAppointment.organizersInfo.filter(o => o._id === dependent.user_mongo_id).map(dependentTo => {
                                                return <b key={dependentTo._id}>{dependentTo.first_name} {dependentTo.last_name}</b>
                                            })
                                        }</div>
                                        <div>Relation: <b>{dependent.relation}</b></div>
                                    </div>
                                </div>
                            </div>
                        })
                    }
                </div>
            }}
        </AppointmentContext.Consumer>

    )
}