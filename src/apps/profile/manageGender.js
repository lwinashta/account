import React, { useContext, useEffect,useState } from 'react';
import { UserInfo } from "./../../contexts/userInfo";
import { Modal } from "@oi/reactcomponents";
import {submitUserUpdates} from './../reusable/userInfoFunctions';

export const ManageGender = () => {

    let contextValues=useContext(UserInfo);
    const [showGenderForm, setGenderFormFlag] = useState(false);

    const handleGenderUpdate=(e)=>{
        
        e.preventDefault();
        popup.onScreen("Updating...");

        let form=e.target;
        let gender=$(form).find('select[name="gender"]').val();

        submitUserUpdates({
            gender:gender,
            "_id":contextValues.userInfo._id

        }).then(response=>{

            popup.remove();
            popup.onBottomCenterSuccessMessage("Gender updated");

            setGenderFormFlag(false);

            contextValues.updateUserInfoContext({
                gender:gender
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
                        'gender' in userInfo && userInfo.gender.length>0?
                            <div className="position-relative"> 
                                <div className="push-right small" 
                                    style={{top: '-10px'}}>
                                    <div className="btn-link pointer" onClick={()=>setGenderFormFlag(true)}>Edit</div>
                                </div>
                                <div className="text-capitalize">{userInfo.gender}</div>
                                <div className="small text-muted">Gender</div>
                            </div>: 
                        !('gender' in userInfo) || ('gender' in userInfo && userInfo.gender.length===0)?
                            <div className="mt-2"> 
                                <div className="small mb-1 mt-1 btn-link pointer" 
                                    onClick={()=>setGenderFormFlag(true)}>Set Gender</div>
                            </div>:
                            null
                    }

                    {
                        showGenderForm ?
                            <Modal
                                header={<h4> Gender </h4>}
                                onCloseHandler={() => { setGenderFormFlag(false) }}>
                                <form onSubmit={(e) => { handleGenderUpdate(e) }}>
                                    <div className="form-group mt-2">
                                        <select id="gender"
                                            name="gender" className='form-control entry-field'
                                            data-required="1" placeholder="Enter somethign about yourself"
                                            autoComplete="off" defaultValue={userInfo.gender} >
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
                            </Modal> : null
                    }
                </div>

            }}
        </UserInfo.Consumer>
    )
}