import React, { useContext, useRef } from 'react';

import { Modal } from "core/components/modal/web/modal";

import { AppContext } from "../../../AppContext";

export const AboutMeForm = ({
    afterSubmission=function(){},
    onCloseHandler=function(){},
}) => {

    let AppLevelContext=useContext(AppContext);

    let formValues=useRef({
        aboutMe:null
    });

    const handleAboutMeUpdate = (e) => {

        try {

            e.preventDefault();

            fetch('/account/api/user/profile/update',{
                method:"POST",
                body:JSON.stringify({
                    _id:AppLevelContext.userInfo._id,
                    aboutMe:formValues.current.aboutMe
                }),
                headers: {
                    "content-type": "application/json",
                }
            })
            .then(response=>response.json())
            .then(data=>{
                
                AppLevelContext.updateUserContextInfo({
                    aboutMe:formValues.current.aboutMe
                });

                afterSubmission();

            }).catch(err=>{
                alert("Issue in updating about me. Please try again later");
            });

        } catch (error) {
            console.log(error);
        }

    }

    return (
        <Modal
            header={<h4> About Me </h4>}
            onCloseHandler={() => { onCloseHandler() }}>
            <form onSubmit={(e) => { handleAboutMeUpdate(e) }}>
                <div className="text-muted">
                    Enter few sentences to describe yourself and your experience.
                    This information will be visible on your profile page.
                </div>
                <div className="form-group mt-2">
                    <textarea id="aboutme"
                        name="aboutMe" 
                        rows="10"
                        onInput={(e)=>{
                            formValues.current.aboutMe=e.target.value;
                        }}
                        className='form-control'
                        data-required="1" 
                        autoComplete="off" 
                        defaultValue={'aboutMe' in AppLevelContext.userInfo!==null?AppLevelContext.userInfo.aboutMe:null} />
                </div>
                <div className="mt-2 text-center">
                    <button className="btn btn-primary w-75" type="submit">Save Information</button>
                </div>
            </form>
        </Modal>
    )
}