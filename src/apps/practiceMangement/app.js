import React, { useEffect, useState } from 'react';
import { UserInfo } from "./../../contexts/userInfo";

export const App = () => {

    const [userInfo,setUserInfo]=useState({});
    const [userPractices,setUserPractices]=useState([]);
    const [showPracticeEntryForm,setShowPracticeEntryFormFlag]=useState(false);
    const [userProfileImageUrl,setUserProfileImageUri]=useState("");

    const getUserInfo=()=>{
        return $.post('/account/api/user/verifytoken')
    }

    const getUserPractices=(userId)=>{

        return $.ajax({
            "url": '/account/api/heathcarefacilityuser/getbyuserid',
            "processData": true,
            "contentType": "application/json; charset=utf-8",
            "data": {
                "user_mongo_id": userId
            },
            "method": "GET"
        });
    }

    //On Load 
    useEffect(()=>{
        //Get user information
        getUserInfo().then(response=>{
            console.log(response);
            setUserInfo(response);

            return getUserPractices(response._id);

        }).then(practiceResponse=>{
            console.log(practiceResponse);
            setUserPractices(practiceResponse);
        });

    },[]);

    return (
        <UserInfo.Provider value={{
            userInfo:userInfo
        }}>
            <div id="profile-container" className="container-fluid mt-3">

            </div>
        </UserInfo.Provider>
    );
}