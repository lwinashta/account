import React, { useState } from 'react';

import { AppContext } from "../../../AppContext";

import { UpdateBirthDateForm } from './updateBirthDateForm';

export const BirthDate = () => {

    const [showForm, setShowForm] = useState(false);

    return (<>
        <AppContext.Consumer>
            {
                ({ userInfo }) => {
                    return <div className="d-flex flex-row align-items-center" 
                            onClick={() => setShowForm(true)}>
                        <div className="field-name font-weight-bold">BirthDate</div>
                        <div className="field-value">
                            {
                                userInfo.birthdate?
                                <div className="text-capitalize">
                                    {userInfo.birthdate}
                                </div>:
                                <div className="small text-muted">Click to update your birthdate</div>
                            }
                        </div>
                        
                        <div><span className="material-icons">chevron_right</span></div>
                    </div>
                }
            }
        </AppContext.Consumer>
        {
            showForm ?
                <UpdateBirthDateForm handleOnClose={setShowForm} /> :
                null
        }
    </>
    );
}