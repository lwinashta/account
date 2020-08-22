import React, { useState } from 'react';
import { AppointmentContext } from "./../../../contexts/appoinment";
import { ProviderContext } from "./../../../contexts/provider";
import { DisplayProviderProfilePic } from "./displayProviderProfilePic";
import { DisplayProviderDemographics } from "./displayProviderDemographics";
import { ManageProviderReviews } from './manageProviderReviews';
import { DisplayAppointmentComments } from "./displayAppointmentComments";
import { DisplayAppointmentLocation } from './displayAppointmentLocation';
import { AppointmentActions } from './appointmentActions';

//*** Global Varibales */
window.providerReviews=[];
window.userEnteredReviews=[];

export const DisplayAppointmentDetails = ({ appointments = [], upcoming = false, specialties = [], setUserAppointments={},allAppointments=[],userInfo={} }) => {

    return (<div className="mt-2">
        {
            appointments.length > 0 ?
                <div className="appointment-details-outer-container">
                    {
                        appointments.map((appointment, indx) => {
                            return <div key={indx} className="position-relative mt-4 mb-3">
                                <div className="appointment-dot-marker"></div>
                                <div className="appointment-datetime">{moment(appointment.appointment_datetime).format('DD MMM YYYY, hh:mm a')}</div>
                                <div className="p-3 bg-white rounded border appointment-details-inner-container">
                                    <AppointmentContext.Provider key={appointment._id} value={{
                                        appointment: appointment,
                                        specialties: specialties,
                                        setUserAppointments:setUserAppointments,
                                        allAppointments:allAppointments,
                                        userInfo:userInfo,
                                        upcoming:upcoming
                                    }}>
                                        <div className="position-relative" key={indx}>
                                            {
                                               appointment.attendees.filter(a => a.user_type === "healthcare_provider").map((att, indx) => {
                                                    let provider = appointment.attendeesInfo.filter(b => b._id === att._id)[0];
                                                    return <ProviderContext.Provider key={indx} value={{
                                                        provider:provider
                                                    }}>
                                                        <div className="provider-profile-pic">
                                                            <DisplayProviderProfilePic />
                                                        </div>

                                                        <div className="mt-1 provider-demographics-details">
                                                            <div className="pb-2 border-bottom position-realtive">
                                                                <DisplayProviderDemographics />
                                                                <ManageProviderReviews />
                                                                <AppointmentActions />
                                                            </div>
                                                            <div className="pt-2 pb-2 border-bottom">
                                                                <DisplayAppointmentLocation />
                                                            </div>
                                                            {
                                                                appointment.comments.length > 0 ?
                                                                    <div className="pt-2 pb-2 border-bottom">
                                                                        <DisplayAppointmentComments />
                                                                    </div> : null
                                                            }

                                                        </div>

                                                    </ProviderContext.Provider>
                                               }) 
                                            }
                                        </div>
                                    </AppointmentContext.Provider>
                                </div>
                            </div>

                        })
                    }
                </div> :
                <div className="mt-2 text-center">
                    <div className="mt-2 med-img mx-auto">
                        <img src="/src/images/clock.png" />
                    </div>
                    <div className="mt-2 h4 text-muted font-weight-bold">
                        No appointments found.
                    </div>
                </div>

        }
    </div>
    )
}