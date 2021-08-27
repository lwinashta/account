import React, { useState, useContext, useEffect, useRef } from 'react';

import { Formik } from 'formik';
import * as Yup from 'yup';//creates the validation schema 

import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

import { SearchableMultiSelectField } from 'core/components/fields/web/multiSelect/searchableMultiselectField'
import { FileUploadField } from 'core/components/fields/web/fileUploadField/fileUploadField';

import { uploadFilesToServer } from "fileManagement-module/lib/handlers";

import { AppContext } from "../../AppContext";

const relations = require('@oi/utilities/lists/relationships.json');

const UserInsuranceValidationScheme = Yup.object().shape({
    "insuranceProvider": Yup.object().required("Please enter the Insurance Provider").nullable(true),
    "memberId": Yup.string().required("Please enter the Member Id").nullable(true),
    "priority": Yup.string().required("Please enter the Priority for your insurance").nullable(true),
    "relationWithPolicyHolder": Yup.string().required("Please select who is the policy. Select self if you are the policy holder").nullable(true),
    "nameOfPolicyHolder": Yup.string().when('relationWithPolicyHolder', {
        "is": (val) => val !== "self",
        "then": Yup.string().required("Please enter the name of the policy holder").nullable(true),
        "otherwise": Yup.string().notRequired().nullable(true),
    })
});

