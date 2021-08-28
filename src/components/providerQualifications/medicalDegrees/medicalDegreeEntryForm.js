import React, { useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
const moment = require('moment')

import { Formik } from 'formik';
import * as Yup from 'yup';//creates the validation schema 

import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { AppContext } from "../../AppContext";

import { SearchableMultiSelectField } from 'core/components/fields/web/multiSelect/searchableMultiselectField'

const MedicalDegreeValidationScheme = Yup.object().shape({
    "degree": Yup.number().required("Please select the Degree").nullable(true),
    "educationalInstitute": Yup.string().required("Please select the Educational Institute").nullable(true),
    "startYear": Yup.string().required("Please select the year when you started").nullable(true),
    "endYear": Yup.string().required("Please select the year when you completed the degree").nullable(true)
});

const sd = moment().subtract(110, 'years').year();
const years = Array.from(new Array(110)).map((x, i) => { return sd + i });

export const MedicalDegreeEntryForm = ({
    handleOnClose = function () { },
    medicalDegreesList = [],
    medicalDegreeToUpdate = null
}) => {

    let { userInfo, updateUserContextInfo } = useContext(AppContext);

    const handleOnSubmit = async (values, formikBag) => {

        try {
            //console.log(values);

            let data = { ...values };

            let body = {};

            if (medicalDegreeToUpdate === null) {
                data.uuid = uuidv4();
                data["deleted"]=false;
                body["$push"] = {
                    medicalDegrees: data
                }
            } else {
                body.query = {
                    "medicalDegrees.uuid": medicalDegreeToUpdate.uuid
                }
                body["medicalDegrees.$"] = Object.assign(medicalDegreeToUpdate,data);
            }

            console.log(body);

            let updatedUserInfo = await fetch("/account/api/user/profile/update", {
                method: "POST",
                body: JSON.stringify(Object.assign(body,{
                    "_id":userInfo._id
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

    return (
        <Modal show onHide={() => { handleOnClose(false) }}>

            <Modal.Header closeButton>
                <Modal.Title>{medicalDegreeToUpdate ? "Update Medical Degree" : "Add New Medical Degree"}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Formik
                    validationSchema={MedicalDegreeValidationScheme}
                    onSubmit={(values, formikBag) => { handleOnSubmit(values, formikBag) }}
                    initialValues={{
                        "degree": medicalDegreeToUpdate ? medicalDegreeToUpdate.degree : null,
                        "educationalInstitute": medicalDegreeToUpdate ? medicalDegreeToUpdate.educationalInstitute : "",
                        "startYear":medicalDegreeToUpdate ? medicalDegreeToUpdate.startYear : "",
                        "endYear":medicalDegreeToUpdate ? medicalDegreeToUpdate.endYear : "",
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
                                    <Form.Label>Degree</Form.Label>
                                    <SearchableMultiSelectField
                                        dataset={medicalDegreesList}
                                        singleSelect
                                        dataSelected={
                                            values.degree ?
                                                [medicalDegreesList.find(sp => sp._id === values.degree)] :
                                                []
                                        }
                                        handleOnItemSelection={(items) => {
                                            setFieldValue("degree", items[0]._id);
                                        }} />
                                    {
                                        errors.degree ?
                                            <div className="my-2 small text-danger">{errors.degree}</div> :
                                            null
                                    }
                                </Form.Group>

                                <Form.Group>
                                    <Form.Label>Education Institute</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="educationalInstitute"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        isInvalid={!!errors.educationalInstitute}
                                        defaultValue={values.educationalInstitute}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.educationalInstitute}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Row>
                                    <Form.Group as={Col}>
                                        <Form.Label>Start Year</Form.Label>
                                        <Form.Control
                                            as="select"
                                            name="startYear"
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            isInvalid={!!errors.startYear}
                                            defaultValue={values.startYear}
                                        >
                                            <option value=""></option>
                                            {years.map(year => {
                                                return <option key={year} value={year}>{year} </option>
                                            })}
                                        </Form.Control>
                                        <Form.Control.Feedback type="invalid">
                                            {errors.startYear}
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group as={Col}>
                                        <Form.Label>Start Year</Form.Label>
                                        <Form.Control
                                            as="select"
                                            name="endYear"
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            isInvalid={!!errors.endYear}
                                            defaultValue={values.endYear}
                                        >
                                            <option value=""></option>
                                            {years.map(year => {
                                                return <option key={year} value={year}>{year} </option>
                                            })}
                                        </Form.Control>
                                        <Form.Control.Feedback type="invalid">
                                            {errors.endYear}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Row>


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