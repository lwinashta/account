import React, { useState } from 'react';

import { AppContext } from "../../../AppContext";

import { UpdateGenderForm } from './updateGenderForm';

export const Gender = () => {

    const [showForm, setShowForm] = useState(false);

    return (<>
        <AppContext.Consumer>
            {
                ({ userInfo }) => {
                    return <div className="d-flex flex-row align-items-center" 
                            onClick={() => setShowForm(true)}>
                        <div className="field-name font-weight-bold">Gender</div>
                        <div className="field-value">
                            {
                                userInfo.gender?
                                <div className="text-capitalize">
                                    {userInfo.gender}
                                </div>:
                                <div className="small text-muted">Click to update your gender</div>
                            }
                        </div>
                        
                        <div><span className="material-icons">chevron_right</span></div>
                    </div>
                }
            }
        </AppContext.Consumer>
        {
            showForm ?
                <UpdateGenderForm handleOnClose={setShowForm} /> :
                null
        }
    </>
    );
}