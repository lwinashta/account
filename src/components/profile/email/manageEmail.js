import React, { useContext, useEffect, useState } from 'react';

import { executeLogoutSteps } from "account-manager-module/lib/auth/logout/handlers";

import { AppContext } from "../../AppContext";
import UpdateEmailform from './updateEmailForm';
import VerifyOTPForm from './../otp/vertifyOtpForm';

export const ManageEmail = () => {

    let AppLevelContext = useContext(AppContext);

    const [displayUpdateEmailForm, setDisplayUpdateEmailForm] = useState(false);
    const [showVerifyOTPForm, setVerifyOTPFormFlag] = useState(false);
    const [updatedEmailId, setUpdatedEmaiId] = useState("");

    useEffect(()=>{
        //show the otp form as soon email if updated. 
        if(updatedEmailId.length>0) {
            setVerifyOTPFormFlag(true);
            AppLevelContext.removeOnScreenLoader();
        };
    },[updatedEmailId]);

    const updateEmailId = () => {

        AppLevelContext.setOnScreenLoader({
            "show":true,
            "message":"Code verified. Updating email"
        });

        let data = {
            emailId: updatedEmailId,
            _id: AppLevelContext.userInfo._id
        }

        fetch('/account/api/user/update',{
            method:"POST",
            body:JSON.stringify(data),
            headers:{
                "content-type": "application/json"
            }
        })
        .then(response=>response.json())
        .then(data=>{
            console.log(data);
            executeLogoutSteps();//user will be navigated to login screen once logged out
        })
        .catch(err=>{
            console.log(err);
            alert("There has been issue in updating the email id. Please try again");
        })
    }

    return (
        <>
            {
                AppLevelContext.userInfo.emailId !== null ?
                    <div className="d-flex flex-row justify-content-between">
                        
                        <div className="text-lower">
                            <div>{AppLevelContext.userInfo.emailId}</div>
                            {
                                AppLevelContext.userInfo.isFacebookUser || AppLevelContext.userInfo.isGoogleUser ?
                                    <div className="small text-muted">
                                        {AppLevelContext.userInfo.isFacebookUser ? "Facebook" : "Google"} account users cannot update their email address.
                                            Please visit {AppLevelContext.userInfo.isFacebookUser ? "Facebook" : "Google"} to change your email address.
                                            </div> : null
                            }
                            <div className="text-muted">Email</div>
                        </div>

                        {
                            !(AppLevelContext.userInfo.isFacebookUser) && !(AppLevelContext.userInfo.isGoogleUser) ?
                                <div className="icon-button" onClick={() => { setDisplayUpdateEmailForm(true) }}>
                                    <i className="fas fa-pencil-alt"></i>
                                </div> : null
                        }

                    </div>
                    : null
            }

            {
                displayUpdateEmailForm ?
                    <UpdateEmailform 
                        onCloseHandler={setDisplayUpdateEmailForm}
                        setUpdatedEmaiId={setUpdatedEmaiId} /> : null
            }
            {
                showVerifyOTPForm ?
                    <VerifyOTPForm 
                        contactInfo={updatedEmailId}
                        verificationNumber={AppLevelContext.userInfo.verificationNumber}
                        onCloseHandler={setVerifyOTPFormFlag}
                        afterSuccessfullVerification={updateEmailId} />:
                    null
            }
        </>
    )
}