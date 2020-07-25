import React, { useEffect, useState, useContext } from 'react';
import { AppointmentContext } from "./../../contexts/appoinment";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Modal } from '@oi/reactcomponents';
import { AppointmentDetailsOnDblClick } from './appointmentDetailsOnDblClick';
import {AppointmentDetailsOnClick} from './appointmentDetailsOnClick';
import { DisplayPracticeAddress } from "@oi/reactcomponents/provider-practice";
import DatePicker from "react-datepicker";
import * as handlers from './methods';

const moment = require('moment');

export const DisplayPatientAppointments = ({ userInfo = {} }) => {

    const [appLoader, setAppLoader] = useState(true);

    const [userAppointments, setUserAppointments] = useState([]);//Events for full details 
    const [userFullCalendarEvents, setUserFullCalendarEvents] = useState([]);//Events for full calendar
    
    const [selectedAppointment, setSelectedAppointment] = useState({});
    
    const [showAppointmentDetailsModalOnDblClick, setAppointmentDetailModalOnDblClickFlag] = useState(false);
    const [showAppointmentDetailsModalOnClick, setAppointmentDetailModalOnClickFlag] = useState(false);
    
    const [weekendsVisible, setWeekendsVisible] = useState(true);

    const [datePickerStartDate, setDatePickerStartDate] = useState(new Date());
    const [datePickerEndDate, setDatePickerEndDate] = useState(null);

    const [selectedDate, setSelectedDate] = useState(new Date());

    const [selectedFullCalendarEvent, setSelectedFullCalendarEvent] = useState({});

    const [userProviders,setUserProviders]=useState([]);
    const [selectedUserProvider,setSelectedUserProvider]=useState([]);

    const fullCalendarRef = React.createRef();

    useEffect(() => {

        $.getJSON('/appointments/get/currentuser').then(appointments => {
            let events = [];

            if (appointments.length > 0) {

                //get user providers 
                let providers=getHealthcareProviders(appointments);
                console.log(providers);

                events = appointments.reduce((acc, ci) => {
                    let _hpId=ci.attendees.filter(a=>a.user_type==="healthcare_provider")[0]._id;
                    acc.push(handlers.getEachCalendarEventObject(ci,providers.filter(p=>p._id===_hpId)[0].color));
                    return acc;
                }, []);

                //console.log(appointments);

                setUserAppointments(appointments);
                setUserFullCalendarEvents(events);
                setUserProviders(providers);
                setAppLoader(false);
                
            } else {
                setAppLoader(false);
                popup.onBottomCenter(`<div>
                    <i className="fas fa-calendar-day"></i>
                    <span className="ml-2">No appointments found.</span>
                </div>`);
            }

        });

    }, []);

    useEffect(() => {
        if (!showAppointmentDetailsModalOnDblClick && !showAppointmentDetailsModalOnClick) {
            setSelectedAppointment({});
        }
    }, [showAppointmentDetailsModalOnDblClick,showAppointmentDetailsModalOnClick]);

    const showAppointmentDetailsOnDblClick=(clickedItem)=>{
        //console.log(clickedItem);
        //console.log(userAppointments, userAppointments.filter(a => a._id === clickedItem.event.id)[0]); 
        setSelectedAppointment(userAppointments.filter(a => a._id === clickedItem.event.id)[0]);   
        setAppointmentDetailModalOnDblClickFlag(true);
    }
    
    const showAppointmentDetailsOnClick=(clickedItem)=>{
        //console.log(clickedItem);
        setSelectedFullCalendarEvent(clickedItem);
        setSelectedAppointment(userAppointments.filter(a => a._id === clickedItem.event.id)[0]);   
        setAppointmentDetailModalOnClickFlag(true);
    }

    const getHealthcareProviders=(appts)=>{

        let providers=appts.reduce((acc,ci)=>{
            let _hpInfo=ci.attendees.filter(a=>a.user_type==="healthcare_provider").map(att=>{
                let _hp=ci.attendeesInfo.filter(a=>a._id===att._id)[0];
                console.log(COLORSCHEME,acc.length-1);
                if(acc.filter(_b=>_b._id===_hp._id).length===0){
                    return {
                        first_name:_hp.first_name,
                        last_name:_hp.last_name,
                        _id:_hp._id,
                        facilityInfo:ci.facilityInfo,
                        color:COLORSCHEME[acc.length]
                    }
                }else{
                    return [];
                }
                
            })[0];
            acc=acc.concat(_hpInfo);
            return acc;
        },[]);

        return providers;
        
    }

    return (
        <div className="mt-2 p-2 mb-2">
            {
                appLoader ?
                    <div className="mt-2 p-2 text-center">
                        <img src="/efs/core/images/core/loading.gif" style={{ width: "40px" }}></img>
                    </div> :
                    <AppointmentContext.Provider value={{
                        selectedAppointment: selectedAppointment,
                        userAppointments:userAppointments,
                        selectedDate: selectedDate,
                        userInfo: userInfo,
                        setSelectedAppointment:setSelectedAppointment,
                        setUserAppointments:setUserAppointments
                    }} >
                        <div>
                            <div className="inner-left-pane">
                                <div className="p-2">
                                    <div className="h4 mt-2">
                                        {moment().format('ddd DD MMM,YYYY')}
                                    </div>
                                    <div className="mt-4">
                                        <DatePicker
                                            selected={selectedDate}
                                            startDate={datePickerStartDate}
                                            endDate={datePickerEndDate}
                                            onChange={date => handlers.handleDatePickerChange(date, fullCalendarRef, setSelectedDate)}
                                            inline
                                        />
                                    </div>
                                    <div className="mt-2">
                                        <div className="font-weight-bold">My Providers</div>
                                        <div className="small mt-1">
                                            {
                                                userProviders.length>0?
                                                userProviders.map((provider,indx)=>{
                                                    let cbClassNames="colored-checkbox ";
                                                    cbClassNames+=selectedUserProvider.indexOf(provider._id)>-1?" checked ":"";
                                                    return <div key={provider._id} className="d-flex pt-1 pb-1 pointer" >
                                                        <div className={cbClassNames} style={{backgroundColor:provider.color}}></div>
                                                        <div>
                                                            <div>{provider.first_name} {provider.last_name}</div>
                                                            <div className="small text-muted"><DisplayPracticeAddress address={provider.facilityInfo[0]} /></div>
                                                        </div>
                                                    </div>
                                                }):
                                                <div className="mt-2 text-muted">No providers found</div>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="inner-right-pane">
                                <div className="p-2">
                                    <FullCalendar
                                        ref={fullCalendarRef}
                                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                        headerToolbar={{
                                            left: 'prev,next today',
                                            center: 'title',
                                            right: 'dayGridMonth,timeGridWeek,timeGridDay'
                                        }}
                                        initialDate={selectedDate}
                                        initialView="dayGridMonth"
                                        weekends={weekendsVisible}
                                        editable={true}
                                        //initialEvents={userFullCalendarEvents}
                                        events={userFullCalendarEvents}
                                        eventClick={(clickedItem) => { handlers.handleFullCalendarEventDblClick(clickedItem,showAppointmentDetailsOnClick,showAppointmentDetailsOnDblClick) }}
                                    />
                                </div>
                            </div>
                            {
                                showAppointmentDetailsModalOnDblClick ?
                                <Modal header={<h4>Appointment Details</h4>}
                                    onCloseHandler={() => { setAppointmentDetailModalOnDblClickFlag(false) }}>
                                    <AppointmentDetailsOnDblClick />
                                </Modal> : null
                            }
                            {
                                showAppointmentDetailsModalOnClick?
                                    <AppointmentDetailsOnClick 
                                        clickedEvent={selectedFullCalendarEvent} 
                                        onCloseHandler={()=>{setAppointmentDetailModalOnClickFlag(false)}} />:
                                null
                            }
                        </div>
                    </AppointmentContext.Provider>
            }


        </div>

    )
}