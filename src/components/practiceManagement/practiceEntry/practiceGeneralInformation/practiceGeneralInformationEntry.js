import React, { useContext } from 'react';

import { Formik } from 'formik';
import * as Yup from 'yup';//creates the validation schema 

import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

import { SearchableMultiSelectField } from 'core/components/fields/web/multiSelect/searchableMultiselectField'
import { PracticeContext } from '../practiceContext';

const facilityTypeList = require('@oi/utilities/lists/medicalFacilitiesTypes.json');

const PracticeGenralInformationValidationScheme = Yup.object().shape({
    "name": Yup.string().required("Please enter Practice name").nullable(true),
    "facilityType": Yup.array().min(1).required("Please select atleast one facility type").nullable(true)
});

export const PracticeGeneralInformationEntry = ({
    handleOnClose,
}) => {

    let { practiceInfo, resetPracticeInfo } = useContext(PracticeContext);

    const handleOnSubmit = async (values, formikBag) => {

        try {
            //console.log(values);

            let data = { ...values }

            let updatedResponse = await fetch('/account/api/practice/medicalfacility/update', {
                method: "POST",
                body: JSON.stringify(Object.assign(data, {
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
            console.log(error);
            formikBag.setIsSubmitting(false);
        }

    }

    return (
        <Modal show onHide={() => { handleOnClose(false) }}>

            <Modal.Header closeButton>
                <Modal.Title>Practice General Information Entry</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Formik
                    validationSchema={PracticeGenralInformationValidationScheme}
                    onSubmit={(values, formikBag) => { handleOnSubmit(values, formikBag) }}
                    initialValues={{
                        "name": practiceInfo.name,
                        "facilityType": practiceInfo.facilityType ? practiceInfo.facilityType : [],
                        "description": practiceInfo.description,

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
                                    <Form.Label>Practice Name</Form.Label>
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
                                    <Form.Label>Medical Facility Type</Form.Label>
                                    <SearchableMultiSelectField
                                        dataset={facilityTypeList}
                                        dataSelected={values.facilityType.map((f)=>{
                                            return facilityTypeList.find(t=>t.name===f);
                                        })}
                                        handleOnItemSelection={(items) => {
                                            setFieldValue("facilityType", items.map(i => i.name));
                                        }} />
                                    {
                                        errors.facilityType ?
                                            <div className="my-2 small text-danger">{errors.facilityType}</div> :
                                            null
                                    }
                                </Form.Group>

                                <Form.Group>
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        name="description"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        defaultValue={values.description}
                                    />
                                </Form.Group>

                                <div className="py-2 d-flex flex-row justify-content-end">
                                    <Button variant="primary" type="submit"  disabled={isSubmitting}>
                                        <div className="d-flex flex-row align-items-center">
                                            {
                                                isSubmitting ?
                                                    <div className="mr-2"><Spinner variant="default" size="sm" animation="border"></Spinner></div> :
                                                    null
                                            }
                                            <div>Save Information</div>
                                        </div>
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