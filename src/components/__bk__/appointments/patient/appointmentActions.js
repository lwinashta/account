import React, { useState, useContext, useEffect } from 'react';
import { AppointmentContext } from "../../../../contexts/appoinment";
import { Modal, ConfirmationBox } from "@oi/reactcomponents";
import { DisplayProviderProfilePic } from './displayProviderProfilePic';
import { DisplayProviderDemographics } from './displayProviderDemographics';
import { DisplayAppointmentLocation } from "./displayAppointmentLocation";
import { ViewFutureDaysAvailability } from '@oi/reactcomponents/appointment';

const moment = require('moment');

export const AppointmentActions = () => {

    const contextValues = useContext(AppointmentContext);

    const [cancelConfirmationBox, setCancelConfirmationBoxFlag] = useState(false);
    const [showProviderAvailability, setProviderAvailabilityFlag] = useState(false);

    const [provider, setProvider] = useState({});
    const [practiceUserInfo, setPracticeUserInfo] = useState({});

    const [rescheduleConfirmationBox,setRescheduleConfirmationBoxFlag]=useState(false);
    const [rescheduleSlot,setRescheduleSlot]=useState("");

    useEffect(() => {
        let appointment = contextValues.appointment;
        let hpAttendees = appointment.attendees.filter(a => a.user_type === "healthcare_provider");

        setProvider(hpAttendees.length > 0 ? appointment.attendeesInfo.filter(b => b._id === hpAttendees[0]._id)[0] : []);

    }, []);

    useEffect(() => {
        if (Object.keys(practiceUserInfo).length > 0) {
            setProviderAvailabilityFlag(true);
        }
    }, [practiceUserInfo]);

    useEffect(() => {
        if (!showProviderAvailability) {
            setPracticeUserInfo({});
        }
    }, [showProviderAvailability]);

    useEffect(()=>{
        if(!rescheduleConfirmationBox){
            setRescheduleSlot("");
        }
    },[rescheduleConfirmationBox])

    const handleCancelAppointment = (_id) => {

        popup.onScreen("Cancelling Appointment..");

        let data = {
            _id: _id,
            appointment_state: "canceled"
        };
        $.ajax({
            "url": "/appointments/update",
            "processData": false,
            "contentType": "application/json; charset=utf-8",
            "data": JSON.stringify(data),
            "method": "POST"
        }).then(response => {
            console.log(response);
            updateUserAppointments(data);

            popup.remove();
            popup.onBottomCenterSuccessMessage("Appointment Canceled");
        });
    }

    const getSelectedProviderInfo = () => {
        let appointment = contextValues.appointment;

        //get the facility user information for the selected practice 
        return $.ajax({
            "url": '/account/api/heathcarefacilityuser/getbyuserid',
            "processData": true,
            "contentType": "application/json; charset=utf-8",
            "data": {
                "user_mongo_id": provider._id
            },
            "method": "GET"
        }).then(response => {
            setPracticeUserInfo(response.filter(r => r.facilityId === appointment.facilityId)[0]);
        });
    }

    const handleRescheduleConfirmation=(slot)=>{
        setRescheduleSlot(slot);
        setRescheduleConfirmationBoxFlag(true);
    }

    const handleRescheduleAppointment=(_id)=>{
        popup.onScreen("Cancelling Appointment..");

        let data = {
            _id: _id,
            "appointment_datetime.$date": rescheduleSlot,
            "appointment_state":"pending"
        };
        $.ajax({
            "url": "/appointments/update",
            "processData": false,
            "contentType": "application/json; charset=utf-8",
            "data": JSON.stringify(data),
            "method": "POST"
        }).then(response => {

            //console.log(response);

            updateUserAppointments({
                _id: _id,
                "appointment_datetime": rescheduleSlot,
                "appointment_state":"pending"
            });

            setRescheduleConfirmationBoxFlag(false);
            setProviderAvailabilityFlag(false);

            popup.remove();
            popup.onBottomCenterSuccessMessage("Appointment Rescheduled");

        });
    }

    const updateUserAppointments = (params) => {
        let _d = [...contextValues.allAppointments];
        let indx = _d.findIndex(a => a._id === params._id);

        _d[indx] = Object.assign(_d[indx], params);

        //update the appointment info
        contextValues.setUserAppointments(_d);
    }

    return (
        <AppointmentContext.Consumer>
            {({ appointment = {},upcoming=false }) => {
                return <div>
                    {
                        upcoming && appointment.appointment_state !== "canceled" ? <div className="push-right d-flex t-0">
                            <div className="small text-primary btn-link rounded pl-2 pr-2 pt-1 pb-1 pointer" onClick={() => { getSelectedProviderInfo() }}>
                                <i className="far fa-clock align-middle"></i> Reschedule
                            </div>
                            <div className="ml-2 text-danger small btn-link rounded pl-2 pr-2 pt-1 pb-1 pointer" onClick={() => { setCancelConfirmationBoxFlag(true) }}><i className="fas fa-minus-circle align-middle"></i> Cancel</div>
                        </div> : null
                    }
                    {
                        cancelConfirmationBox ?
                            <ConfirmationBox>
                                <h4>Cancel Appointment</h4>
                                <div className="mt-2">Are you sure you would like to cancel your appointment with
                                    <span className="font-weight-bold ml-1">Dr. {provider.first_name} {provider.last_name} at {moment(appointment.appointment_datetime).format('DD MMM YYYY, hh:mm a')}?</span>
                                </div>
                                
                                <div className="small mt-2 text-muted"><span className="text-danger">Please note:</span> canceling or rescheduling too many appointments may result in
                                    your account being locked, and we hate to see that happen!
                                    This policy ensures that doctors’ calendars stay accurate and trustworthy for the other patients who depend on them
                                </div>

                                <div className="d-flex justify-content-end">
                                    <div className="btn-sm btn-danger pointer" onClick={() => { handleCancelAppointment(appointment._id) }}>Cancel Appointment</div>
                                    <div className="btn-sm btn-link ml-2 pointer" onClick={() => { setCancelConfirmationBoxFlag(false) }}>Close</div>
                                </div>

                            </ConfirmationBox> : null
                    }
                    {
                        showProviderAvailability ?
                            <Modal
                                onCloseHandler={() => { setProviderAvailabilityFlag(false) }}
                                header={<div>Reschedule Appointment</div>} >

                                <div>
                                    <div className="d-flex">
                                        <div><DisplayProviderProfilePic /> </div>
                                        <div className="align-top ml-2">
                                            <div className="pb-2">
                                                <DisplayProviderDemographics />
                                            </div>
                                            <div className="border-top pt-2">
                                                <DisplayAppointmentLocation />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-3">
                                        <ViewFutureDaysAvailability
                                            practiceUserInfo={practiceUserInfo}
                                            providerInfo={provider}
                                            appointments={practiceUserInfo.userInfo[0].appointments} 
                                            callbackOnSelect={handleRescheduleConfirmation} />
                                    </div>

                                </div>

                            </Modal> : null
                    }
                    {
                        rescheduleConfirmationBox ?
                            <ConfirmationBox>
                                <h4>Reschedule Appointment</h4>

                                <div className="mt-2">Are you sure you would like to reschedule your appointment with
                                    <span className="font-weight-bold ml-1">Dr. {provider.first_name} {provider.last_name} to {moment(rescheduleSlot).format('DD MMM YYYY, hh:mm a')}?</span>
                                </div>

                                <div className="mt-2">After appointment is rescheduled, 
                                    the appointement needs to be confirmed again by the provider. 
                                    Till the appointment is confirme the appointment will be in "Pending" state
                                </div>
                                
                                <div className="small mt-2 text-muted"><span className="text-danger">Please note:</span> canceling or rescheduling too many appointments may result in
                                    your account being locked, and we hate to see that happen!
                                    This policy ensures that doctors’ calendars stay accurate and trustworthy for the other patients who depend on them
                                </div>

                                <div className="d-flex justify-content-end">
                                    <div className="btn-sm btn-danger pointer" onClick={() => { handleRescheduleAppointment(appointment._id) }}>Confirm Reschedule</div>
                                    <div className="btn-sm btn-link ml-2 pointer" onClick={() => { setRescheduleConfirmationBoxFlag(false) }}>Close</div>
                                </div>

                            </ConfirmationBox> : null
                    }
                </div>

            }}
        </AppointmentContext.Consumer>

    )
}