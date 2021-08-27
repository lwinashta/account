import React, { useContext, useRef } from 'react';

import { Formik } from 'formik';
import * as Yup from 'yup';//creates the validation schema 

import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

import { AppContext } from "../../AppContext";

import { FileUploadField } from 'core/components/fields/web/fileUploadField/fileUploadField';
import { uploadFilesToServer } from "fileManagement-module/lib/handlers";

const MedicalRegistrationValidationScheme = Yup.object().shape({
    "medicalRegistrationNumber": Yup.string().required("Please enter medical registration number").nullable(true),
    "medicalRegistrationImages": Yup.array().min(1).required("Please upload an image of medical regiatration").nullable(true),
});

export const UpdateMedicalRegistrationForm = ({
    handleOnClose,
}) => {

    let { userInfo, updateUserContextInfo } = useContext(AppContext);

    let medicalRegistrationUploadedFiles = useRef([]);

    const handleOnSubmit = async (values, formikBag) => {

        //console.log(values);
        try {
            let { medicalRegistrationImages, ...registrationInfo } = values;

            let data = {
                "medicalRegistration": registrationInfo
            }

            //Handling file upload first. So when the user information is updated the response fetches the new Medical Registration uploaded file. 
            //This reduces 1 extra call to get user data 
            if(medicalRegistrationUploadedFiles.current.length>0) await handleFileUpload();

            let response = await fetch('/account/api/user/profile/update', {
                method: "POST",
                body: JSON.stringify(Object.assign(data, {
                    "_id": userInfo._id
                })),
                headers: {
                    "content-type": "application/json",
                }
            });

            let updatedData = await response.json();

            updateUserContextInfo(updatedData);

            handleOnClose(false);//close the modal

        } catch (error) {
            console.log(error);
            alert("Error in saving the information");
            formikBag.setIsSubmitting(false);
        }

    }

    const handleFileUpload = async () => {
        try {
            return await uploadFilesToServer(medicalRegistrationUploadedFiles.current,{
                linkedMongoId:userInfo._id,
                linkedDatabaseName: "accounts",
                linkedCollectionName: "users",
                fieldName:"medicalRegistrationFile"
            });
        } catch (error) {
            console.log(error);
            throw new Error("ERROR_UPLOADING_FILES");
        }
        
    }

    return (
        <Modal show onHide={() => { handleOnClose(false) }}>

            <Modal.Header closeButton>
                <Modal.Title>Update Medical Registration</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Formik
                    validationSchema={MedicalRegistrationValidationScheme}
                    onSubmit={(values, formikBag) => { handleOnSubmit(values, formikBag) }}
                    initialValues={{
                        "medicalRegistrationNumber": userInfo.medicalRegistration ? userInfo.medicalRegistration.medicalRegistrationNumber : "",
                        "medicalRegistrationImages": userInfo.files ? userInfo.files.filter(f => f.fieldName === "medicalRegistrationFile") : []
                    }}>
                    {
                        ({
                            handleSubmit,
                            handleChange,
                            handleBlur,
                            isSubmitting,
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
                                    <Form.Label>Medical Registration Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="medicalRegistrationNumber"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        isInvalid={!!errors.medicalRegistrationNumber}
                                        defaultValue={values.medicalRegistrationNumber}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.medicalRegistrationNumber}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group>
                                    <Form.Label>Proof of Medical Registration</Form.Label>
                                    <FileUploadField
                                        files={userInfo.medicalRegistration ? userInfo.files.filter(f => f.fieldName === "medicalRegistrationFile") : []}
                                        onUpload={(files) => {
                                            medicalRegistrationUploadedFiles.current = files;
                                            setFieldValue("medicalRegistrationImages", values.medicalRegistrationImages.concat(files))
                                        }} />
                                    {
                                        errors.medicalRegistrationImages?
                                        <div className="text-danger small">{errors.medicalRegistrationImages}</div>:
                                        null
                                    }
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