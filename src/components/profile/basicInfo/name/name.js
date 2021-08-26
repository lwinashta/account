import React, { useState } from 'react';

import { AppContext } from "../../../AppContext";

import { UpdateNameForm } from './updateNameForm';

export const Name = () => {

    const [showForm, setShowForm] = useState(false);

    return (<>
        <AppContext.Consumer>
            {
                ({ userInfo }) => {
                    return <div className="d-flex flex-row align-items-center" 
                            onClick={() => setShowForm(true)}>
                        <div className="field-name font-weight-bold">Name</div>
                        <div className="field-value">{userInfo.firstName} {userInfo.lastName}</div>
                        <div><span className="material-icons">chevron_right</span></div>
                    </div>
                }
            }
        </AppContext.Consumer>
        {
            showForm ?
                <UpdateNameForm handleOnClose={setShowForm} /> :
                null
        }
    </>
    );
}