import React, { useContext, useState } from 'react';

import { Formik } from 'formik';
import * as Yup from 'yup';//creates the validation schema 

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Alert from 'react-bootstrap/Alert';


const VerifyOtpValidationScheme = Yup.object().shape({
    "otp": Yup.string().min(6, "OTP must have 6 characters").required("Please enter the firstname").nullable(true),
});

export const VerifyOTPForm = ({
    verificationNumber,
    handleOnClose,
    afterVerification
}) => {

    const [isError, setIsError]=useState(false);

    const handleOTPVerification=async (values, formikBag)=>{

        try {
            let response=await fetch('/account/api/auth/otp/verify',{
                method:"POST",
                body:JSON.stringify({
                    otp:values.otp,
                    verificationNumber:verificationNumber
                }),
                headers: {
                    "content-type": "application/json"
                }
            });
    
            await response.json();

            afterVerification();

        } catch (error) {
            formikBag.setSubmitting(false);
            setIsError(true);
            console.log(error);
        }
        
    }

    return (
        <Formik
            validationSchema={VerifyOtpValidationScheme}
            onSubmit={(values,formikBag) => { handleOTPVerification(values, formikBag) }}
            initialValues={{
                "otp": ""
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
                        {
                            isError ?
                                <Alert variant="danger" className="my-2">
                                    <Alert.Heading>Error</Alert.Heading>
                                    <p>
                                        There is an error Verifying yout OTP. Please check your otp and try again or contact us
                                    </p>
                                </Alert> :
                                null
                        }

                        <Form.Group>
                            <Form.Label>OTP (One Time Password)</Form.Label>
                            <Form.Control
                                type="text"
                                name="otp"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                isInvalid={!!errors.otp}
                                defaultValue={values.otp}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.otp}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <div className="py-2 d-flex flex-row justify-content-end">
                            <Button variant="primary" type="submit" className="d-flex flex-row align-contents-center" disabled={isSubmitting}>
                                {
                                    isSubmitting ?
                                        <div className="mr-2"><Spinner variant="default" size="sm" animation="border"></Spinner></div> :
                                        null
                                }
                                <div>Verify OTP & Save</div>
                            </Button>
                            <Button variant="light" className="ml-2" onClick={() => { handleOnClose(false) }}>Close</Button>
                        </div>

                    </Form>
                }
            }
        </Formik>
    )
}