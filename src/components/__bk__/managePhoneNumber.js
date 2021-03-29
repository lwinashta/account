import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from "../../AppContext";

const countries=require('@oi/utilities/lists/countries.json');

export const ManagePhoneNumbers = ({}) => {

    let AppLevelContext=useContext(AppContext);

    const [showPhoneNumberEntryForm,setPhoneNumberEntryFormFlag]=useState(false);
    const [showVerifyOTPForm,setVerifyOTPFormFlag]=useState(false);
    const [currentPhoneNumber,setCurrentPhoneNumber]=useState({});

    useEffect(()=>{
        if(!setVerifyOTPFormFlag){
            setCurrentPhoneNumber({});
        }
    },[setVerifyOTPFormFlag]);


    const sendOTP=function(phoneNumber){
        
        return new Promise((resolve,reject)=>{

            //-- Get New OTP -- 
            $.post('/account/api/user/getotp',{
                "verification_number":params.userInfo.verification_number

            }).then(otpResponse=>{
                console.log(otpResponse);
                
                return $.getJSON('/aws/sendsms',{
                    "otp":otpResponse.otp.otp,
                    "phone_number":phoneNumber,
                    "message":`Owninvention verification code: ${otpResponse.otp.otp}. 
                        Please enter this code to verify your phoner number. Code expires in 30 minutes.`
                });

            }).then(smsResponse=>{
                resolve(smsResponse);

            }).catch(err=>{
                reject(err);
            });
        });
    };

    const handleOTPVerification = function (e) {

        e.preventDefault();

        let form = e.target;
        let verifyOTPButton=$(form).find('button[type="submit"]');

        //add loader to button 
        uiButtons.addLoader(verifyOTPButton);

        //check required field 
        let validation = _formjs.validateForm(form);

        if (validation === 0) {

            let otp = $(form).find('[name="otp"]').val();

            $.post('/account/api/user/verifyotp', {
                otp: otp,
                verification_number: params.userInfo.verification_number

            }).then(otpResponse => {
                //console.log(otpResponse);
                if(otpResponse.length>0){
                    return addNewPhoneNumber(otpResponse);

                }else{
                    throw 'error in verifying otp';
                }
                
            }).then(updatedInfo => {
                console.log(updatedInfo);

                //close the form
                setVerifyOTPFormFlag(false);

                //update the context
                params.updateUserInfoContext({
                    "user_phone_numbers": updatedInfo.user_phone_numbers
                });

            }).catch(err => {

                console.error(err);

                uiButtons.removeLoader(verifyOTPButton);

                if (err.status === 401) {
                    $(form).find('[name="otp"]').closest('.form-group').append('<div class="required-err">Invalid verification code. Try Again.</div>');
                } else {
                    (form).find('[name="otp"]').closest('.form-group').append('<div class="required-err">Error encontered during verification. Try Again.</div>');
                }

            });

        } else {

            uiButtons.removeLoader(verifyOTPButton);

            popup.onBottomCenterRequiredErrorMsg();
        }

    }

    const addNewPhoneNumber = function () {

        return new Promise((resolve, reject) => {

            let contacts = [];
            let newContact = currentPhoneNumber;

            newContact.default = false;

            let data = {
                _id: params.userInfo._id
            };

            //check if user_contacts exists 
            if (!('user_phone_numbers' in params.userInfo)) {
                newContact.default = true;
                newContact._id = getRandomId();
                contacts.push(newContact);
            } else {
                contacts = contacts.concat(params.userInfo.user_phone_numbers, [newContact]);
                newContact._id = getRandomId(params.userInfo.user_phone_numbers.length);
            }

            data.user_phone_numbers = contacts;

            let fdata = _formjs.convertJsonToFormdataObject(data);

            //verified and correct 
            //Add the phone number to user contacts 

            $.ajax({
                "url": '/account/api/user/update',
                "processData": false,
                "contentType": false,
                "data": fdata,
                "method": "POST"
            }).then(response => {
                resolve(data);

            }).catch(err => {
                reject(err);
            });
        });
    }

    const handleDeleteContactNumber=function(_id){

        popup.messageBox({
            message: "Are you sure to remove this contact information?",
            buttons: [{
                    "label": "Yes",
                    "class": "btn-danger",
                    "id": "yes-button",
                    "callback": function () {
                        popup.remove(); //remove the confirmation pop up 
                        popup.onScreen("Deleting...");

                        let indx=params.userInfo.user_phone_numbers.findIndex(c=>c._id===_id);
                        let contacts=params.userInfo.user_phone_numbers.splice(indx,1);

                        let data={
                            "user_phone_numbers":params.userInfo.user_phone_numbers,
                            "_id": params.userInfo._id
                        }

                        let fdata = _formjs.convertJsonToFormdataObject(data);

                        //verified and correct 
                        //Add the phone number to user contacts 

                        $.ajax({
                            "url": '/account/api/user/update',
                            "processData": false,
                            "contentType": false,
                            "data": fdata,
                            "method": "POST"
                        }).then(response => {
                            //update the context
                            params.updateUserInfoContext(data);

                            popup.remove();
                            popup.onBottomCenterSuccessMessage("Contact deleted");

                        }).catch(err => {
                            reject(err);
                        });
                    }
                },
                {
                    "label": "No",
                    "class": "btn-link",
                    "id": "no-button",
                    "callback": function () {
                        popup.remove(); //remove the confirmation pop up 
                    }
                }
            ]
        });

    }

    const handleSetDefaultContactNumber=function(_id){

        popup.onScreen("Updating...");

        let indx=params.userInfo.user_phone_numbers.findIndex(c=>c._id===_id);
        let data={
            "user_phone_numbers":[...params.userInfo.user_phone_numbers],
            "_id":params.userInfo._id
        };
        data.user_phone_numbers.forEach((number,i)=>{
            if(i!==indx){
                number.default=false;
            }else{
                number.default=true;
            }
        });

        let fdata = _formjs.convertJsonToFormdataObject(data);

        $.ajax({
            "url": '/account/api/user/update',
            "processData": false,
            "contentType": false,
            "data": fdata,
            "method": "POST"
        }).then(response => {
            //update the context
            params.updateUserInfoContext(data.user_phone_numbers);

            popup.remove();
            popup.onBottomCenterSuccessMessage("Contact updated");

        }).catch(err => {
            reject(err);
        });


    }

    return (
        <UserInfo.Consumer>
            {({ userInfo = {} }) => {
                return (<div>
                    <div>
                        {
                            'user_phone_numbers' in userInfo ?
                                userInfo.user_phone_numbers.sort((a,b)=>{
                                    if(a.default) return -1;
                                    return 1;
                                }).map((phone, indx) => {
                                    return <div key={indx} _id={phone._id} className="position-relative border-bottom p-1">
                                        <div>
                                            <div>{phone.dial_code}{phone.contact_number}</div>
                                            <div className="small">{phone.type} {phone.default ? <span className="text-success">(default)</span> : ""}</div>
                                        </div>
                                        <div className="push-right">
                                            {!phone.default ? <div className="d-inline-block ml-2 small btn-link text-success pointer" onClick={()=>{handleSetDefaultContactNumber(phone._id)}}>Set default</div> : ""}
                                            {!phone.default ? <div className="d-inline-block ml-2 small btn-link text-danger pointer" onClick={()=>{handleDeleteContactNumber(phone._id)}}>Delete</div> : ""}
                                        </div>
                                    </div>
                                }) : ""
                        }
                    </div>

                    <div className="w-100 pt-2" onClick={() => { setPhoneNumberEntryFormFlag(true) }}>
                        <div className="small btn-link pointer">Add New Phone Number</div>
                    </div>
                    {
                        showPhoneNumberEntryForm ?
                            <Modal
                                onCloseHandler={() => { setPhoneNumberEntryFormFlag(false) }}
                                header={<div className="p-2">
                                    <h3>Phone Number Entry</h3>
                                </div>}>
                                <form id="add-user-contact-info-form" onSubmit={(e) => { handlePhoneEntrySubmission(e) }}>
                                    <div className="form-group">
                                        <label htmlFor="phone-number" data-required="1">Phone Number </label>
                                        <div className="text-muted">
                                            <b>Please Note: </b>We will send verification code via message (sms) to confirm your phone number.
                                            Please enter the phone number where you can recieve the text messages.
                                        </div>
                                        <div className="row">
                                            <div className="col">
                                                <select name="countryCode"
                                                    className="form-control"
                                                    data-required="1" 
                                                    placeholder="Country code" >
                                                    <option value=""></option>
                                                    {countries.map(c => {
                                                        return <option key={c._id} value={c.dial_code}>{c.name} ({c.dial_code})</option>
                                                    })}
                                                </select>
                                            </div>
                                            <div className="col">
                                                <input type="text" name="contactNumber"
                                                    id="personal-primary-number"
                                                    className="form-control entry-field"
                                                    data-required="1" placeholder="Phone Number" maxLength="12" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-center">
                                        <button className="btn btn-primary w-75" type="submit">Send Verification Code</button>
                                    </div>
                                </form>
                            </Modal> : null
                    }

                    {
                        showVerifyOTPForm ?
                            <Modal
                                onCloseHandler={() => { setVerifyOTPFormFlag(false) }}
                                header={<div className="p-2">
                                    <h3>Phone Number Entry</h3>
                                </div>}>
                                <form id="verify-otp-form" onSubmit={(e) => { handleOTPVerification(e) }}>
                                    <div className="form-group">
                                        <label htmlFor="phone-number" data-required="1">Verification Code </label>
                                        <div className="text-muted font-weight-bold mb-2">
                                            Please enter the verification code sent to <b>{currentPhoneNumber.dial_code}{currentPhoneNumber.contact_number}</b>.
                                    </div>
                                        <input type="text" name="otp"
                                            id="otp"
                                            className="form-control entry-field"
                                            data-required="1" placeholder="Verification Code" />
                                    </div>
                                    <div className="mt-2 text-center">
                                        <button className="btn btn-info w-75" type="submit">Verify</button>
                                    </div>
                                </form>
                            </Modal> : null
                    }
                </div>)
            }}
        </UserInfo.Consumer>)
}