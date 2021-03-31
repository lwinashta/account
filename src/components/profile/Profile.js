import React,{useContext} from 'react';

import { Demographics } from "./demographics/demographics";
import { AppContext } from "../AppContext";

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
                        </div>
                        <div className="col-sm-12 col-md-6 col-lg-6"></div>
                    </div> :
                    null
            }
        </div>
    );
}