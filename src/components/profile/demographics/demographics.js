import React, { useState, useEffect, useContext } from 'react';

import { useGetUserProfilePic } from "account-manager-module/lib/user/profile/pic/useGetUserProfilePic";

import { AppContext } from "../../AppContext";
import { ManageEmail } from '../email/manageEmail';
import { ManagePhoneNumbers } from "../phoneNumbers/managePhoneNumber";
import { ManageAboutMe } from './aboutme/manageAboutMe';
import { ManageBirthDate } from './birthdate/ManageBirthDate';
import { ManageGender } from './gender/manageGender';

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

    const profilePic = useGetUserProfilePic(AppLevelContext.userInfo);

    //Upload pictures only allows one picture upload 
    const uploadProfilePicture = (e) => {

        e.preventDefault();
        e.stopPropagation();

        console.log(e.target.files);

        let files = e.target.files;

        //console.log(files);
        let fileData = new FormData();

        $.each(files, function (indx, file) {
            fileData.append(`userProfilePic-${indx}`, file);
        });

        fileData.append("linkedMongoId", AppLevelContext.userInfo._id);
        fileData.append("linkedDatabaseName", "accounts");
        fileData.append("linkedCollectionName", "users");

        fetch('/g/uploadfiles', {
            "method": "PUT",
            body: fileData
        })
            .then(response => response.json())
            .then(result => {
                console.log(result);
                return AppLevelContext.resetUserInformation(); //reset user Information

            }).then(userResponse => {
                console.log(userResponse);

            }).catch(error => {
                console.error(error);
            });

    }

    return (
        <div>
            <div className="text-center">
                <div className="mt-2 mx-auto position-relative text-center" style={{ width: '100px', 'height': '100px' }}>
                    <div style={styles.profileImage}>

                        {
                            profilePic === null ?
                                <div style={{ fontSize: "3em" }}>
                                    {
                                        ('userInfo' in AppLevelContext && AppLevelContext.userInfo.firstName) ?
                                            AppLevelContext.userInfo.firstName.charAt(0) + " " + AppLevelContext.userInfo.lastName.charAt(0) :
                                            null
                                    }
                                </div> :
                                <img style={{ width: "100%", "height": "100%", borderRadius: "50%" }} src={profilePic} alt="placeholder" />
                        }
                    </div>

                    <div className="upload-img-container" style={{ top: '45%', right: '-10px' }}>
                        <input type="file" name="userProfilePic"
                            id="update-profile-img-input"
                            className="entry-field" title="upload image"
                            onChange={(e) => { uploadProfilePicture(e) }} />
                        <div className="input-overlay">
                            <i className="material-icons">camera_alt</i>
                        </div>
                    </div>
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