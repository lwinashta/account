import React, { useContext, useEffect, useState } from 'react';

import { PracticeContext } from '../practiceContext';
import { PracticeGeneralInformationEntry } from './practiceGeneralInformationEntry';

export const PracticeGeneralInformation = () => {

    const [showForm, setShowForm] = useState(false);

    return (<>
        <PracticeContext.Consumer>
            {
                ({ practiceInfo, isDisabled }) => {
                    return <div className="d-flex flex-row align-items-top px-3">
                        <div className="field-name-lg">
                            <b>General</b>
                            <div className="text-danger small">Required*</div>
                        </div>
                        <div className="field-value">
                            <div>
                                <b>{practiceInfo.name}</b>
                                <div className="text-muted">
                                    {
                                        practiceInfo.facilityType && practiceInfo.facilityType.length > 0 ?
                                            practiceInfo.facilityType.map((t, indx) => {
                                                return <span key={t} className="">{t} {indx < practiceInfo.facilityType.length-1 ? ", " : ""}</span>
                                            }) :
                                            null
                                    }
                                </div>
                                {
                                    practiceInfo.description.length > 0 ?
                                        <p className="mt-2 text-muted small">{practiceInfo.description}</p> :
                                        null
                                }
                            </div>
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
                <PracticeGeneralInformationEntry
                    handleOnClose={setShowForm} /> :
                null
        }
    </>
    );
}