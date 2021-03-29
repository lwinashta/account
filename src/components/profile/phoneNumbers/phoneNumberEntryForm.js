import React, { useState, useContext, useRef } from 'react';
import { AppContext } from "../../AppContext";
import { form } from "form-module/form";
import { Modal } from "core/components/modal/web/modal";
import { v4 as uuidv4 } from 'uuid';

import VerifyOTPForm from '../otp/vertifyOtpForm';
import {getOTP} from '../otp/getOtp';

import * as utils from "account-manager-module/profile/managePhoneNumber/utils"

const countries = require('@oi/utilities/lists/countries.json');

const _iForm = new form();
_iForm.formConfig = require('account-manager-module/profile/managePhoneNumber/phoneNumberEntryConfig.json');

const PhoneNumberEntryForm = ({
    contactToUpdate = null,
    onProcessEnd=function(){}
}) => {

    let AppLevelContext = useContext(AppContext);

    let formValues = useRef(contactToUpdate !== null ?
        {...contactToUpdate} : _iForm.getInitialFormObject());

    const [validationError, setValidationError] = useState([]);
    const [showPhoneNumberEntryForm,setShowPhoneNumberEntryForm]=useState(true);
    const [showVerifyOTPForm, setVerifyOTPFormFlag] = useState(false);

    const handleFormValues = (params) => {
        formValues.current = Object.assign(formValues.current, params);
    }

    const handleOnSubmission = async (e) => {

        try{

            e.preventDefault();

            //validation check 
            let _d = _iForm.validateForm(formValues.current);
            setValidationError(_d);

            if (_d.length > 0) {
                alert("Please enter required information.");

            } else {            
                
                AppLevelContext.setOnScreenLoader({
                    "show":true,
                    "message":"Verifying data"
                });

                //Check if phone number is being edited or its new phone number being added
                //If new. New uuid is added to the phone number 
                //If its an update check if phone number was updated. If yes, reset the verified flag 
                if(contactToUpdate === null ){
                    formValues.current.uuid = uuidv4() ;
                    formValues.current.verified = false;

                    //checks if duplicate. If duplicate error is throws and execution is stopped
                    await utils.isDuplicateContact(formValues.current);

                    //send sms
                    await sendSMS();
                    
                }else if(contactToUpdate!==null && utils.isPhoneNumberUpdated(formValues.current,contactToUpdate)){
                    formValues.current.verified = false;

                    //checks if duplicate. If duplicate error is throws and execution is stopped
                    await utils.isDuplicateContact(formValues.current);

                    //send sms
                    await sendSMS();

                //The phone number is being updated. 
                //But the phone number was not updated. Instead other infomation might have been updated
                //SO no need for phone number verification
                }else if(contactToUpdate!==null && !utils.isPhoneNumberUpdated(formValues.current,contactToUpdate)){
                    
                    //no need to check if number is dup 
                    await updateUserContact();

                }

            }
        } catch (error) {
            console.log(error);
            if (error === "duplicate_number") Alert.alert("Duplicate number. This number already exists");
        }
    }

    const sendSMS = async (otp) => {

        try {

            AppLevelContext.setOnScreenLoader({
                show:true,
                "message":"Sending verification code"
            });

            let otpResponse = await getOTP();//get new OTP from server

            let otp = otpResponse.otp;

            //Send otp via sms
            await fetch('/aws/sendsms', {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    "otp": otp,
                    "phone_number": utils.constructPhoneNumber(formValues.current),
                    "message": `Owninvention otp/verification code: ${otp}. Expires in 30 minutes.`
                })
            });

            //show otp form
            setVerifyOTPFormFlag(true);

            AppLevelContext.removeOnScreenLoader();

            //hide the showPhoneNumberEntryForm
            setShowPhoneNumberEntryForm(false);

        } catch (error) {
            throw error;
        }


    }

    const updateUserContact=async ()=>{
        
        AppLevelContext.setOnScreenLoader({
            "show":true,
            "message":"Updating user information"
        });

        let userInfo=await utils.updateUserContact(formValues.current,AppLevelContext.userInfo);
        AppLevelContext.setUserInfo(userInfo);
        
        AppLevelContext.removeOnScreenLoader();

        setVerifyOTPFormFlag(false);//unmount verification code form 
        onProcessEnd();//execute on completion. Unmount PhonNumberEntryForm
    }
    
    return (
        <>
        {
            showPhoneNumberEntryForm?
            <Modal
                onCloseHandler={() => { onProcessEnd() }}
                header={<div className="p-2">
                    <h3>Phone Number Entry</h3>
                </div>}>
                <form onSubmit={(e) => { handleOnSubmission(e) }}>
                    <div className="text-muted mt-2 pb-2">
                        <b>Please Note: </b>We will send verification code via message (sms) to confirm your phone number, if new phone number is added or existing phoen number is changed.
                        Please enter the phone number where you can recieve the text messages.
                </div>
                    <div className="form-group">
                        <label data-required="1">Contact Type </label>
                        <select name="contactType"
                            onChange={(e) => {
                                handleFormValues({ contactType: e.target.value });
                            }}
                            defaultValue={contactToUpdate!==null?contactToUpdate.contactType:null}
                            className="form-control"
                            data-required="1"
                            placeholder="Contact Type" >
                            <option value=""></option>
                            <option value="mobile">Mobile</option>
                            <option value="office">Office</option>
                            <option value="home">Home</option>
                        </select>
                        {validationError.length > 0 ?
                            _iForm.displayValidationError("contactType") : null
                        }
                    </div>
                    <div className="form-group">
                        <label htmlFor="country-phonenumberentry" data-required="1">Country Code</label>
                        <select name="country"
                            onChange={(e) => {
                                handleFormValues({ country: countries.find(_c => _c._id === e.target.value) });
                            }}
                            defaultValue={contactToUpdate!==null?contactToUpdate.country._id:null}
                            id="country-phonenumberentry"
                            className="form-control"
                            data-required="1"
                            placeholder="Country code" >
                            <option value=""></option>
                            {countries.map(c => {
                                return <option key={c._id}
                                    value={c._id}>({c.dialCode}) {c.name} </option>
                            })}
                        </select>
                        {validationError.length > 0 ?
                            _iForm.displayValidationError("country") : null
                        }
                    </div>
                    <div className="form-group">
                        <label htmlFor="contactNumber" data-required="1">Phone Number </label>
                        <input type="text" name="contactNumber"
                            onInput={(e) => {
                                handleFormValues({ contactNumber: e.target.value });
                            }}
                            defaultValue={contactToUpdate!==null?contactToUpdate.contactNumber:null}
                            id="contactNumber"
                            className="form-control entry-field"
                            data-required="1"
                            placeholder="Phone Number" maxLength="12" />
                        {validationError.length > 0 ?
                            _iForm.displayValidationError("contactNumber") : null
                        }
                    </div>
                    <div className="mt-2 text-center">
                        <button className="btn btn-primary w-75" type="submit">Update Information</button>
                    </div>
                </form>
            </Modal>:
            null
        }
            {
                showVerifyOTPForm ?
                    <VerifyOTPForm
                        onCloseHandler={setVerifyOTPFormFlag}
                        verificationNumber={AppLevelContext.userInfo.verificationNumber}
                        contactInfo={utils.constructPhoneNumber(formValues.current)}
                        afterSuccessfullVerification={()=>{
                            formValues.current.verified=true;//updating the verification to be true
                            updateUserContact();
                        }}
                    /> :
                    null
            }
        </>)
}

export default PhoneNumberEntryForm;