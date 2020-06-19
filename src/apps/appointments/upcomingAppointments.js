import React, { useEffect } from "react";

export const UpcomingAppointments=()=>{
    useEffect(()=>{
        $.getJSON('/appointments/get/currentUser').then(appointments=>{
            console.log(appointments);
        })
    },[]);

    return (<div>Appointments</div>)

}