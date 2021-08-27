import React, { useState } from 'react';

import { AppContext } from "../../../AppContext";

import { UpdateNameForm } from './updateNameForm';

export const Name = () => {

    const [showForm, setShowForm] = useState(false);

    return (<>
        <AppContext.Consumer>
            {
                ({ userInfo }) => {
                    return <div className="d-flex flex-row align-items-center">
                        <div className="field-name font-weight-bold">Name</div>
                        <div className="field-value">{userInfo.firstName} {userInfo.lastName}</div>
                        <div>
                            <div title="Edit Name" className="icon-button"
                                onClick={() => setShowForm(true)}>
                                <i className="fas fa-pencil-alt"></i>
                            </div>
                        </div>
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