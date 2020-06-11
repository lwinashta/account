import React, { useEffect, useState } from 'react';

export const App = () => {

    const [userInfo,setUserInfo]=useState({});
    const [userProfileImageUrl,setUserProfileImageUri]=useState("");

    const getUserInfo=()=>{
        return $.post('/account/api/user/verifytoken')
    }

    //On Load 
    useEffect(()=>{
        //Get user information
        getUserInfo().then(response=>{
            console.log(response);
            setUserInfo(response);

            let imageUri="/efs/core/images/core/noimage.png";

            if ('facebook_user_id' in userInfo && 'personal_profile_image' in userInfo) {
                imageUri=userInfo.personal_profile_image.url;

            } else if('personal_profile_image' in userInfo){
                imageUri=userInfo.personal_profile_image[userInfo.personal_profile_image.length-1].filename;
            }

            setUserProfileImageUri(imageUri);

        });

    },[]);

    return (
        <div id="profile-container" className="container-fluid mt-3">
            <div className="row">
                <div className="col-sm-12 col-md-12 col-lg-6 col-xl-6">
                    <div className="tile white-tile mb-2">
                        <div className="mb-2">
                            <div className="text-center">
                                <div className="mx-auto position-relative text-center" style={{ width: '100px', 'height': '100px' }}>
                                    <img src={userProfileImageUrl} className="rounded-circle w-100"></img>
                                    <div className="upload-img-container" style={{top: '45%',right:'-10px'}}>
                                        <input type="file" name="personal_profile_image"
                                            id="update-profile-img-input" className="entry-field" title="upload image" />
                                        <div className="input-overlay">
                                            <i className="material-icons">camera_alt</i>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="mt-4 text-center">
                                <h4 class="text-capitalize">Welcome, {userInfo.first_name} {userInfo.last_name}</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}