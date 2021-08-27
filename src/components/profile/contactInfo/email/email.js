import React, { useState } from 'react';

import { AppContext } from "../../../AppContext";
import {UpdateEmailForm} from './updateEmailForm';

export const Email = () => {

    const [showForm, setShowForm] = useState(false);
    
    return (<>
        <AppContext.Consumer>
            {
                ({ userInfo }) => {
                    return <div className="d-flex flex-row align-items-center">
                        <div className="field-name font-weight-bold">Email</div>
                        <div className="field-value">
                            {
                                userInfo.isFacebookUser || userInfo.isGoogleUser ?
                                    <div>
                                        {userInfo.isFacebookUser ? "Facebook" : "Google"} account users cannot update their email address.
                                        Please visit {userInfo.isFacebookUser ? "Facebook" : "Google"} to change your email address.
                                    </div> : 
                                    <div>{userInfo.emailId}</div>
                            }
                        </div>
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
                <UpdateEmailForm handleOnClose={setShowForm} /> :
                null
        }
    </>
    );
}
