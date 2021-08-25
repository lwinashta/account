import React, { useContext, useState } from 'react';

import { AppContext } from "../../../AppContext";

import { useGetUserProfilePic } from "account-manager-module/lib/user/profile/pic/useGetUserProfilePic";

import './styles.css';

const styles = {
    profilePic: {

    },
    profilePicImage: {
        width: "100%",
        height: "100%",
        borderRadius: "50%",
    },
    fileInput: {

    }
}

export const ProfilePic = () => {

    let { userInfo,
        resetUserInformation } = useContext(AppContext);

    const profilePic = useGetUserProfilePic(userInfo);

    //Upload pictures only allows one picture upload 
    const uploadProfilePicture = (e) => {

        e.preventDefault();
        e.stopPropagation();

        console.log(e.target.files);

        let files = e.target.files;

        //console.log(files);
        let fileData = new FormData();
        let indx=0;
        for(let file of files){
            fileData.append(`userProfilePic-${indx}`, file);
            indx++;
        }

        fileData.append("linkedMongoId", userInfo._id);
        fileData.append("linkedDatabaseName", "accounts");
        fileData.append("linkedCollectionName", "users");

        fetch('/file/uploadfiles', {
            "method": "PUT",
            "body": fileData

        })
        .then(response => response.json())
        .then(result => {
            console.log(result);
            return resetUserInformation(); //reset user Information

        }).then(userResponse => {
            console.log(userResponse);

        }).catch(error => {
            console.error(error);
        });

    }

    return (<>
        <div className="d-flex flex-row align-items-center" >
            <div className="field-name font-weight-bold">Photo</div>
            <div id="update-user-profile-pic">
                {
                    profilePic === null && userInfo ?
                        <div style={{ fontSize: "1.5em" }}>
                            {
                                userInfo.firstName.charAt(0) + "" + userInfo.lastName.charAt(0)
                            }
                        </div> :
                        <img style={styles.profilePicImage} src={profilePic} alt="placeholder" />
                }
                <input
                    id="update-user-profile-pic-file-input"
                    type="file"
                    accept="image/png, image/jpeg"
                    name="userProfilePic"
                    title="upload image"
                    onChange={(e) => { uploadProfilePicture(e) }} />

                <div id="update-user-profile-pic-camera-icon-container">
                    <i className="material-icons" id="update-user-profile-pic-camera-icon">camera_alt</i>
                </div>
            </div>
        </div>
    </>
    );
}
