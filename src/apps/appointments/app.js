import React, { useEffect, useState } from 'react';
import { DisplayPatientAppointments } from "./displayPatientAppointments";
import { DisplayHealthcareProviderAppoiintments } from "./displayHealthcareProviderAppointments";
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
        <div className="mt-2 p-2 mb-2">
            {
                appLoader ?
                    <div className="mt-2 p-2 text-center">
                        <img src="/efs/core/images/core/loading.gif" style={{ width: "40px" }}></img>
                    </div> :
                    <div>
                       {
                        userInfo.login_user_type==="patient"?
                            <DisplayPatientAppointments userInfo={userInfo} />:
                            <DisplayHealthcareProviderAppoiintments userInfo={userInfo} />
                        } 
                    </div>
                    
            }


        </div>

    )
}