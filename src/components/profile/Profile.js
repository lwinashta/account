import React,{useContext} from 'react';

import { AppContext } from "../AppContext";

import { BasicInfo } from "./basicInfo/basicInfo";
import { ContactInfo } from "./contactInfo/contactInfo";
import { Addresses } from "./addresses/addresses";

export const Profile = () => {
    
    let AppLevelContext = useContext(AppContext);

    return (
        <div className="container-fluid mt-2">
            {
                Object.keys(AppLevelContext.userInfo).length > 0 ?
                    <div className="row">
                        <div className="col-sm-12 col-md-6 col-lg-6 mb-3">
                            
                            <BasicInfo />

                            <ContactInfo />
                            
                        </div>
                        <div className="col-sm-12 col-md-6 col-lg-6">
                            <Addresses />
                        </div>
                    </div> :
                    null
            }
        </div>
    );
}