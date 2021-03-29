import React, { useState,useRef,useContext } from 'react';
import { Modal } from "core/components/modal/web/modal";
import {FieldEntryError} from 'form-module/fieldEntryError';
import { AppContext } from "../../AppContext";

const VerifyOTPForm = ({ 
    onCloseHandler=function(){},
    afterSuccessfullVerification=function(){},
    verificationNumber=null,
    contactInfo="",  
}) => {
    
    let AppLevelContext = useContext(AppContext);

    const [validationError,setValidationError]=useState("");
    
    let formValues=useRef({
        verificationCode:""
    });

    const validateOTPValue=()=>{
        if(formValues.current.verificationCode.length===0 ) {setValidationError("required");return false;};
        if(formValues.current.verificationCode.length>0 
            &&  formValues.current.verificationCode.length<6) {setValidationError("invalid");return false;};

        return true;
    }

    const handleSubmission=function(e){
        
        //get the related form 
        e.preventDefault();

        //check required field 
        if (validateOTPValue() ) {

            AppLevelContext.setOnScreenLoader({
                "show":true,
                "message":"Verifying code"
            });

            fetch('/account/api/user/verifyotp',{
                method:"POST",
                body:JSON.stringify({
                    otp:formValues.current.verificationCode,
                    verificationNumber:verificationNumber
                }),
                headers: {
                    "content-type": "application/json"
                }
            })
            .then(response=>response.json())
            .then(data=>{
                console.log(data);
                afterSuccessfullVerification(data);

            }).catch(err => {
                console.error(err);
                
                AppLevelContext.removeOnScreenLoader();

                if (err.status === 401) {
                    setValidationError("invalid");
                } else {
                    alert("Error while validating. Please try again");
                }

            });
            
        }
    }

    return (
        <Modal 
            onCloseHandler={() => { onCloseHandler(false) }} 
            header={<h2>Verification Code</h2>}>
            <form id="verify-otp-form" onSubmit={(e) => { handleSubmission(e) }}>
                <div className="form-group">
                    <label htmlFor="phone-number" data-required="1">Verification Code </label>
                    <div className="text-muted font-weight-bold mb-2">
                        Please enter the verification code sent to <b>{contactInfo}</b>.
                    </div>
                    <input type="text" name="otp"
                        id="otp"
                        onInput={(e)=>{formValues.current.verificationCode=e.target.value}}
                        className="form-control"
                        data-required="1" 
                        placeholder="Verification Code" />
                    {
                        validationError==="required"?
                            <FieldEntryError 
                                title=" Verification code" 
                                prefix="is required" />:
                        validationError==="invalid"?
                            <FieldEntryError 
                                title=" Verification code" 
                                prefix="is in valid" />:
                        null
                    }
                </div>
                <div className="mt-2 text-center">
                    <button className="btn btn-info w-75">Verify</button>
                </div>
            </form>
        </Modal>
        
    );

}

export default VerifyOTPForm;