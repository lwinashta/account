import React, { useContext,useEffect, useState } from "react";
import { UserInfo } from "../../contexts/userInfo";
export const useGetUserProfilePic = () => {

    let userInfoContext=useContext(UserInfo);
    const [picUri, setPicUri] = useState(null);

    useEffect(() => {

        //Check if user is fb user 
        if (userInfoContext.userInfo.isFacebookUser) {
            setPicUri(userInfoContext.facebookUserDetails.picture.data.url);

        } else if (userInfoContext.userInfo.isGoogleUser) {
            setPicUri(userInfoContext.googleUserDetails.photo);

        } else if(("userInfo" in userInfoContext )
                && !userInfoContext.userInfo.isFacebookUser 
                && !userInfoContext.userInfo.isGoogleUser 
                && userInfoContext.userInfo.files.length>0 
                && userInfoContext.userInfo.files.filter(f=>f.fieldName==="userProfilePic").length>0) {
            
            let fileId=userInfoContext.userInfo.files[0]._id;
            console.log(fileId);
            setPicUri(`/g/public/fs/${fileId}`);
        }

    }, []);

    return picUri !== null ? picUri : null;
}