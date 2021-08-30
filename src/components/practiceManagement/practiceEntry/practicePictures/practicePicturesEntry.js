import React, { useContext, useRef, useState } from 'react';

import { FileUploadField } from 'core/components/fields/web/fileUploadField/fileUploadField';
import { uploadFilesToServer } from "fileManagement-module/lib/handlers";

import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

import { PracticeContext } from '../practiceContext';

export const PracticePicturesEntry = ({
    handleOnClose = function () { }
}) => {

    let { practiceInfo, resetPracticeInfo } = useContext(PracticeContext);

    const [isSubmitting,setIsSubmitting]=useState(false);

    let practicePicturesUploadedFiles = useRef([]);

    const handleSubmit = async () => {

        try {

            setIsSubmitting(true);

            //console.log(values);
            await uploadFilesToServer(practicePicturesUploadedFiles.current, {
                linkedMongoId: practiceInfo._id,
                linkedDatabaseName: "accounts",
                linkedCollectionName: "medicalFacilities",
                fieldName: "practicePictures"
            });

            await resetPracticeInfo();

            handleOnClose(false);//close the modal

        } catch (error) {
            console.log(error);
            setIsSubmitting(false);
            alert("Error in uploading files");
            throw new Error("ERROR_UPLOADING_FILES");

        }

    }

    return (
        <Modal show onHide={() => { handleOnClose(false) }}>

            <Modal.Header closeButton>
                <Modal.Title>Manage Practice Pictures</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form noValidate onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit(e);
                }}>
                    <Form.Group>
                        <Form.Label>Upload Practice Pictures</Form.Label>
                        <Form.Text>Upload your Practice Pictures</Form.Text>
                        <FileUploadField
                            files={practiceInfo.files.filter(f => f.fieldName === "practicePictures")}
                            onUpload={(files) => {
                                practicePicturesUploadedFiles.current = files;
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

            </Modal.Body>

        </Modal>
    )
}