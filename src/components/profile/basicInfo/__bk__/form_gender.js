import React, { useContext, useRef } from 'react';

import { Modal } from "core/components/modal/web/modal";

import { AppContext } from "../../../AppContext";

export const GenderForm = ({
    afterSubmission = function () { },
    onCloseHandler = function () { },
}) => {

    let AppLevelContext = useContext(AppContext);

    let formValues = useRef({
        gender: null
    });

    const handleGenderUpdate = (e) => {

        try {

            e.preventDefault();

            fetch('/account/api/user/profile/update', {
                method: "POST",
                body: JSON.stringify({
                    _id: AppLevelContext.userInfo._id,
                    gender: formValues.current.gender
                }),
                headers: {
                    "content-type": "application/json",
                }
            })
                .then(response => response.json())
                .then(data => {

                    AppLevelContext.updateUserContextInfo({
                        gender: formValues.current.gender
                    });

                    afterSubmission();

                }).catch(err => {
                    alert("Issue in updating gender. Please try again later");
                });

        } catch (error) {
            console.log(error);
        }

    }

    return (
        <Modal
            header={<h4> Gender </h4>}
            onCloseHandler={() => { onCloseHandler(false) }}>
            <form onSubmit={(e) => { handleGenderUpdate(e) }}>
                <div className="form-group mt-2">
                    <label>Gender</label>
                    <select id="gender"
                        name="gender" 
                        onChange={(e)=>{
                            formValues.current.gender=e.target.value;
                        }}
                        className='form-control'
                        data-required="1" 
                        defaultValue={'gender' in AppLevelContext.userInfo!==null?AppLevelContext.userInfo.gender:null} >
                        <option value=''></option>
                        <option value='male'>Male</option>
                        <option value='female'>Female</option>
                        <option value='other'>Other</option>
                    </select>
                </div>
                <div className="mt-2 text-center">
                    <button className="btn btn-primary w-75" type="submit">Save Information</button>
                </div>
            </form>
        </Modal>
    )
}