import React, { useContext, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { Formik } from 'formik';
import * as Yup from 'yup';//creates the validation schema 

import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

import { PracticeContext } from '../practiceContext';

const ContactInfoValidationScheme = Yup.object().shape({
    "contactType": Yup.string().required("Please enter the name of the ContactInfo").nullable(true),
    "contactValue":Yup.string().when("contactType", {
        "is": (val) => val === "Email",
        "then": Yup.string().email().required("Please enter email").nullable(true),
        "otherwise": Yup.string().required("Please enter number").nullable(true),
    }),
});

export const PracticeContactInformationEntry = ({
    handleOnClose = function () { },
    contactInfoToUpdate = null
}) => {

    let { practiceInfo, resetPracticeInfo } = useContext(PracticeContext);

    const handleOnSubmit = async (values, formikBag) => {

        try {
            let data = { ...values };

            let body = {};

            if (contactInfoToUpdate === null) {
                data.uuid = uuidv4();
                data["deleted"] = false;
                body["$push"] = {
                    "contactInformation": data
                }
            } else {
                console.log(contactInfoToUpdate);
                body.query = {
                    "contactInformation.uuid": contactInfoToUpdate.uuid
                }
                body["contactInformation.$"] = Object.assign(contactInfoToUpdate, data);
            }

            console.log(body);

            let updatedResponse = await fetch('/account/api/practice/medicalfacility/update', {
                method: "POST",
                body: JSON.stringify(Object.assign(body, {
                    "_id": practiceInfo._id
                })),
                headers: {
                    "content-type": "application/json",
                }

            });

            

            let updatedData = await updatedResponse.json();

            await resetPracticeInfo();

            handleOnClose(false);//close the modal

        } catch (error) {
            console.error(error);
            alert("Error in saving");
            formikBag.setIsSubmitting(false);
        }

    }

   

    return (
        <Modal show onHide={() => { handleOnClose(false) }}>

            <Modal.Header closeButton>
                <Modal.Title>{contactInfoToUpdate ? "Update ContactInfo" : "Add New ContactInfo"}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Formik
                    validationSchema={ContactInfoValidationScheme}
                    onSubmit={(values, formikBag) => { handleOnSubmit(values, formikBag) }}
                    initialValues={{
                        "contactType": contactInfoToUpdate ? contactInfoToUpdate.contactType : null,
                        "contactValue": contactInfoToUpdate ? contactInfoToUpdate.contactValue : ""
                    }}>
                    {
                        ({
                            handleSubmit,
                            isSubmitting,
                            handleChange,
                            handleBlur,
                            setFieldValue,
                            errors,
                            values
                        }) => {
                            return <Form noValidate onSubmit={(e) => {
                                console.log(values, errors)
                                e.preventDefault();
                                handleSubmit(e);
                            }}>
                                <Form.Group>
                                    <Form.Label>Contact type</Form.Label>
                                    <Form.Control
                                        as="select"
                                        name="contactType"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        isInvalid={!!errors.contactType}
                                        defaultValue={values.contactType}
                                    >
                                        <option value="">- Select contact type -</option>
                                        <option value="Mobile Phone">Mobile Phone</option>
                                        <option value="Business Phone">Business Phone</option>
                                        <option value="Email">Email</option>
                                        <option value="Fax">Fax</option>

                                    </Form.Control>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.contactType}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group>
                                    <Form.Label>Contact information</Form.Label>

                                    {
                                        values.contactType==="Email"?
                                        <Form.Control
                                            type="email"
                                            name="contactValue"
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            isInvalid={!!errors.contactValue}
                                            defaultValue={values.contactValue}
                                        />:
                                        <Form.Control
                                            type="tel"
                                            name="contactValue"
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            isInvalid={!!errors.contactValue}
                                            defaultValue={values.contactValue}
                                        />
                                    }
                                    
                                    <Form.Control.Feedback type="invalid">
                                        {errors.contactValue}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                

                                <div className="py-2 d-flex flex-row justify-content-end">
                                    <Button variant="primary" type="submit" className="d-flex flex-row align-items-center" disabled={isSubmitting}>
                                        {
                                            isSubmitting ?
                                                <div className="mr-2"><Spinner variant="default" size="sm" animation="border"></Spinner></div> :
                                                null
                                        }
                                        <div>Save Information</div>
                                    </Button>
                                    <Button variant="light" className="ml-2" onClick={() => { handleOnClose(false) }}>Close</Button>
                                </div>

                            </Form>
                        }
                    }
                </Formik>
            </Modal.Body>

        </Modal>
    )
}