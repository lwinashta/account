import React, { useEffect, useState } from 'react';

import { OnScreenMessage } from 'core/components/popups/web/popups';

import { PracticeContext } from '../practiceContext';
import { PracticeAvailabilityEntry } from './practiceAvailabilityEntry';

const moment = require('moment')

export const PracticeAvailability = () => {

    const [showAvailabilityEntryForm, setShowAvailabilityEntryForm] = useState(false);

    const [availabilityToUpdate, setAvailabilityToUpdate] = useState(null);

    const [showDeleteConfirmationMessage, setShowDeleteConfirmationMessage] = useState(false);
    const [availabilityToDelete, setAvailabilityToDelete] = useState(null);

    useEffect(() => {
        if (availabilityToUpdate !== null) setShowAvailabilityEntryForm(true);
    }, [availabilityToUpdate]);

    useEffect(() => {
        if (!showAvailabilityEntryForm) setAvailabilityToUpdate(null);
    }, [showAvailabilityEntryForm]);

    useEffect(() => {
        if (availabilityToDelete !== null) setShowDeleteConfirmationMessage(true);
    }, [availabilityToDelete]);

    useEffect(() => {
        if (!showDeleteConfirmationMessage) setAvailabilityToDelete(null);
    }, [showDeleteConfirmationMessage]);

    return (<>
        <PracticeContext.Consumer>
            {
                ({ practiceProviderInfo, isDisabled }) => {
                    return <div className="d-flex flex-row align-items-top px-3">
                        <div className="field-name-lg">
                            <b>Availability</b>
                            <div className="text-danger small">Required*</div>
                        </div>

                        <div className="field-value">
                            {
                                practiceProviderInfo.availability.length > 0 ?
                                    <div className="d-flex flex-column">
                                        {practiceProviderInfo.availability.map(availability => {
                                            return (<div key={availability.uuid} className="justify-content-between d-flex flex-row py-2 border-bottom">
                                                <div>
                                                    <div className="font-weight-bold">
                                                        {
                                                            availability.availabilityDays.map((day, indx) => {
                                                                return <span key={`${availability.uuid}-${day.name}`} className="text-capitalize">{day.name} {indx >= availability.availabilityDays.length - 1 ? "" : ", "}</span>
                                                            })
                                                        }
                                                    </div>
                                                    <div className="small text-muted">
                                                        {
                                                            availability.availabilityTimeSlots.map((slot, indx) => {
                                                                return <span key={slot.uuid}>{moment(slot.timeFrom).format("hh:mm a")} - {moment(slot.timeTo).format("hh:mm a")} {indx >= availability.availabilityTimeSlots.length - 1 ? "" : ", "}</span>
                                                            })
                                                        }
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="d-flex flex-row">
                                                        <button
                                                            title="Edit Availability"
                                                            className="icon-button"
                                                            disabled={isDisabled}
                                                            onClick={() => { setAvailabilityToUpdate(availability) }}>
                                                            <i className="fas fa-pencil-alt"></i>
                                                        </button>
                                                        <button
                                                            title="Remove Availability"
                                                            className="icon-button"
                                                            disabled={isDisabled}
                                                            onClick={() => { setAvailabilityToDelete(availability) }}>
                                                            <i className="far fa-trash-alt"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>)
                                        })}
                                    </div> :
                                    null
                            }

                            <button
                                className={`btn-classic btn-white py-2 px-3 ${practiceProviderInfo.availability.length > 0 ? "mt-2" : ""}`}
                                disabled={isDisabled}
                                onClick={() => { setShowAvailabilityEntryForm(true) }}>
                                <div className="d-flex flex-row font-weight-bold justify-content-center align-items-baseline">
                                    <i className="fas fa-plus"></i>
                                    <div className="ml-2">Add Availability </div>
                                </div>
                            </button>

                        </div>

                    </div>
                }
            }
        </PracticeContext.Consumer>
        {
            showAvailabilityEntryForm ?
                <PracticeAvailabilityEntry
                    availabilityToUpdate={availabilityToUpdate}
                    handleOnClose={setShowAvailabilityEntryForm} /> :
                null
        }
        {
            showDeleteConfirmationMessage ?
                <OnScreenMessage>
                    <div className="font-weight-bold">Remove Availability</div>
                    <div className="mt-2">Are your sure to remove the selected Contact Info for this practice </div>
                    <div className="d-flex flex-row mt-2 justify-content-end">
                        <div className="btn btn-sm btn-link mr-2 pointer" onClick={() => { setShowDeleteConfirmationMessage(false) }}>Cancel</div>
                        <div className="btn btn-sm btn-primary pointer" > Remove</div>
                    </div>
                </OnScreenMessage> :
                null
        }
    </>
    );
}