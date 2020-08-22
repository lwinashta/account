import React, { useContext, useEffect,useState } from 'react';
import { UserInfo } from "./../../contexts/userInfo";
import { Modal } from "@oi/reactcomponents";
import {submitUserUpdates} from './../reusable/userInfoFunctions';

const moment=require('moment');

export const ManageBirthDate = () => {

    let contextValues=useContext(UserInfo);
    const [showBirthDateForm, setBirthDateFormFlag] = useState(false);

    const handleBirthDateUpdate=(e)=>{
        
        e.preventDefault();
        popup.onScreen("Updating...");

        let form=e.target;
        let birthDate=$(form).find('input[name="birth_date"]').val();

        submitUserUpdates({
            birth_date:birthDate,
            "_id":contextValues.userInfo._id

        }).then(response=>{

            popup.remove();
            popup.onBottomCenterSuccessMessage("Birth date updated");

            setBirthDateFormFlag(false);

            contextValues.updateUserInfoContext({
                birth_date:birthDate
            });

        }).catch(err=>{
            popup.remove();
            console.log(err);
            popup.onBottomCenterErrorOccured("Error while updating the info. Try again.");
        });
    }

    return (
        <UserInfo.Consumer>
            {({ userInfo = {} }) => {
                return <div>
                    {
                        'birth_date' in userInfo && userInfo.birth_date.length>0?
                            <div className="position-relative"> 
                                <div className="push-right small" 
                                    style={{top: '-10px'}}>
                                    <div className="btn-link pointer" onClick={()=>setBirthDateFormFlag(true)}>Edit</div>
                                </div>
                                <div className="text-capitalize">{moment(userInfo.birth_date).format('DD MMM YYYY')}</div>
                                <div className="small text-muted">BirthDate</div>
                            </div>: 
                        !('birth_date' in userInfo) || ('birth_date' in userInfo && userInfo.birth_date.length===0)?
                            <div className="mt-2"> 
                                <div className="small mb-1 mt-1 btn-link pointer" 
                                    onClick={()=>setBirthDateFormFlag(true)}>Set BirthDate</div>
                            </div>:
                            null
                    }

                    {
                        showBirthDateForm ?
                            <Modal
                                header={<h4> About Me </h4>}
                                onCloseHandler={() => { setBirthDateFormFlag(false) }}>
                                <form onSubmit={(e) => { handleBirthDateUpdate(e) }}>
                                    <div className="form-group mt-2">
                                        <input id="birth_date"
                                            name="birth_date" className='form-control entry-field'
                                            data-required="1" type="date" placeholder="Select your birthdate"
                                            autoComplete="off" defaultValue={userInfo.birth_date} />
                                    </div>
                                    <div className="mt-2 text-center">
                                        <button className="btn btn-primary w-75" type="submit">Save Information</button>
                                    </div>
                                </form>
                            </Modal> : null
                    }
                </div>

            }}
        </UserInfo.Consumer>
    )
}