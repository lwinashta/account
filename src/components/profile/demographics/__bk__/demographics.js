import React, { useState, useEffect, useContext } from 'react';

import { useGetUserProfilePic } from "account-manager-module/lib/user/profile/pic/useGetUserProfilePic";

import { AppContext } from "../../AppContext";
import { ManageEmail } from '../email/manageEmail';
import { ManagePhoneNumbers } from "../phoneNumbers/managePhoneNumber";
import { ManageAboutMe } from './aboutme/manageAboutMe';
import { ManageBirthDate } from './birthdate/ManageBirthDate';
import { ManageGender } from './gender/manageGender';
import { ProfilePic } from './profilePic/profilePic';

// import { getUserInfoFromCookieToken } from "account-manager-module/authentication/login/events/handleUserLogin";

// import { ManageAddresses } from "./manageAddresses";
// import { getUserProfilePictureUri } from "@oi/reactcomponents";
// import { ManageGender } from './manageGender';
// import { ManageBirthDate } from './manageBirthDate';
// import { ManageLanguages } from './manageLanguages'

const styles = {
    profileImage: {
        width: "100%",
        height: "100%",
        margin: "0 auto",
        borderRadius: "50%",
        position: "relative",
        lineHeight: "100px",
        backgroundColor: "dodgerblue",
        color: "white"
    }
}

export const Demographics = () => {

    let AppLevelContext = useContext(AppContext);

    return (
        <div>
            
            <div className="border rounded">
                <div className="h3 my-2 p-2">Basic Info</div>
                <div className="p-2 border-top">
                    
                </div>
                <div className="p-2 border-top">
                    <ProfilePic />
                </div>
                
                
            </div>

            <div className="mt-4 text-center">
                <h4 className="text-capitalize">Welcome, {AppLevelContext.userInfo.firstName} {AppLevelContext.userInfo.lastName}</h4>
            </div>

            <div className="mt-2 p-2 border-bottom d-flex flex-row align-items-top">
                <div className="mr-2">
                    <i className="far fa-envelope"></i>
                </div>
                <div style={{flexGrow:2}}>
                    <ManageEmail />
                </div>
            </div>

            <div className="mt-2 p-2 border-bottom d-flex flex-row align-items-top">
                <div className="mr-2">
                    <i className="fas fa-phone-alt"></i>
                </div>
                <div style={{flexGrow:2}}>
                    <ManagePhoneNumbers />
                </div>
            </div>

            <div className="mt-2 p-2 border-bottom d-flex flex-row align-items-top">
                <div className="mr-2">
                    <i className="far fa-address-card"></i>
                </div>
                <div style={{flexGrow:2}}>
                    <ManageAboutMe />
                </div>
            </div>

            <div className="mt-2 p-2 border-bottom d-flex flex-row align-items-top">
                <div className="mr-2">
                    <i class="fas fa-birthday-cake"></i>
                </div>
                <div style={{flexGrow:2}}>
                    <ManageBirthDate />
                </div>
            </div>

            <div className="mt-2 p-2 border-bottom d-flex flex-row align-items-top">
                <div className="mr-2">
                    <i class="fas fa-venus-mars"></i>
                </div>
                <div style={{flexGrow:2}}>
                    <ManageGender />
                </div>
            </div>

        </div>);
}