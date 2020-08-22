import React, { useEffect, useState } from 'react';
import { DisplayAppointmentDetails } from "./displayAppointmentDetails";
import { AppointmentContext } from "./../../../contexts/appoinment";
import { uriManager } from "@oi/utilities/lib/js/uriManager";

const moment = require('moment');

export const DisplayPatientAppointments = ({ userInfo = {} }) => {

    const _uriManager = new uriManager();

    let uriParams=_uriManager.getUriParams(["tab"]);

    $('#app-right-pane-container').css({
        'background-color':'whitesmoke'
    });

    const [appLoader, setAppLoader] = useState(true);

    const [userAppointments, setUserAppointments] = useState([]);
    
    const [pastAppointments, setPastAppointments] = useState([]);
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
 
    const [specialties, setSpecialties] = useState([]);

    const [selectedMenu,setSelectedMenu]=useState(uriParams.tab!==null?uriParams.tab:'past-appointments');
    
    useEffect(() => {

        Promise.all([$.getJSON('/appointments/get/currentuser'),getAllSpecialties()]).then(values => {
            let appointments=values[0];
            if (appointments.length > 0) {

                console.log(appointments);

                let sortedAppointments=sortAppointments(appointments);

                setUserAppointments(sortedAppointments);
                setSpecialties(values[1]);
                
            } else {
                setAppLoader(false);
                popup.onBottomCenter(`<div>
                    <i className="fas fa-calendar-day"></i>
                    <span className="ml-2">No appointments found.</span>
                </div>`);
            }

        });

    }, []);

    useEffect(()=>{
        if(userAppointments.length>0){
            
            let pastUpcomingAppointments=getPastUpcomingAppointments(userAppointments);
            
            setPastAppointments(pastUpcomingAppointments.pastAppointments);
            setUpcomingAppointments(pastUpcomingAppointments.upcomingAppointments);

            setAppLoader(false);
                
        }
    },[userAppointments])

    const sortAppointments=(appoinments,desc=true)=>{
        return appoinments.sort(function(a,b){
            let aM=moment(a.appointment_datetime);
            let bM=moment(b.appointment_datetime);
            //console.log(aM.format(),bM.format(),aM.diff(bM));

            if(aM.diff(bM)>0){
                return desc?-1:1;
            }
            return desc?1:-1;
        });
    }

    /** Get Initial Data Specialties, Facilities  */
    const getAllSpecialties = () => {
        return $.getJSON('/healthcare/api/specialties/getall');
    }

    const getPastUpcomingAppointments=(appointments)=>{
        let upcomingAppointments=[];
        let pastAppointments=[];
        
        let td=moment();

        appointments.forEach((element) => {
            let dt=moment(element.appointment_datetime);

            if(dt.diff(td)>=0){
                upcomingAppointments.push(element);
            }else{
                pastAppointments.push(element);
            }

        });

        return {upcomingAppointments:upcomingAppointments,pastAppointments:pastAppointments}
    }

    const handleTabSelection=(name)=>{
        _uriManager.pushToHistory(_uriManager.setParamsInUri("tab",name));
        setSelectedMenu(name);
    }

    return (
        <div>
            {
                appLoader ?
                    <div className="mt-4 p-2 text-center">
                        <img src="/efs/core/images/core/loading.gif" style={{ width: "40px" }}></img>
                    </div> :
                    <div>
                        <div>
                            <div className="small d-flex">
                                <div className={`p-3 btn-link pointer position-relative ${selectedMenu==="past-appointments"?" appointment-menu-selected":""}`} 
                                    onClick={()=>{handleTabSelection("past-appointments")}}>
                                    <i className="fas fa-business-time"></i> Past Appointments
                                </div>
                                <div className={`p-3 ml-3 btn-link pointer position-relative ${selectedMenu==="upcoming-appointments"?" appointment-menu-selected":""}`}
                                    onClick={()=>{handleTabSelection("upcoming-appointments")}}>
                                    <i className="far fa-calendar-check"></i> Upcoming Appointments
                                </div>
                            </div>
                        </div>
                        <div className="position-absolute overflow-auto full-scr" style={{top:'55px'}}>
                            {
                                selectedMenu==="past-appointments"?
                                    <DisplayAppointmentDetails 
                                        appointments={pastAppointments} 
                                        allAppointments={userAppointments}
                                        setUserAppointments={setUserAppointments}
                                        specialties={specialties} 
                                        userInfo={userInfo} />:

                                selectedMenu==="upcoming-appointments"?
                                    <DisplayAppointmentDetails 
                                        appointments={sortAppointments(upcomingAppointments,false)} 
                                        upcoming={true} 
                                        allAppointments={userAppointments}
                                        setUserAppointments={setUserAppointments}
                                        specialties={specialties} 
                                        userInfo={userInfo} />:
                                null

                            }
                            
                        </div>
                    </div>
                }
        </div>
    )
}






