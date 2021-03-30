import React, { useContext, useState } from 'react';

const moment = require('moment');

import { AppContext } from "../../../AppContext";
import { BirthDateForm } from "./form";

export const ManageBirthDate = () => {

    let AppLevelContext = useContext(AppContext);

    const [showBirthDateForm, setBirthDateFormFlag] = useState(false);

    const handleAfterSubmission=(updatedValue)=>{
        setBirthDateFormFlag(false);
    }

    return (
        <div>
            {
                'birthDate' in AppLevelContext.userInfo && AppLevelContext.userInfo.birthDate.length > 0 ?
                    <div className="d-flex flex-row justify-content-between">
                        <div>
                            <div className="text-capitalize">{moment(AppLevelContext.userInfo.birthDate).format('DD MMM YYYY')}</div>
                            <div className="text-muted">BirthDate</div>
                        </div>
                        <div className="icon-button" onClick={() => setBirthDateFormFlag(true)}>
                            <i className="fas fa-pencil-alt"></i>
                        </div>
                    </div> :
                    <div className="btn-link pointer"
                        onClick={() => setBirthDateFormFlag(true)}>Set BirthDate
                    </div>
            }

            {
                showBirthDateForm ?
                <BirthDateForm 
                    onCloseHandler={()=>{setBirthDateFormFlag(false)}}
                    afterSubmission={handleAfterSubmission}
                /> : null
            }
        </div>
    )
}