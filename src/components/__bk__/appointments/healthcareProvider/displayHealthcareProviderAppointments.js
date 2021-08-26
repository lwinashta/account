import React, { useEffect, useState, useContext } from 'react';
import { AppointmentContext } from "../../../../contexts/appoinment";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Modal } from '@oi/reactcomponents';
import { AppointmentDetailsOnDblClick } from './appointmentDetailsOnDblClick';
import {AppointmentDetailsOnClick} from './appointmentDetailsOnClick';
import DatePicker from "react-datepicker";
import * as handlers from '../common/methods';

const moment = require('moment');

export const DisplayHealthcareProviderAppointments = ({ userInfo = {} }) => {

    $('#app-right-pane-container').css({
        'background-color':'white'
    });

    const [appLoader, setAppLoader] = useState(true);

    const [userAppointments, setUserAppointments] = useState([]);//Events for full details 
    const [userFullCalendarEvents, setUserFullCalendarEvents] = useState([]);//Events for full calendar
    
    const [selectedAppointment, setSelectedAppointment] = useState({});

    const [showAppointmentDetailsModalOnDblClick, setAppointmentDetailModalOnDblClickFlag] = useState(false);
    const [showAppointmentDetailsModalOnClick, setAppointmentDetailModalOnClickFlag] = useState(false);
    
    const [weekendsVisible, setWeekendsVisible] = useState(true);

    const [userPractices, setUserPractices] = useState([]);
    const [userPracticeFacilites, setUserPracticeFacilities] = useState([]);
    const [selectedUserPracticeFacility,setSelectedUserPracticeFacility]= useState([]);

    const [datePickerStartDate, setDatePickerStartDate] = useState(new Date());
    const [datePickerEndDate, setDatePickerEndDate] = useState(null);

    const [selectedDate, setSelectedDate] = useState(new Date());

    const [selectedFullCalendarEvent, setSelectedFullCalendarEvent] = useState({});

    const fullCalendarRef = React.createRef();

    //Triggers after userifo is fetched
    useEffect(() => {
        Promise.all([$.getJSON('/appointments/get/currentuser'), 
        handlers.getUserPractices(userInfo._id)]).then(values => {

            let appointments = values[0];
            let practices=values[1];
            let events=[];

            let facilities=practices.reduce((acc,ci,indx)=>{
                let info=ci.facilityInfo[0];
                info.color=COLORSCHEME[indx];
                acc.push(info);
                return acc;
            },[]);

            if (appointments.length > 0) {
                
                events = appointments.reduce((acc, ci) => {
                    acc.push(handlers.getEachCalendarEventObject(ci,facilities.filter(f => f._id === ci.facilityId)[0].color));
                    return acc;
                }, []);

                //console.log(events);

            } else {
                popup.onBottomCenter(`<div>
                    <i className="fas fa-calendar-day"></i>
                    <span className="ml-2">No appointments found.</span>
                </div>`);
            }

            setUserPractices(practices);
            setUserPracticeFacilities(facilities);
            setSelectedUserPracticeFacility(facilities.reduce((acc,ci)=>{
                acc.push(ci._id);
                return acc;
            },[]));
            setUserFullCalendarEvents(events);//Events for full calendar
            setUserAppointments(appointments);//Events for full details 
            setAppLoader(false);
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

    const handlePracticeClick=(facilityId)=>{
        let _d=[...selectedUserPracticeFacility];
        let indx=selectedUserPracticeFacility.findIndex(f=>f===facilityId);

        if(indx>-1){//User is unselecting the item
            _d.splice(indx,1);

            //remove the items from the caledar Eevnts 
            removeItemsFromCalendarEvents(facilityId);

        }else{
            _d.push(facilityId);

            //add events to the calendar events 
            addItemsToCalendarEvents(facilityId);
        }

        setSelectedUserPracticeFacility(_d);
        
    }

    const addItemsToCalendarEvents=(facilityId)=>{
        let _d=[...userFullCalendarEvents];
        let getEvents=userAppointments.filter(c=>c.facilityId===facilityId).reduce((acc,ci)=>{
            acc.push(handlers.getEachCalendarEventObject(ci,userPracticeFacilites.filter(f => f._id === ci.facilityId)[0].color));
            return acc;
        },[]);

        setUserFullCalendarEvents(_d.concat(getEvents));
    }

    const removeItemsFromCalendarEvents=(facilityId)=>{
        let _d=[...userFullCalendarEvents];

        //get all the vents where facility is NOT equal to clicked practice
        _d=_d.filter(c=>c.extendedProps.facilityId!==facilityId);
        setUserFullCalendarEvents(_d);
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
                                        <div className="font-weight-bold">My Practices</div>
                                        <div className="small mt-1">
                                            {
                                                userPracticeFacilites.length>0?
                                                userPracticeFacilites.map((facility,indx)=>{
                                                    let cbClassNames="colored-checkbox ";
                                                    cbClassNames+=selectedUserPracticeFacility.indexOf(facility._id)>-1?" checked ":"";
                                                    return <div key={facility._id} className="d-flex pt-1 pb-1 pointer" 
                                                        onClick={()=>{handlePracticeClick(facility._id)}}>
                                                        <div className={cbClassNames} style={{backgroundColor:facility.color}}></div>
                                                        <div>{facility.medical_facility_name}</div>
                                                    </div>
                                                }):
                                                <div className="mt-2 text-muted">No Practice found</div>
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