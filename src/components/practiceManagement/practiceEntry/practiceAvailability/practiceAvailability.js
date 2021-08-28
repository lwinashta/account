import React, { useEffect, useState } from 'react';

import { AppContext } from "../../../AppContext";
import { PracticeAvailabilityEntry } from './practiceAvailabilityEntry';

export const PracticeAvailability = ({
    isDisabled=false
}) => {

    const [showForm, setShowForm] = useState(false);

    return (<>
        <AppContext.Consumer>
            {
                ({ practiceInfo }) => {
                    return <div className="d-flex flex-row align-items-top px-3">
                        <div className="field-name-lg">
                            <b>Availability</b>
                            <div className="text-danger small">Required*</div>
                        </div>
                        <div className="field-value">
                            
                        </div>
                        
                        <div>
                            <button 
                                title="Edit Practice General Information" 
                                className="icon-button"
                                disabled={isDisabled}
                                onClick={() => setShowForm(true)}>
                                <i className="fas fa-pencil-alt"></i>
                            </button>
                        </div>

                    </div>
                }
            }
        </AppContext.Consumer>
        {
            showForm ?
                <PracticeAvailabilityEntry 
                    handleOnClose={setShowForm} /> :
                null
        }
    </>
    );
}