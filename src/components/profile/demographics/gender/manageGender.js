import React, { useContext, useState } from 'react';

import { AppContext } from "../../../AppContext";
import { GenderForm } from "./form";

export const ManageGender = () => {

    let AppLevelContext = useContext(AppContext);

    const [showGenderForm, setGenderFormFlag] = useState(false);

    const handleAfterSubmission = (updatedValue) => {
        setGenderFormFlag(false);
    }

    return (
        <div>
            {
                'gender' in AppLevelContext.userInfo 
                    && AppLevelContext.userInfo.gender!==null ?
                    <div className="d-flex flex-row justify-content-between">
                        <div>
                            <div className="text-capitalize">{AppLevelContext.userInfo.gender}</div>
                            <div className="text-muted">Gender</div>
                        </div>
                        <div className="icon-button" onClick={() => setGenderFormFlag(true)}>
                            <i className="fas fa-pencil-alt"></i>
                        </div>
                    </div> :
                    <div className="btn-link pointer"
                        onClick={() => setGenderFormFlag(true)}>Set Gender
                    </div>
            }

            {
                showGenderForm ?
                    <GenderForm 
                        onCloseHandler={()=>{setGenderFormFlag(false)}}
                        afterSubmission={handleAfterSubmission}
                    /> : null
            }
        </div>
    )
}