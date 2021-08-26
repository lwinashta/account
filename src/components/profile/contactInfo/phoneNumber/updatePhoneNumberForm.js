import React, { useContext, useRef, useState } from 'react';

import { Formik } from 'formik';
import * as Yup from 'yup';//creates the validation schema 

import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import * as utils from "account-manager-module/lib/user/phoneNumber/handlers"

import { VerifyOTPForm } from "../../otp/vertifyOtpForm";
import { getOTP } from "../../otp/getOtp";

import { AppContext } from "../../../AppContext";

const UserPhonerNumberUpdateValidationScheme = Yup.object().shape({
    "phoneNumber": Yup.number().required("Please enter the phone number").nullable(true),
    "country": Yup.object().required("Please select the country").nullable(true),
});

export const UpdatePhoneNumberForm = ({
    countries,
    handleOnClose
}) => {

    let { userInfo, updateUserContextInfo } = useContext(AppContext);

    let updatedPhoneNumber = useRef({
        "country": null,
        "phoneNumber": null
    });

    const [showOtpForm, setShowOtpForm] = useState(false);

    const [errorObject, setErrorObject] = useState({
        isError: false,
        message: ""
    });

    const sendSMS = async (values) => {
        console.log(values)
        try {

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
                    "phone_number": utils.constructPhoneNumber(values),
                    "message": `Owninvention verification code: ${otp}. Expires in 30 minutes.`
                })
            });

            //show otp form
            setShowOtpForm(true);

        } catch (error) {
            throw new Error("ERROR_SENDING_SMS");
        }

    }

    const handleOnNext = async (values, formikBag) => {
        console.log(updatedPhoneNumber.current,values);
        try {

            setErrorObject({
                isError: false,
                message: ""
            });//Clear Errors

            //1. Check if phone is different than the current email
            if(utils.constructPhoneNumber(values) 
                === utils.constructPhoneNumber(userInfo.contactNumber)) 
                throw new Error("PHONE_NUMBER_UNCHANGED");

            //2. Check if phone numbder already exists
            await utils.isDuplicateContact(values);

            //3. Send OTP ot the email
            await sendSMS(values);

            setShowOtpForm(true);//show otp form

        } catch (error) {
            console.log(error);
            formikBag.setSubmitting(false);

            let _d = { ...errorObject };
            _d.isError = true;

            switch (error.message) {
                case "DUPLICATE_PHONE_NUMBER":
                    _d.message = "Duplicate Phone Number.Phone number already exists in our system. Please check you phone number or try again"
                    break;

                case "PHONE_NUMBER_UNCHANGED":
                    _d.message = "There is no change to the phone number. Click on close button to close the form."

                    break;

                case "ERROR_SENDING_SMS":
                    _d.message = "There was an error in sending OTP to the email id. Please try again or contact us."

                    break;

                default:
                    console.log(error);
                    break;
            }

            setErrorObject(_d);
        }


    }

    const handlePhoneNumberUpdateSubmission = () => {

        let data = {
            "contactNumber": {
                "country": updatedPhoneNumber.current.country,
                "phoneNumber": updatedPhoneNumber.current.phoneNumber
            }
        }

        fetch('/account/api/user/profile/update', {
            method: "POST",
            body: JSON.stringify(Object.assign(data, {
                "_id": userInfo._id
            })),
            headers: {
                "content-type": "application/json",
            }

        })
        .then(response => response.json())
        .then(data => {

            updateUserContextInfo(data);
            handleOnClose(false);//close the modal

        }).catch(err => {
            alert("Issue in updating about me. Please try again later");
        });
    }

    return (
        <Modal show onHide={() => { handleOnClose(false) }}>

            <Modal.Header closeButton>
                <Modal.Title>Update Phone Number</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Alert variant="info">
                    <Alert.Heading>Important Note</Alert.Heading>
                    <p>
                        We will send verification code via message (sms)
                        to confirm your updated phone number.
                        Please enter the phone number where you can recieve the text messages.
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
                            validationSchema={UserPhonerNumberUpdateValidationScheme}
                            onSubmit={(values, formikBag) => { handleOnNext(values, formikBag) }}
                            initialValues={{
                                "country": userInfo.contactNumber ? userInfo.contactNumber.country : "",
                                "phoneNumber": userInfo.contactNumber ? userInfo.contactNumber.phoneNumber : ""
                            }}>
                            {
                                ({
                                    handleChange,
                                    handleBlur,
                                    handleSubmit,
                                    isSubmitting,
                                    setFieldValue,
                                    errors,
                                    values
                                }) => {
                                    return <Form noValidate onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSubmit();
                                    }}>
                                        <Row>
                                            <Form.Group as={Col}>
                                                <Form.Label>Country</Form.Label>
                                                <Form.Control
                                                    as="select"
                                                    name="country"
                                                    onChange={(e) => {
                                                        let v = countries.find(c => c._id === e.target.value);
                                                        updatedPhoneNumber.current.country = v;
                                                        setFieldValue("country", v);
                                                    }}
                                                    onBlur={(e) => {
                                                        let v = countries.find(c => c._id === e.target.value);
                                                        updatedPhoneNumber.current.country = v;
                                                        setFieldValue("country", v);
                                                    }}
                                                    isInvalid={!!errors.country}
                                                    defaultValue={values.country._id}
                                                >
                                                    <option value=""></option>
                                                    {
                                                        countries.map(c => {
                                                            return <option key={c._id}
                                                                value={c._id}>({c.dialCode}) {c.name} </option>
                                                        })
                                                    }
                                                </Form.Control>
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.country}
                                                </Form.Control.Feedback>
                                            </Form.Group>

                                            <Form.Group as={Col}>
                                                <Form.Label>Phone Number</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="phoneNumber"
                                                    onChange={(e) => {
                                                        updatedPhoneNumber.current.phoneNumber = e.target.value;
                                                        handleChange(e)
                                                    }}
                                                    onBlur={(e) => {
                                                        updatedPhoneNumber.current.phoneNumber = e.target.value;
                                                        handleBlur(e)
                                                    }}
                                                    isInvalid={!!errors.phoneNumber}
                                                    defaultValue={values.phoneNumber}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.phoneNumber}
                                                </Form.Control.Feedback>
                                            </Form.Group>

                                        </Row>

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
                                <p>OTP (One time password) has been sent to the phone number</p>
                            </Alert>
                            <VerifyOTPForm
                                verificationNumber={userInfo.verificationNumber}
                                handleOnClose={handleOnClose}
                                afterVerification={handlePhoneNumberUpdateSubmission} />
                        </div>
                }

            </Modal.Body>

        </Modal>
    )
}