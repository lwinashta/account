import React, { useState } from 'react';

import * as utils from "account-manager-module/lib/user/phoneNumber/handlers"

import { AppContext } from "../../../AppContext";
import {UpdatePhoneNumberForm} from './updatePhoneNumberForm';

const countries = require('@oi/utilities/lists/countries.json');

export const PhoneNumber = () => {

    const [showForm, setShowForm] = useState(false);
    
    return (<>
        <AppContext.Consumer>
            {
                ({ userInfo }) => {
                    return <div className="d-flex flex-row align-items-center">
                        <div className="field-name font-weight-bold">Phone</div>
                        <div className="field-value">
                            {userInfo.contactNumber ? 
                                utils.constructPhoneNumber(userInfo.contactNumber):
                                <div className="small text-muted">Click to update the phone number</div>
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
                <UpdatePhoneNumberForm 
                    countries={countries}
                    handleOnClose={setShowForm} /> :
                null
        }
    </>
    );
}
