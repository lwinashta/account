import React, { useEffect, useState } from 'react';
import { UserInfo } from "./../../contexts/userInfo";
import { Demographics } from './demographics';
import { Insurance } from './manageInsurance';
import { Dependents } from './manageDependents';

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
            //console.log(response);
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
                        'user_type' in userInfo && userInfo.user_type.indexOf('patient') > -1 ?
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
                    <div className="tile white-tile mb-2">
                        <h4>My Upcoming Appointments</h4>
                        <div>Test</div>
                    </div>
                </div>
            </div>
        </div>
    
        </UserInfo.Provider>
    );
}