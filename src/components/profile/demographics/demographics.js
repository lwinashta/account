import React, { useState, useEffect, useContext } from 'react';


// import { ManageEmail } from '../email/manageEmail';
// import { ManagePhoneNumbers } from "../phoneNumbers/managePhoneNumber";
// import { ManageAboutMe } from './aboutme/manageAboutMe';
// import { ProfilePic } from './profilePic/profilePic';

import { Name } from "./name/name";
import { ProfilePic } from "./profilePic/profilePic";
import { Gender } from './gender/gender';
import { BirthDate } from './birthDate/birthDate';


// import { getUserInfoFromCookieToken } from "account-manager-module/authentication/login/events/handleUserLogin";

// import { ManageAddresses } from "./manageAddresses";
// import { getUserProfilePictureUri } from "@oi/reactcomponents";
// import { Gender } from './Gender';
// import { ManageBirthDate } from './manageBirthDate';
// import { ManageLanguages } from './manageLanguages'


export const Demographics = () => {

    return (
        <div>
            
            <div className="border rounded bg-white my-2">
                <div className="h3 my-2 px-3 py-2">Basic Info</div>
                
                <div className="px-3 py-2 border-top field-container">
                    <Name />
                </div>

                <div className="px-3 py-2 border-top field-container">
                    <ProfilePic />
                </div>

                <div className="px-3 py-2 border-top field-container">
                    <Gender />
                </div>

                <div className="px-3 py-2 border-top field-container">
                    <BirthDate />
                </div>
                
            </div>

            <div className="border rounded bg-white my-2">
                <div className="h3 my-2 px-3 py-2">Contact Info</div>

            </div>

            

        </div>);
}