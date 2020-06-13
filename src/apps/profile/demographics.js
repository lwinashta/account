import React, { useState } from 'react';
import { UserInfo } from "./../../contexts/userInfo";
import { ManagePhoneNumbers } from "./managePhoneNumber";
import { ManageAddresses } from "./manageAddresses";
import {ManageEmail} from './manageEmail';


export const Demographics = () => {
    
    return (
        <UserInfo.Consumer>
            {({userInfo={},userProfileImageUrl=""})=>{
                return (<div>
                    <div className="text-center">
                        <div className="mx-auto position-relative text-center" style={{ width: '100px', 'height': '100px' }}>
                            <img src={userProfileImageUrl} className="rounded-circle w-100"></img>
                            <div className="upload-img-container" style={{ top: '45%', right: '-10px' }}>
                                <input type="file" name="personal_profile_image"
                                    id="update-profile-img-input" className="entry-field" title="upload image" />
                                <div className="input-overlay">
                                    <i className="material-icons">camera_alt</i>
                                </div>
                            </div>
                        </div>
                    </div>
        
                    <div className="mt-4 text-center">
                        <h4 className="text-capitalize">Welcome, {userInfo.first_name} {userInfo.last_name}</h4>
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
                            <i className="material-icons align-middle">perm_identity</i>
                        </div>
                        <div className="d-inline-block ml-5">
                            <div>
                                {
                                    'gender' in userInfo && userInfo.gender.length > 0 ?
                                        <div>
                                            <div>{userInfo.gender}</div> 
                                            <div className="text-muted small">Gender</div>
                                            <div className="push-right">
                                                <i className="btn-link small pointer">Edit</i>
                                            </div>
                                        </div>:
                                        <div className="pointer small mt-2 btn-link text-primary">Set Gender</div>
                                }
                            </div>
                            
                        </div>
                    </div>

                    <div className="mt-2 p-2 border-bottom position-relative">
                        <div className="align-top pull-left">
                            <i className="material-icons align-middle">cake</i>
                        </div>
                        <div className="d-inline-block ml-5">
                            <div>
                                {
                                    'birth_date' in userInfo && userInfo.birth_date.length > 0 ?
                                        <div>
                                            <div>{userInfo.birth_date}</div> 
                                            <div className="text-muted small">Birth Date</div>
                                            <div className="push-right">
                                                <i className="btn-link small pointer">Edit</i>
                                            </div>
                                        </div>:
                                        <div className="pointer small mt-2 btn-link text-primary">Set Birth Date</div>
                                }
                            </div>
                            
                        </div>
                    </div>
                    
        
                </div>);
            }}
        </UserInfo.Consumer>
        );
}