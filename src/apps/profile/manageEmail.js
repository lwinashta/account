import React, { useContext, useEffect,useState } from 'react';
import { UserInfo } from "./../../contexts/userInfo";
import { formjs } from "@oi/utilities/lib/js/form";
import { Modal } from "@oi/reactcomponents";


export const ManageEmail = () => {

    let params = useContext(UserInfo);
    let _formjs = new formjs();

    const [showUpdateEmailForm, setUpdateEmailFormFlag] = useState(false);
    const [showVerifyOTPForm,setVerifyOTPFormFlag]=useState(false);
    const [updatedEmailId,setUpdatedEmaiId]=useState("");

    useEffect(() => {

    }, []);

    let otpEmailTemplate = (otp) => {
        return `<div style="text-align:center">
            <h3 style="color:coral">Email Verification</h3>
            <p style="font-weight:bold">Please verify your email id by entering the One Time Password (OTP) stated in this email. 
                The OTP will expire within 30 mins. Please do not forward or reply to this email.</p>
            <div style="padding: 10px;background-color: dodgerblue;color: white;display: inline-block;border-radius: 5px;font-weight:bold">${otp}</div>
        </div>`;
    }

    const sendEmail = function (toAddress) {

        return new Promise((resolve, reject) => {

            //-- Get New OTP -- 
            $.post('/account/api/user/getotp', {
                "verification_number": params.userInfo.verification_number

            }).then(otpResponse => {
                //console.log(otpResponse);

                return $.post('/aws/sendemail', {
                    "body": otpEmailTemplate(otpResponse.otp.otp),
                    "to": toAddress,
                    "subject": `Email verification required`
                });

            }).then(messageId => {
                resolve(messageId);

            }).catch(err => {
                reject(err);
            });
        });
    };

    const handleEmailUpdateSubmission = (e) => {
        
        e.preventDefault();

        let form = e.target;

        let emailId = $(form).find('input[name="email_id"]').val();
        let sendOTPButton=$(form).find('button[type="submit"]');

        if (emailId === params.userInfo.email_id) {
            popup.onBottomCenterErrorOccured("No change to email");
            return false;
        }

        uiButtons.addLoader(sendOTPButton);

        let validate = _formjs.validateForm(form);

        if (validate === 0) {

            //check if email id already exists 
            $.get('/account/api/user/get',{
                "email_id":emailId

            }).then(function(userInfo){

                if(userInfo.length>0){
                    throw "duplicate email";
                }

                return sendEmail(emailId);//send Email and then show the Verify OTP form 

            }).then(function(messageId){
                
                //console.log(messageId);

                setUpdateEmailFormFlag(false);//close the updte email form
                setUpdatedEmaiId(emailId);//set the updated email id in state variable
                setVerifyOTPFormFlag(true);//Open the veirfy otp form 

            }).catch(function(err){
                console.log(err);
                if(err==='duplicate email'){
                    $(form).find('input[name="email_id"]').closest('.form-group').append(`<div class="required-err">Duplicate Email Id. Entered email id already exists in our system.</div>`);;
                }else{
                    $(form).find('input[name="email_id"]').closest('.form-group').append(`<div class="required-err">Error in sending email to the entered email id. Please check your email and try again.</div>`);;
                    popup.onBottomCenterErrorOccured("Error while sending the email");
                }

                uiButtons.removeLoader(sendOTPButton); 

            });

        } else {
            uiButtons.removeLoader(sendOTPButton);
            popup.onBottomCenterRequiredErrorMsg();
        }
    }

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

            }).then(function(otpResponse){
                
                //console.log(otpResponse);
                if(otpResponse.length>0){
                    return updateEmailId();

                }else{
                    throw 'error in verifying otp';
                }
                
            }).then(function(updatedInfo){
                //console.log(updatedInfo);
                window.location.reload();//reloading will logout user 

            }).catch(function(err){

                console.error(err);

                uiButtons.removeLoader(verifyOTPButton);

                if (err.status === 401) {
                    $(form).find('[name="otp"]').closest('.form-group').append('<div class="required-err">Invalid verification code. Try Again.</div>');
                } else {
                    $(form).find('[name="otp"]').closest('.form-group').append('<div class="required-err">Error encontered during verification. Try Again.</div>');
                }

            });

        } else {

            uiButtons.removeLoader(verifyOTPButton);

            popup.onBottomCenterRequiredErrorMsg();
        }

    }

    const updateEmailId=()=>{
        
        let data={
            email_id:updatedEmailId,
            _id:params.userInfo._id
        }

        let fdata = _formjs.convertJsonToFormdataObject(data);

        return $.ajax({
            "url": '/account/api/user/update',
            "processData": false,
            "contentType": false,
            "data": fdata,
            "method": "POST"
        });
    }

    return (
        <UserInfo.Consumer>
            {({ userInfo = {} }) => {
                return <div>
                    {
                        userInfo.email_id !== null ?
                            <div>
                                <div className="d-inline-block text-lower ml-5">
                                    <div>{userInfo.email_id}</div>
                                    {
                                        'facebook_user_id' in userInfo?
                                            <div className="small text-muted">
                                            Facebook account users cannot update thier email. 
                                            To change your email please update your email for facebook account.
                                            </div>:null
                                    }
                                    <div className="text-muted small">Email</div>
                                </div>
                                {
                                    !('facebook_user_id' in userInfo)?
                                    <div className="push-right pointer p-1 edit-item-button" onClick={() => { setUpdateEmailFormFlag(true) }}>
                                        <div className="small btn-link pointer">Edit</div>
                                    </div>:null
                                }
                                
                            </div>
                            : 'facebook_user_id' in userInfo ?
                                <div className="text-muted small">
                                    Email was not shared while logging as facebook user. You can new email address or allow facebook to share your email. 
                                </div>
                            : null
                    }

                    {
                        showUpdateEmailForm ?
                            <Modal
                                header={<h4> Update Email address </h4>}
                                onCloseHandler={() => { setUpdateEmailFormFlag(false) }}>
                                <form onSubmit={(e) => { handleEmailUpdateSubmission(e) }}>
                                    <div className="text-muted">
                                        Updating the email will update the userid with which you login.
                                        To verify your email id we will send One Time Password (OTP) to your email account.
                                        Once your email id is updated successfully; next time you login you should use new email id.
                                    </div>
                                    <div className="form-group mt-2">
                                        <input type="email" id="personal-email-id"
                                            name="email_id" className='form-control entry-field'
                                            data-required="1" placeholder="Email Id"
                                            autoComplete="off" defaultValue={userInfo.email_id} />
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
                                            Please enter the verification code sent to <span style={{ color: "crimson" }}>{updatedEmailId}</span>.
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
                </div>

            }}
        </UserInfo.Consumer>
    )
}