export const InsuranceEntryForm = ({
    insuranceProviders = [],
    handleOnClose = function () { },
    handleAfterSubmission = function () { },
    insuranceToUpdate = null
}) => {

    let { userInfo } = useContext(AppContext);

    let insuranceImages = useRef([]);

    const handleInsuranceSubmission = async (values) => {
        console.log(values);
        try {

            let data = { ...values };

            let uri = "/account/api/user/insurance/create";

            if (insuranceToUpdate !== null) {
                uri = "/account/api/user/insurance/update";

            } else {
                data["userMongoId.$_id"] = userInfo._id;
                data["deleted.$boolean"] = false;
            }

            let insuranceInfo = await fetch(uri, {
                method: "POST",
                body: insuranceToUpdate !== null ? JSON.stringify({
                    query: { "_id": insuranceToUpdate._id },
                    values: data
                }) : JSON.stringify(data),
                headers: {
                    "content-type": "application/json"
                }
            });

            let insuranceId = await insuranceInfo.json();

            //Check if there is any insurance files to be uploaded
            if(insuranceImages.current.length>0) await handleFileUpload(insuranceId);

            //Once fields and files both are uploaded. Get the insurance information from server
            let getUri = new URL(window.location.origin + "/account/api/user/insurance/get");
            getUri.searchParams.set("_id.$_id", insuranceId);

            let getInsuranceInfoResponse=await fetch(getUri);
            let getInsuranceInfo=await getInsuranceInfoResponse.json();

            console.log(getInsuranceInfo);

            //Execute after submission is done.
            handleAfterSubmission(getInsuranceInfo[0]);//send first element in the array 

        } catch (error) {
            console.log(error);
            alert("Error in saving insurance info");
        }

    }

    const handleFileUpload = async (insuranceId) => {
        try {
            return await uploadFilesToServer(insuranceImages.current,{
                linkedMongoId:insuranceId,
                linkedDatabaseName: "accounts",
                linkedCollectionName: "userInsurances",
                fieldName:"userInsuranceFiles"
            });
        } catch (error) {
            console.log(error);
            throw new Error("ERROR_UPLOADING_FILES");
        }
        
    }

    return (
        <Modal show onHide={() => { handleOnClose(false) }}>

            <Modal.Header closeButton>
                <Modal.Title>{insuranceToUpdate ? "Update Insurance" : "Add New Insurance"}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Formik
                    validationSchema={UserInsuranceValidationScheme}
                    onSubmit={(values, formikBag) => { handleInsuranceSubmission(values, formikBag) }}
                    initialValues={{
                        "insuranceProvider": insuranceToUpdate ? insuranceToUpdate.insuranceProvider : "",
                        "memberId": insuranceToUpdate ? insuranceToUpdate.memberId : "",
                        "priority": insuranceToUpdate ? insuranceToUpdate.priority : "",
                        "relationWithPolicyHolder": insuranceToUpdate ? insuranceToUpdate.relationWithPolicyHolder : "",
                        "nameOfPolicyHolder": insuranceToUpdate && insuranceToUpdate.nameOfPolicyHolder ? insuranceToUpdate.nameOfPolicyHolder : ""
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

                                <Form.Group>
                                    <Form.Label>Insurance Provider</Form.Label>
                                    <SearchableMultiSelectField
                                        dataset={insuranceProviders}
                                        singleSelect
                                        dataSelected={
                                            //data select is an array of items
                                            values.insuranceProvider ?
                                                [values.insuranceProvider] :
                                                []
                                        }
                                        handleOnItemSelection={(items) => {
                                            //get the first element since its single select
                                            setFieldValue("insuranceProvider", {
                                                _id:items[0]._id,
                                                payer_id:items[0].payer_id,
                                                name:items[0].name
                                            });
                                        }} />
                                    {
                                        errors.insuranceProvider ?
                                            <div className="my-2 small text-danger">{errors.insuranceProvider}</div> :
                                            null
                                    }
                                </Form.Group>

                                <Form.Group>
                                    <Form.Label>Member Id</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="memberId"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        isInvalid={!!errors.memberId}
                                        defaultValue={values.memberId}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.memberId}
                                    </Form.Control.Feedback>
                                </Form.Group>


                                <Form.Group>
                                    <Form.Label>Priority</Form.Label>
                                    <Form.Control
                                        as="select"
                                        name="priority"
                                        onChange={handleChange}
                                        isInvalid={!!errors.priority}
                                        defaultValue={values.priority}
                                    >
                                        <option value=""></option>
                                        <option value="primary">Primary</option>
                                        <option value="secondary">Secondary</option>
                                    </Form.Control>

                                    <Form.Control.Feedback type="invalid">
                                        {errors.priority}
                                    </Form.Control.Feedback>

                                </Form.Group>

                                <Form.Group>
                                    <Form.Label>Relation with Policy Holder</Form.Label>
                                    <Form.Control
                                        as="select"
                                        name="relationWithPolicyHolder"
                                        onChange={handleChange}
                                        isInvalid={!!errors.relationWithPolicyHolder}
                                        defaultValue={values.relationWithPolicyHolder}
                                    >
                                        <option value="self">Self (You are the policy holder)</option>
                                        <option value="" disabled>-------------------</option>
                                        {
                                            relations.map((r, indx) => {
                                                return <option key={indx} value={r}>{r}</option>
                                            })
                                        }
                                    </Form.Control>

                                    <Form.Control.Feedback type="invalid">
                                        {errors.relationWithPolicyHolder}
                                    </Form.Control.Feedback>

                                </Form.Group>

                                {
                                    values.relationWithPolicyHolder.length>0 && values.relationWithPolicyHolder !== "self" ?
                                        <Form.Group>
                                            <Form.Label>Name of the Policy Holder</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="nameOfPolicyHolder"
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                isInvalid={!!errors.nameOfPolicyHolder}
                                                defaultValue={values.nameOfPolicyHolder}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.nameOfPolicyHolder}
                                            </Form.Control.Feedback>
                                        </Form.Group> :
                                        null
                                }

                                <Form.Group>
                                    <Form.Label>Insurance Card</Form.Label>
                                    <Form.Text>Please take a picture of insurance card and attach here. Drag and drop or upload the file</Form.Text>
                                    <FileUploadField
                                        files={insuranceToUpdate ? insuranceToUpdate.files:[]}
                                        onUpload={(files) => {
                                            insuranceImages.current = files;
                                        }} />
                                </Form.Group>

                                <div className="py-2 d-flex flex-row justify-content-end">
                                    <Button variant="primary" type="submit" className="d-flex flex-row align-items-center" disabled={isSubmitting}>
                                        {
                                            isSubmitting ?
                                                <div className="mr-2"><Spinner variant="default" size="sm" animation="border"></Spinner></div> :
                                                null
                                        }
                                        <div>Save Insurance</div>
                                    </Button>
                                    <Button variant="light" className="ml-2" onClick={() => { handleOnClose(false) }}>Close</Button>
                                </div>

                            </Form>
                        }
                    }
                </Formik>
            </Modal.Body>

        </Modal >
    )
}