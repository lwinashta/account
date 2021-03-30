import React, { useContext, useRef } from 'react';

import { Modal } from "core/components/modal/web/modal";

import { AppContext } from "../../../AppContext";

export const BirthDateForm = ({
    afterSubmission=function(){},
    onCloseHandler=function(){},
}) => {

    let AppLevelContext=useContext(AppContext);

    let formValues=useRef({
        birthDate:null
    });

    const handleBirthDateUpdate = (e) => {

        try {

            e.preventDefault();

            fetch('/account/api/user/profile/update',{
                method:"POST",
                body:JSON.stringify({
                    _id:AppLevelContext.userInfo._id,
                    birthDate:formValues.current.birthDate
                }),
                headers: {
                    "content-type": "application/json",
                }
            })
            .then(response=>response.json())
            .then(data=>{
                
                AppLevelContext.updateUserContextInfo({
                    birthDate:formValues.current.birthDate
                });

                afterSubmission();

            }).catch(err=>{
                alert("Issue in updating birthdate. Please try again later");
            });

        } catch (error) {
            console.log(error);
        }

    }

    return (
        <Modal
            header={<h4> Birthdate Entry </h4>}
            onCloseHandler={() => { onCloseHandler() }}>
        <form onSubmit={(e) => { handleBirthDateUpdate(e) }}>
            <div className="form-group mt-2">
                <input id="birthDate"
                    name="birthDate" 
                    onInput={(e)=>{
                        formValues.current.birthDate=e.target.value;
                    }}
                    className='form-control entry-field'
                    type="date" 
                    placeholder="Select your birthdate"
                    autoComplete="off" 
                    defaultValue={'birthDate' in AppLevelContext.userInfo!==null?AppLevelContext.userInfo.birthDate:null} />
            </div>
            <div className="mt-2 text-center">
                <button className="btn btn-primary w-75" type="submit">Save Information</button>
            </div>
        </form>
    </Modal>
    )
}