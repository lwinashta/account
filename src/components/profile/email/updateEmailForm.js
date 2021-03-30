import React,{useContext,useRef,useState} from 'react';

import { form } from "form-module/form";
import { getUserInfo } from "account-manager-module/lib/user/handlers";
import { Modal } from "core/components/modal/web/modal";

import { AppContext } from "../../AppContext";
import {EmailTemplate} from "../otp/otpTemplates";
import { getOTP } from "../otp/getOtp";

//create instance of form
let _iForm = new form();

//define the form definition 
_iForm.formConfig = require('account-manager-module/lib/user/email/form/config.json');

const UpdateEmailform = (props) => {
    
    let AppLevelContext = useContext(AppContext);
    let formValues=useRef(_iForm.getInitialFormObject());
    
    const [validationError, setValidationError] = useState([]);

    const manageFormValues = (params) => {
        formValues.current = Object.assign(formValues.current, params);
    }

    const sendEmail = async function (toAddress) {

        try {
            let otpResponse=await getOTP();//get new OTP from server
            //console.log(otpResponse);

            //send email 
            let messageId=await fetch('/aws/sendemail',{
                method: "POST",
                body: JSON.stringify({
                    "body": EmailTemplate(otpResponse.otp),
                    "to": toAddress,
                    "subject": `Email verification required`
                }),
                headers: {
                    "content-type": "application/json"
                }
            });

            console.log(messageId);
                
        } catch (error) {
            console.log(error);
            throw 'error_sending_otp_email';
        }
    };

    const handleEmailUpdateSubmission = async(e) => {

        try {
            e.preventDefault();
            
            let _d = _iForm.validateForm(formValues.current);
            
            if (_d.length > 0) {
                setValidationError(_d);//validation error found. User needs to fix the errors before proceeding
                throw "validation_error";

            } else {
               
                //check if value has changed 
                if (formValues.current.emailId === AppLevelContext.userInfo.emailId) {
                    throw "no_change_to_emailid";
                }

                AppLevelContext.setOnScreenLoader({
                    "show":true,
                    "message":"Sending verification code"
                });

                //check if email id already existss
                let checkUserExists = await getUserInfo({ "emailId": formValues.current.emailId });

                if(checkUserExists.length>0){//User Exists. 
                    throw "duplicate_user";
                    
                }else{
                    let messageId=await sendEmail();
                    
                    props.onCloseHandler(false);//close the form 
                    props.setUpdatedEmaiId(formValues.current.emailId);//set the updated email id in state variable of the parent component
    
                }

            }
    
        } catch (error) {

            console.log(error);

            AppLevelContext.removeOnScreenLoader();

            if(error==="no_change_to_emailid") props.onCloseHandler(false);
            if(error==="duplicate_user") alert("Duplicate user. User already exists in our system");
            if(error==="error_sending_otp_email") alert("Error in sending email. Please try again in sometime.");
        }
        
    }    

    return ( <Modal
        header={<h4> Update Email address </h4>}
        onCloseHandler={() => { props.onCloseHandler(false) }}>

        <form onSubmit={(e) => { handleEmailUpdateSubmission(e) }}>
            <div className="text-muted">
                <b>Please Note: </b> One Time Password (OTP) will be sent to the updated email id to verify your email.
                Once OTP is verified and email id is updated successfully, you will be logged out of the system and next time you login you should use the new email id.
            </div>
            <div className="form-group mt-2">
                <input type="email" 
                    name="emailId" 
                    className='form-control'
                    data-required="1" 
                    placeholder="Email Id"
                    autoComplete="off" 
                    onInput={(e)=>{manageFormValues({
                        emailId:e.target.value
                    })}}
                    defaultValue={AppLevelContext.userInfo.emailId} />
                {validationError.length > 0 ?
                    _iForm.displayValidationError("emailId"):null
                }
            </div>
            <div className="mt-2 text-center">
                <button className="btn btn-primary w-75" type="submit">Send Verification Code</button>
            </div>
        </form>
    </Modal> );
}
 
export default UpdateEmailform;