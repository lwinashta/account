import React, { useState } from 'react';

import { AppContext } from "../../../AppContext";
import {UpdateEmailForm} from './updateEmailForm';

export const Email = () => {

    const [showForm, setShowForm] = useState(false);
    
    return (<>
        <AppContext.Consumer>
            {
                ({ userInfo }) => {
                    return <div className="d-flex flex-row align-items-center"
                        onClick={() => setShowForm(true)}>
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
                        <div><span className="material-icons">chevron_right</span></div>
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
