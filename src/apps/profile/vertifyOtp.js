import React from 'react';
import { formjs } from "@oi/utilities/lib/js/form";

export const VerifyOTP = ({ userInfo={},contactInfo="",afterSubmission={} }) => {

    let _formjs = new formjs();
    const verifyOTPButton=React.createRef();

    const handleSubmission=function(e){
        
        //get the related form 
        e.preventDefault();

        //add loader to button 
        uiButtons.addLoader(verifyOTPButton.current);

        let form = e.target;

        //check required field 
        let validation = _formjs.validateForm(form);

        if (validation === 0) {
            let otp=$(form).find('[name="otp"]').val();
            
            $.post('/account/api/user/verifyotp',{
                otp:otp,
                verification_number:userInfo.verification_number

            }).then(otpResponse=>{
                console.log(otpResponse);
                afterSubmission(otpResponse);

            }).catch(err => {

                console.error(err);

                uiButtons.removeLoader(verifyOTPButton.current);

                if (err.status === 401) {
                    $(form).find('[name="otp"]').closest('.form-group').append('<div class="required-err">Invalid verification code. Try Again.</div>');
                } else {
                    (form).find('[name="otp"]').closest('.form-group').append('<div class="required-err">Error encontered during verification. Try Again.</div>');
                }

            });

        } else {

            uiButtons.removeLoader(verifyOTPButton.current);

            popup.onBottomCenterRequiredErrorMsg();
        }
    }

    return (
        <form id="verify-otp-form" onSubmit={(e) => { handleSubmission(e) }}>
            <div className="form-group">
                <label htmlFor="phone-number" data-required="1">Verification Code </label>
                <div className="text-muted font-weight-bold mb-2">
                    Please enter the verification code sent to <b>{contactInfo}</b>.
                </div>
                <input type="text" name="otp"
                    id="otp"
                    className="form-control entry-field"
                    data-required="1" placeholder="Verification Code" />
            </div>
            <div className="mt-2 text-center">
                <button className="btn btn-info w-75" ref={verifyOTPButton}>Verify</button>
            </div>
        </form>
    );

}