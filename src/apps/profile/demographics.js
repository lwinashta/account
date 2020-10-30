import React, { useState, useEffect, useContext } from 'react';
import { UserInfo } from "./../../contexts/userInfo";
import { ManagePhoneNumbers } from "./managePhoneNumber";
import { ManageAddresses } from "./manageAddresses";
import { ManageEmail } from './manageEmail';
import { getUserProfilePictureUri } from "@oi/reactcomponents";
import { ManageGender } from './manageGender';
import { ManageBirthDate } from './manageBirthDate';
import {ManageLanguages} from './manageLanguages'

export const Demographics = () => {

    let contextValues=useContext(UserInfo);
    const [userProfileImageUrl,setUserProfileImageUri]=useState("");

    useEffect(()=>{
        setProfileImage();
    },[]);

    const setProfileImage = () => {

        let userInfo=contextValues.userInfo;
        
        setUserProfileImageUri(getUserProfilePictureUri(userInfo));
    }

    //Upload pictures only allows one picture upload 
    const uploadProfilePicture=(e)=>{

        e.preventDefault();
        e.stopPropagation();

        console.log(e.target.files);

        let files=e.target.files;
        
        //console.log(files);
        let fileData=new FormData();

        $.each(files,function(indx,file){
            fileData.append(`personal_profile_image-${indx}`,file);
        });

        fileData.append("linked_mongo_id",contextValues.userInfo._id);
        fileData.append("linked_db_name","accounts");
        fileData.append("linked_collection_name","users");

        $.ajax({
            "url": '/g/uploadfiles',
            "processData": false,
            "contentType": false,
            "data": fileData,
            "method": "POST"
        }).then(uploadedPicture=>{
            console.log(uploadedPicture);

            //Set the new img uri 
            setUserProfileImageUri(`/g/fs/${uploadedPicture[0]._id}`);

            let userFiles=[...contextValues.userInfo.files];
            userFiles.push(uploadedPicture[0]);
            contextValues.updateUserInfoContext({
                "files":userFiles
            });

        });
    }
    
    return (
        <UserInfo.Consumer>
            {({userInfo={}})=>{
                return (<div>
                    <div className="text-center">
                        <div className="mx-auto position-relative text-center" style={{ width: '100px', 'height': '100px' }}>
                            <img src={userProfileImageUrl} className="rounded-circle h-100 w-100"></img>
                            <div className="upload-img-container" style={{ top: '45%', right: '-10px' }}>
                                <input type="file" name="personal_profile_image"
                                    id="update-profile-img-input" 
                                    className="entry-field" title="upload image" 
                                    onChange={(e)=>{uploadProfilePicture(e)}} />
                                <div className="input-overlay">
                                    <i className="material-icons">camera_alt</i>
                                </div>
                            </div>
                        </div>
                    </div>
        
                    <div className="mt-4 text-center">
                        <h4 className="text-capitalize">Welcome, {userInfo.first_name} {userInfo.last_name}</h4>
                        <div className="small text-muted"> as <i className="text-capitalize">{'login_user_type' in userInfo? userInfo.login_user_type.replace(/\_/i," "):""}</i></div>
                    </div>

                    <div className="mt-2 p-2 border-bottom position-relative">
                        <div className="align-top pull-left">
                            <i className="material-icons align-middle">email</i>
                        </div>
                        <ManageEmail />
                    </div>

                    <div className="mt-2 p-2 border-bottom position-relative">
                        <div className="align-top pull-left">
                            <i className="material-icons align-middle">call</i>
                        </div>
                        <div className="ml-5">
                            <div className="w-100">
                                <ManagePhoneNumbers />
                            </div>
                        </div>
                    </div>

                    <div className="mt-2 p-2 border-bottom position-relative">
                        <div className="align-top pull-left">
                            <i className="material-icons align-middle">home</i>
                        </div>
                        <div className="ml-5">
                            <div className="w-100">
                                <ManageAddresses />
                            </div>
                        </div>
                    </div>

                    <div className="mt-2 p-2 border-bottom position-relative">
                        <div className="align-top pull-left">
                            <i className="fas fa-venus-mars"></i>
                        </div>
                        <div className="ml-5">
                            <div className="w-100">
                                <ManageGender />
                            </div>
                        </div>
                    </div>

                    <div className="mt-2 p-2 border-bottom position-relative">
                        <div className="align-top pull-left">
                            <i className="fas fa-birthday-cake"></i>
                        </div>
                        <div className="ml-5">
                            <div className="w-100">
                                <ManageBirthDate />
                            </div>
                        </div>
                    </div>

                    <div className="mt-2 p-2 border-bottom position-relative">
                        <div className="align-top pull-left">
                            <i className="fas fa-american-sign-language-interpreting"></i>
                        </div>
                        <div className="ml-5">
                            <div className="w-100">
                                <ManageLanguages />
                            </div>
                        </div>
                    </div>

                </div>);
            }}
        </UserInfo.Consumer>
        );
}