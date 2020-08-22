import React, { useContext, useEffect, useState } from 'react';
import { UserInfo } from "./../../contexts/userInfo";
import { Modal } from "@oi/reactcomponents";
import { submitUserUpdates } from './../reusable/userInfoFunctions';

const moment = require('moment');

export const ManagePracticeStartDate = () => {

    let contextValues = useContext(UserInfo);
    const [practiceStartDate, setPracticeStartDate] = useState("medical_practice_start_date" in contextValues.userInfo ? contextValues.userInfo.medical_practice_start_date : []);

    const [showPracticeStartDateForm, setPracticeStartDateFormFlag] = useState(false);

    const handlePracticeStartDateUpdate = (e) => {

        e.preventDefault();
        popup.onScreen("Updating...");

        let form = e.target;
        let practiceStartDate = $(form).find('input[name="medical_practice_start_date"]').val();

        submitUserUpdates({
            medical_practice_start_date: practiceStartDate,
            "_id": contextValues.userInfo._id

        }).then(response => {

            popup.remove();
            popup.onBottomCenterSuccessMessage("Year of experience updated");

            setPracticeStartDateFormFlag(false);

            contextValues.updateUserInfoContext({
                medical_practice_start_date: practiceStartDate
            });

        }).catch(err => {
            popup.remove();
            console.log(err);
            popup.onBottomCenterErrorOccured("Error while updating the info. Try again.");
        });
    }

    return (
        <div className="border-bottom pt-2 pb-3 position-relative">
            <div className="font-weight-bold" data-required="1">Year you started practicing?</div>
            {
                practiceStartDate.length > 0 ?
                    <div className="small mt-2">
                        Practicing since <b className="text-primary">{moment(contextValues.userInfo.medical_practice_start_date).format('YYYY')}</b> ({moment().diff(moment(contextValues.userInfo.medical_practice_start_date), 'years')} years of experience)
                    </div> :
                    <div className="small text-muted">This information helps calculate number of years of experience</div>
            }
            {
                'qualification_verification_status' in contextValues.userInfo &&
                    contextValues.userInfo.qualification_verification_status.length > 0 &&
                    contextValues.userInfo.qualification_verification_status === "pending" ?
                    practiceStartDate.length === 0 ?
                        <div>
                            <div className="small mb-1 mt-1 btn-link pointer" onClick={() => { setPracticeStartDateFormFlag(true) }}>Enter Practice Start Date </div>
                        </div> :
                        <div>
                            <div className="push-right">
                                <div className="small btn-link pointer" onClick={() => { setPracticeStartDateFormFlag(true) }}>Edit</div>
                            </div>
                        </div>
                    : null
            }
            {
                showPracticeStartDateForm ?
                    <Modal
                        header={<h4> Practice Start Date </h4>}
                        onCloseHandler={() => { setPracticeStartDateFormFlag(false) }}>
                        <form onSubmit={(e) => { handlePracticeStartDateUpdate(e) }}>
                            <div className="form-group mt-2">
                                <input id="medical_practice_start_date"
                                    name="medical_practice_start_date" className='form-control entry-field'
                                    data-required="1" type="date" placeholder="Select your birthdate"
                                    autoComplete="off" defaultValue={contextValues.userInfo.medical_practice_start_date} />
                            </div>
                            <div>
                                Please enter approximate date you started practicing.
                                If you are not sure about the exact date, just enter tentative date, but make sure the year you have entered is correct.
                                    </div>
                            <div className="mt-2 text-center">
                                <button className="btn btn-primary w-75" type="submit">Save Information</button>
                            </div>
                        </form>
                    </Modal> : null
            }
        </div>
    )
}