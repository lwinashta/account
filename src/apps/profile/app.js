import React, { useEffect, useState } from 'react';
import { UserInfo } from "./../../contexts/userInfo";
import { Demographics } from './demographics';
import { Insurance } from './manageInsurance';
import { Dependents } from './manageDependents';
import {ManageAboutMe} from './manageAboutMe';
import { ManageProviderQualification } from "./manageProviderQualification";
import { ManageProviderCertifications } from "./manageProviderCertifications";

export const App = () => {

    const [userInfo, setUserInfo] = useState({});
    const [appLoader, setAppLoader] = useState(true);

    const getUserInfo = () => {
        return $.post('/account/api/user/verifytoken')
    }

    const updateUserInfoContext = (info) => {
        let data = { ...userInfo };
        let updatedData = Object.assign(data, info);
        //console.log(updatedData);
        setUserInfo(updatedData);
    }

    //On Load 
    useEffect(() => {
        //Get user information
        getUserInfo().then(response => {
            console.log(response);
            setUserInfo(response);
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
                    <UserInfo.Provider value={{
                        userInfo: userInfo,
                        updateUserInfoContext: updateUserInfoContext
                    }}>
                        <div id="profile-container" className="container-fluid mt-3">
                            <div className="row">
                                <div className="col-sm-12 col-md-12 col-lg-6 col-xl-6">
                                    <div className="tile white-tile mb-2">
                                        <div className="mb-2">
                                            <Demographics />
                                        </div>
                                    </div>
                                    {
                                        'login_user_type' in userInfo && userInfo.login_user_type === 'healthcare_provider' ?
                                        <div className="tile white-tile mb-2">
                                            <h4>About Me</h4>
                                            <div className="small text-muted">
                                                Enter few sentences to describe yourself and your experience. 
                                                This information will be visible on your profile page.
                                            </div>
                                            <div>
                                                <ManageAboutMe />
                                            </div>
                                        </div>:null
                                    }
                                </div>
                                <div className="col-sm-12 col-md-12 col-lg-6 col-xl-6">
                                    {
                                        'login_user_type' in userInfo && userInfo.login_user_type === 'healthcare_provider' ?
                                            <div>
                                                <div className="tile white-tile mb-2">
                                                    <h4>Qualification Details</h4>
                                                    <ManageProviderQualification />
                                                </div>
                                                <div className="tile white-tile mb-2">
                                                    <h4>Certifications & Trainings</h4>
                                                    <ManageProviderCertifications />
                                                </div>
                                            </div> : null
                                    }
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
                                            </div>: null
                                    }
                                </div>
                            </div>
                        </div>

                    </UserInfo.Provider>

            }
        </div>
    );
}