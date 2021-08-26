import React, { useContext, useRef, useState } from 'react';

import { Formik } from 'formik';
import * as Yup from 'yup';//creates the validation schema 

import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";

import { getUserInfo } from "account-manager-module/lib/user/handlers";
import { executeLogoutSteps } from "account-manager-module/lib/auth/logout/handlers";


import { VerifyOTPForm } from "../../otp/vertifyOtpForm";
import { getOTP } from "../../otp/getOtp";
import {emailTemplate} from "../../otp/otpTemplates";

import { AppContext } from "../../../AppContext";

const UserEmailIdpdateValidationScheme = Yup.object().shape({
    "emailId": Yup.string().required("Please enter the firstname").nullable(true),
});

export const UpdateEmailForm = ({
    handleOnClose
}) => {

    let { userInfo, updateUserContextInfo } = useContext(AppContext);

    let updatedEmail = useRef("");

    const [showOtpForm, setShowOtpForm] = useState(false);

    const [errorObject,setErrorObject]=useState({
        isError:false,
        message:""
    });

    const sendEmail = async function (toAddress) {

        try {
            let otpResponse = await getOTP();//get new OTP from server
            //console.log(otpResponse);

            //send email 
            let messageId=await fetch('/aws/sendemail', {
                method: "POST",
                body: JSON.stringify({
                    "body": emailTemplate(otpResponse.otp),
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
            throw new Error('ERROR_SENDING_EMAIL');
        }
    };

    const handleOnNext = async (values, formikBag) => {

        try {

            setErrorObject({
                isError:false,
                message:""
            });//Clear Errors

            //1. Check if email is different than the current email
            if (values.emailId === userInfo.emailId) throw new Error("EMAIL_UNCHANGED");

            //2. Check if email id already exists
            let checkUserExists = await getUserInfo({ "emailId": values.emailId });

            if (checkUserExists.length > 0) throw new Error("DUPLICATE_USER");

            //3. Send OTP ot the email
            await sendEmail(values.emailId);

            setShowOtpForm(true);//show otp form

        } catch (error) {
            console.log(error);
            formikBag.setSubmitting(false);
            
            let _d={...errorObject};
            _d.isError=true;

            switch (error.message) {
                case "DUPLICATE_USER":
                    _d.message="Duplicate Email. User with same email exists in our system. Please enter different email."
                    break;

                case "EMAIL_UNCHANGED":
                    _d.message="There is no change to the email. May click on close button to close the form."

                    break;

                case "ERROR_SENDING_EMAIL":
                    _d.message="There was an error in sending OTP to the email id. Please try again or contact us."

                    break;

                default:
                    console.log(error);
                    break;
            }

            setErrorObject(_d);
        }


    }

    const handleEmailUpdateSubmission = () => {

        let data = {
            "emailId": updatedEmail.current
        }

        fetch('/account/api/user/profile/update', {
            method: "POST",
            body: JSON.stringify(Object.assign(data, {
                "_id": userInfo._id
            })),
            headers: {
                "content-type": "application/json",
            }

        }).then(response => response.json())
        .then(data => {

            handleOnClose(false);//close the modal

            executeLogoutSteps(); //user will be navigated to login screen once logged out       

        }).catch(err => {
            let _d={...errorObject};
            _d.isError=true;
            _d.message="Error in updating the email Id";
            setErrorObject(_d);
        });
    }

    return (
        <Modal show onHide={() => { handleOnClose(false) }}>

            <Modal.Header closeButton>
                <Modal.Title>Update Email</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Alert variant="info">
                    <Alert.Heading>Important Note</Alert.Heading>
                    <p>
                        One Time Password (OTP) will be sent to the updated email id to verify your email.
                        Once OTP is verified and email id is updated successfully.
                        You will be logged out of the system and next time you login you should use the new email id.
                    </p>
                </Alert>

                {
                    errorObject.isError ?
                        <Alert variant="danger" className="my-2">
                            <Alert.Heading>Error</Alert.Heading>
                            <p>
                                {errorObject.message}
                            </p>
                        </Alert> :
                        null
                }

                {
                    !showOtpForm ?
                        <Formik
                            validationSchema={UserEmailIdpdateValidationScheme}
                            onSubmit={(values, formikBag) => { handleOnNext(values, formikBag) }}
                            initialValues={{
                                "emailId": userInfo.emailId
                            }}>
                            {
                                ({
                                    handleChange,
                                    handleBlur,
                                    handleSubmit,
                                    isSubmitting,
                                    errors,
                                    values
                                }) => {
                                    return <Form noValidate onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSubmit();
                                    }}>
                                        <Form.Group>
                                            <Form.Label>Email Id</Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="emailId"
                                                onChange={(e) => {
                                                    updatedEmail.current = e.target.value;
                                                    handleChange(e)
                                                }}
                                                onBlur={(e) => {
                                                    updatedEmail.current = e.target.value;
                                                    handleBlur(e)
                                                }}
                                                isInvalid={!!errors.emailId}
                                                defaultValue={values.emailId}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.emailId}
                                            </Form.Control.Feedback>
                                        </Form.Group>

                                        <div className="py-2 d-flex flex-row justify-content-end">
                                            <Button variant="primary" type="submit" className="d-flex flex-row align-contents-center" disabled={isSubmitting}>
                                                {
                                                    isSubmitting ?
                                                        <div className="mr-2"><Spinner variant="default" size="sm" animation="border"></Spinner></div> :
                                                        null
                                                }
                                                <div>Send OTP</div>
                                            </Button>
                                            <Button variant="light" className="ml-2" onClick={() => { handleOnClose(false) }}>Close</Button>
                                        </div>

                                    </Form>
                                }
                            }
                        </Formik> :
                        <div>
                            <Alert variant="success">
                                <Alert.Heading>OTP Sent</Alert.Heading>
                                <p>OTP (One time password) has been sent to the email Id</p>
                            </Alert>
                            <VerifyOTPForm 
                                verificationNumber={userInfo.verificationNumber}
                                handleOnClose={handleOnClose}
                                afterVerification={handleEmailUpdateSubmission} />
                        </div>
                }

            </Modal.Body>

        </Modal>
    )
}