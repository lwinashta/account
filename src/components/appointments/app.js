import React, { useEffect, useState } from 'react';
import { DisplayPatientAppointments } from "./patient/displayPatientAppointments";
import { DisplayHealthcareProviderAppointments } from "./healthcareProvider/displayHealthcareProviderAppointments";
import "react-datepicker/dist/react-datepicker.css";

export const App = () => {

    const [appLoader, setAppLoader] = useState(true);
    const [userInfo, setUserInfo] = useState({});

    useEffect(() => {

        $.post('/account/api/user/verifytoken').then(user => {
            setUserInfo(user);

        }).catch(err => {
            popup.onBottomCenterErrorOccured("Error initalizing the data");
        });

    }, []);

    useEffect(()=>{
        if(Object.keys(userInfo).length>0){
            setAppLoader(false);
        }
    },[userInfo])

    return (
        <div>
            {
                appLoader ?
                    <div className="mt-2 p-2 text-center">
                        <img src="/efs/core/images/core/loading.gif" style={{ width: "40px" }}></img>
                    </div> :
                    <div>
                       {
                        userInfo.login_user_type==="patient"?
                            <div className="bg-white mb-2" style={{borderBottom:"1px solid lightgrey"}}><DisplayPatientAppointments userInfo={userInfo} /></div>:
                            <div className="mt-2 p-2 mb-2"><DisplayHealthcareProviderAppointments userInfo={userInfo} /></div>
                        } 
                    </div>
                    
            }


        </div>

    )
}