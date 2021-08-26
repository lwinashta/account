import React, { useState, useContext, useEffect, useRef } from 'react';

import { Formik } from 'formik';
import * as Yup from 'yup';//creates the validation schema 

import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { AppContext } from "../../AppContext";

const UserAddressValidationScheme = Yup.object().shape({
    "streetAddress1": Yup.string().required("Please enter the Street Address 1").nullable(true),
    "city": Yup.string().required("Please enter the City").nullable(true),
    "zipCode": Yup.string().required("Please enter the Zip Code").nullable(true),
    "state": Yup.string().required("Please enter the State").nullable(true),
    "country": Yup.object().required("Please select the Country").nullable(true)
});

const countries = require('@oi/utilities/lists/countries.json');

export const AddressEntryForm = ({
    handleOnClose = function () { },
    handleAfterSubmission = function () { },
    addressToUpdate = null
}) => {

    let { userInfo } = useContext(AppContext);


    const handleAddressSubmission = async (values) => {

        try {

            //Insert necessary values in the data 
            // let { isDefault, ...data } = formValues.current;
            // data["isDefault.$boolean"] = isDefault ? isDefault : false;

            let data={...values};

            data["userMongoId.$_id"] = userInfo._id;

            let uri = "/account/api/user/address/create";

            if (addressToUpdate !== null) {
                uri = "/account/api/user/address/update";
                
            } else {
                data["deleted.$boolean"] = false;
            }

            console.log(data);

            let addressInfo = await fetch(uri, {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    "content-type": "application/json"
                }
            });

            let addressJson = await addressInfo.json();
            console.log(addressJson);
            handleAfterSubmission(addressJson);

        } catch (error) {
            console.log(error);
            alert("Error in saving address info");
        }

    }

    return (
        <Modal show onHide={() => { handleOnClose(false) }}>

            <Modal.Header closeButton>
                <Modal.Title>{addressToUpdate?"Update Address":"Create New Address"}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Formik
                    validationSchema={UserAddressValidationScheme}
                    onSubmit={(values, formikBag) => { handleAddressSubmission(values, formikBag) }}
                    initialValues={{
                        "streetAddress1": addressToUpdate ? addressToUpdate.streetAddress1 : "",
                        "streetAddress2": addressToUpdate && addressToUpdate.streetAddress2 ? addressToUpdate.streetAddress2 : "",
                        "city": addressToUpdate ? addressToUpdate.city : "",
                        "zipCode": addressToUpdate?addressToUpdate.zipCode:"",
                        "state": addressToUpdate?addressToUpdate.state:"",
                        "country":addressToUpdate?addressToUpdate.country:""
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
                                <Form.Label>Street Address 1</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="streetAddress1"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    isInvalid={!!errors.streetAddress1}
                                    defaultValue={values.streetAddress1}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.streetAddress1}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Street Address 2</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="streetAddress2"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    isInvalid={!!errors.streetAddress2}
                                    defaultValue={values.streetAddress2}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.streetAddress2}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>City</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="city"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    isInvalid={!!errors.city}
                                    defaultValue={values.city}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.city}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Row>
                                <Form.Group as={Col}>
                                    <Form.Label>State</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="state"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        isInvalid={!!errors.state}
                                        defaultValue={values.state}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.state}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group as={Col}>
                                    <Form.Label>Zip Code</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="zipCode"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        isInvalid={!!errors.zipCode}
                                        defaultValue={values.zipCode}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.zipCode}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Row>

                            <Form.Group>
                                <Form.Label>Country</Form.Label>
                                <Form.Control
                                    as="select"
                                    name="country"
                                    onChange={(e) => {
                                        let v = countries.find(_c => _c._id === e.target.value);
                                        setFieldValue("country", v)
                                    }}
                                    isInvalid={!!errors.country}
                                    defaultValue={values.country._id}
                                >

                                    <option value=""></option>
                                    {
                                        countries.map((c, indx) => {
                                            return <option key={indx} value={c._id}>{c.name}</option>
                                        })
                                    }

                                </Form.Control>
                                <Form.Control.Feedback type="invalid">
                                    {errors.country}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <div className="py-2 d-flex flex-row justify-content-end">
                                <Button variant="primary" type="submit" className="d-flex flex-row align-items-center" disabled={isSubmitting}>
                                    {
                                        isSubmitting ?
                                            <div className="mr-2"><Spinner variant="default" size="sm" animation="border"></Spinner></div> :
                                            null
                                    }
                                    <div>Save Address</div>
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