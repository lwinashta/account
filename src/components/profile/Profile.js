import React,{useContext} from 'react';

import { Demographics } from "./demographics/demographics";
import { AppContext } from "../AppContext";
import { ManageAddresses } from './address/manageAddresses';

export const Profile = () => {
    
    let AppLevelContext = useContext(AppContext);

    return (
        <div className="container-fluid mt-2">
            {
                Object.keys(AppLevelContext.userInfo).length > 0 ?
                    <div className="row">
                        <div className="col-sm-12 col-md-6 col-lg-6 mb-3">
                            <div className="tile bg-white">
                                <Demographics />
                            </div>
                            <div className="tile bg-white mt-3">
                                <div className="p-2 border-bottom mb-2">
                                    <b>Manage Addresses</b>
                                </div>
                                <ManageAddresses />
                            </div>
                        </div>
                        <div className="col-sm-12 col-md-6 col-lg-6"></div>
                    </div> :
                    null
            }
        </div>
    );
}