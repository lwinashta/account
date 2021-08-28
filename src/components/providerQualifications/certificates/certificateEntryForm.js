import React, { useContext, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
const moment = require('moment');

import { Formik } from 'formik';
import * as Yup from 'yup';//creates the validation schema 

import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { FileUploadField } from 'core/components/fields/web/fileUploadField/fileUploadField';
import { uploadFilesToServer } from "fileManagement-module/lib/handlers";

import { AppContext } from "../../AppContext";

const CertificateValidationScheme = Yup.object().shape({
    "name": Yup.string().required("Please enter the name of the Certificate").nullable(true),
    "issuedBy": Yup.string().required("Please enter the name of the institute that issued the certificate").nullable(true),
    "issueDate": Yup.string().required("Please select date the certificate was issued").nullable(true)
});

export const CertificateEntryForm = ({
    handleOnClose = function () { },
    certificateToUpdate = null
}) => {

    let { userInfo, updateUserContextInfo } = useContext(AppContext);

    let certificateUploadedFiles = useRef([]);

    const handleOnSubmit = async (values, formikBag) => {

        try {
            //console.log(values);

            let data = { ...values };

            let body = {};

            if (certificateToUpdate === null) {
                data.uuid = uuidv4();
                data["deleted"] = false;
                body["$push"] = {
                    certificates: data
                }
            } else {
                body.query = {
                    "certificates.uuid": certificateToUpdate.uuid
                }
                body["certificates.$"] = Object.assign(certificateToUpdate, data);
            }

            console.log(body);

            //Handling file upload first. So when the user information is updated the response fetches the new Medical Registration uploaded file. 
            //This reduces 1 extra call to get user data 
            if(certificateUploadedFiles.current.length>0) await handleFileUpload(certificateToUpdate === null?data.uuid:certificateToUpdate.uuid);

            let updatedUserInfo = await fetch("/account/api/user/profile/update", {
                method: "POST",
                body: JSON.stringify(Object.assign(body, {
                    "_id": userInfo._id
                })),
                headers: {
                    "content-type": "application/json"
                }
            });

            let updateUserInfoJson = await updatedUserInfo.json();

            updateUserContextInfo(updateUserInfoJson);

            handleOnClose(false);//close the modal

        } catch (error) {
            console.error(error);
            alert("Error in saving");
            formikBag.setIsSubmitting(false);
        }

    }

    const handleFileUpload = async (uuid) => {
        try {
            return await uploadFilesToServer(certificateUploadedFiles.current,{
                linkedMongoId:userInfo._id,
                linkedDatabaseName: "accounts",
                linkedCollectionName: "users",
                fieldName:"certificateFiles",
                additionalFileInfo:{
                    uuid:uuid
                }
            });
        } catch (error) {
            console.log(error);
            throw new Error("ERROR_UPLOADING_FILES");
        }
        
    }

    return (
        <Modal show onHide={() => { handleOnClose(false) }}>

            <Modal.Header closeButton>
                <Modal.Title>{certificateToUpdate ? "Update Certificate" : "Add New Certificate"}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Formik
                    validationSchema={CertificateValidationScheme}
                    onSubmit={(values, formikBag) => { handleOnSubmit(values, formikBag) }}
                    initialValues={{
                        "name": certificateToUpdate ? certificateToUpdate.name : null,
                        "issuedBy": certificateToUpdate ? certificateToUpdate.issuedBy : "",
                        "issueDate": certificateToUpdate ? certificateToUpdate.issueDate : "",
                        "expirationDate": certificateToUpdate && certificateToUpdate.expirationDate ? certificateToUpdate.expirationDate : "",
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
                                    <Form.Label>Certificate Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        isInvalid={!!errors.name}
                                        defaultValue={values.name}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.name}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group>
                                    <Form.Label>Certificate Issued By</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="issuedBy"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        isInvalid={!!errors.issuedBy}
                                        defaultValue={values.issuedBy}
                                    />
                                    <Form.Text>Name of the institution which issued the certificate</Form.Text>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.issuedBy}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Row>

                                    <Form.Group as={Col}>
                                        <Form.Label>Issue Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="issueDate"
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            isInvalid={!!errors.issueDate}
                                            defaultValue={values.issueDate}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.issueDate}
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group as={Col}>
                                        <Form.Label>Expiration Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="expirationDate"
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            isInvalid={!!errors.expirationDate}
                                            defaultValue={values.expirationDate}
                                        />

                                    </Form.Group>
                                </Row>

                                <Form.Group>
                                    <Form.Label>Upload Certificate</Form.Label>
                                    <Form.Text>Upload your certificate so you can show others</Form.Text>
                                    <FileUploadField

                                        files={certificateToUpdate && userInfo.certificates 
                                                ? userInfo.files.filter(f => f.fieldName === "certificateFiles" 
                                                && f.additionalFileInfo.uuid===certificateToUpdate.uuid) : []}

                                        onUpload={(files) => {
                                            certificateUploadedFiles.current = files;
                                        }} />
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