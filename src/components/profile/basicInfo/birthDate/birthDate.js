import React, { useState } from 'react';

import { AppContext } from "../../../AppContext";

import { UpdateBirthDateForm } from './updateBirthDateForm';

const moment=require('moment');

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
                                userInfo.birthDate?
                                <div className="text-capitalize">
                                    {moment(userInfo.birthDate).format('DD MMM,YYYY')}
                                </div>:
                                <div className="small text-muted">Click to update your birthDate</div>
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