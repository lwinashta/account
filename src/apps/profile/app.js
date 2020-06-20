import React, { useEffect, useState } from 'react';
import { UserInfo } from "./../../contexts/userInfo";
import { Demographics } from './demographics';
import { Insurance } from './manageInsurance';
import { Dependents } from './manageDependents';
import {UpcomingAppointments} from './../appointments/upcomingAppointments';
import { ManageProviderQualification } from "./manageProviderQualification";

export const App = () => {

    const [userInfo,setUserInfo]=useState({});
    const [userProfileImageUrl,setUserProfileImageUri]=useState("");

    const getUserInfo=()=>{
        return $.post('/account/api/user/verifytoken')
    }

    const updateUserInfoContext=(info)=>{
        let data={...userInfo};
        let updatedData=Object.assign(data,info);
        //console.log(updatedData);
        setUserInfo(updatedData);
    }

    //On Load 
    useEffect(()=>{
        //Get user information
        getUserInfo().then(response=>{
            console.log(response);
            setUserInfo(response);

            let imageUri="/efs/core/images/core/noimage.png";

            if ('facebook_user_id' in response && 'personal_profile_image' in response) {
                imageUri=response.personal_profile_image.url;

            } else if(!('facebook_user_id' in response) && 'personal_profile_image' in response){
                imageUri=response.personal_profile_image[response.personal_profile_image.length-1].filename;
            }

            setUserProfileImageUri(imageUri);

        });

    },[]);

    return (
        <UserInfo.Provider value={{
            userInfo:userInfo,
            userProfileImageUrl:userProfileImageUrl,
            updateUserInfoContext:updateUserInfoContext
        }}>
            <div id="profile-container" className="container-fluid mt-3">
                <div className="row">
                    <div className="col-sm-12 col-md-12 col-lg-6 col-xl-6">
                        <div className="tile white-tile mb-2">
                            <div className="mb-2">
                                <Demographics />
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-12 col-md-12 col-lg-6 col-xl-6">
                        {
                            'login_user_type' in userInfo && userInfo.login_user_type === 'healthcare_provider'?
                                <div className="tile white-tile mb-2">
                                    <h4>Qualification</h4>
                                    <p className="small mb-2 text-muted font-weight-bold">
                                        Adding your <b className="text-danger">incorrect</b> qualification details will delay processing time in validating your qualification. 
                                        Also, without all the qualification details your account will <b>NOT</b> be visible to users while searching healthcare provider for appointments.
                                    </p>
                                    <ManageProviderQualification />
                                </div>:null
                        }
                        <div className="tile white-tile mb-2">
                            <h4>My Upcoming Appointments</h4>
                            <UpcomingAppointments></UpcomingAppointments>
                        </div>
                        {
                            'login_user_type' in userInfo && userInfo.login_user_type === 'patient' ?
                                <div>
                                    <div className="tile white-tile mb-2">
                                        <h4>My Insurance</h4>
                                        <Insurance />
                                    </div>
                                    <div className="tile white-tile mb-2">
                                        <h4>My Dependents</h4>
                                        <Dependents />
                                    </div>
                                </div>
                                : ""
                        }
                    </div>
                </div>
            </div>

        </UserInfo.Provider>
    );
}