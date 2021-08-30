import React, { useEffect, useState } from 'react';

import { DisplayAddress } from "core/components/infoDisplay/address/displayAddress";

import { PracticeContext } from '../practiceContext';
import { PracticeAddressEntry } from './practiceAddressEntry';

export const PracticeAddress = ({
    isDisabled=false
}) => {

    const [showForm, setShowForm] = useState(false);

    return (<>
        <PracticeContext.Consumer>
            {
                ({ practiceInfo }) => {
                    return <div className="d-flex flex-row align-items-top px-3">
                        <div className="field-name-lg">
                            <b>Address</b>
                            <div className="text-danger small">Required*</div>
                        </div>
                        <div className="field-value">
                            {
                                practiceInfo.address && Object.keys(practiceInfo.address).length>0?
                                <DisplayAddress address={practiceInfo.address}/>:
                                null
                            }
                            
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
        </PracticeContext.Consumer>
        {
            showForm ?
                <PracticeAddressEntry 
                    handleOnClose={setShowForm} /> :
                null
        }
    </>
    );
}