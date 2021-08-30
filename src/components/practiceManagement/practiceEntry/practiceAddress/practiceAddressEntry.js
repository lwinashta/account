import React, { useState, useContext, useEffect, useRef } from 'react';

import { Formik } from 'formik';
import * as Yup from 'yup';//creates the validation schema 

import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert";

import { DisplayAddress } from "core/components/infoDisplay/address/displayAddress";

import { PracticeContext } from '../practiceContext';

const PracticeAddressValidationScheme = Yup.object().shape({
    "streetAddress1": Yup.string().required("Please enter the Street Address 1").nullable(true),
    "city": Yup.string().required("Please enter the City").nullable(true),
    "zipCode": Yup.string().required("Please enter the Zip Code").nullable(true),
    "state": Yup.string().required("Please enter the State").nullable(true),
    "country": Yup.object().required("Please select the Country").nullable(true)
});

const countries = require('@oi/utilities/lists/countries.json');

import { validateAddress } from "./addressValidation";

export const PracticeAddressEntry = ({
    handleOnClose = function () { },
    handleAfterSubmission = function () { }
}) => {

    let { practiceInfo, resetPracticeInfo } = useContext(PracticeContext);
console.log(practiceInfo);
    const [showInvalidAddressAlert, setShowInvalidAddressAlert]=useState(false);

    const [validatedAddress, setValidatedAddress] = useState(null);
    const [isSubmittingRecommendedAddress,setIsSubmittingRecommendedAddress]=useState(false);

    let userEnteredAddressForConfirmation=useRef(null);

    let validateAddressBeforeSubmission = async (values, formikBag) => {
        
        try {

            setShowInvalidAddressAlert(false);

            //Throws INVALID_ADDRESS if no response is found by the google api 
            let validationResponse = await validateAddress(values);

            //check all the element.if all ok, then address is good and save the address 
            let failed = Object.values(validationResponse.address).filter(k => !k.ok);
            
            if (failed.length > 0) {
                userEnteredAddressForConfirmation.current=values;
                setValidatedAddress(validationResponse);//triggers to show the confirmation to the user
                
            }else{

                await handleAddressSubmission({
                    address:Object.assign(values,{cordinates:validationResponse.cordinates})
                });
                
                await resetPracticeInfo();

                handleOnClose(false);//close the modal
                
            }

        } catch (err) {
            console.log(err);
            if(err.message==="INVALID_ADDRESS"){
                setShowInvalidAddressAlert(true);
            }
            formikBag.setIsSubmitting(false);
        }

    }

    const handleRecommendedAddressConfirmation=async(validatedAddress)=>{
        try {
            setIsSubmittingRecommendedAddress(true);
            await  handleAddressSubmission({
                address:Object.assign(Object.keys(validatedAddress.address).reduce((acc,key)=>{
                    if(key==="country") {
                        let v=countries.find(_c => _c._id === validatedAddress.address[key].value);
                        acc[key]=v;
                    }else{
                        acc[key]=validatedAddress.address[key].value;
                    }
                    return acc;
                },{}),{cordinates:validatedAddress.cordinates})
            });

            await resetPracticeInfo();

            handleOnClose(false);//close the modal
            

        } catch (error) {
            console.error(error);
            setIsSubmittingRecommendedAddress(false);
        }
    }

    const handleAddressSubmission=async (address)=>{

        try {
            //console.log(values);

            let updatedResponse = await fetch('/account/api/practice/medicalfacility/update', {
                method: "POST",
                body: JSON.stringify(Object.assign(address,{
                    "_id": practiceInfo._id
                })),
                headers: {
                    "content-type": "application/json",
                }

            });

            let updatedData = await updatedResponse.json();

        } catch (error) {
            console.log(error);
        }
    }

    return (
        <Modal show onHide={() => { handleOnClose(false) }}>

            <Modal.Header closeButton>
                <Modal.Title>Practice Address Entry</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {
                    validatedAddress === null ?
                        <Formik
                            validationSchema={PracticeAddressValidationScheme}
                            onSubmit={(values, formikBag) => { validateAddressBeforeSubmission(values, formikBag) }}
                            initialValues={{
                                "streetAddress1": practiceInfo.address && practiceInfo.address.streetAddress1 ? practiceInfo.address.streetAddress1 : "",
                                "streetAddress2": practiceInfo.address && practiceInfo.address.streetAddress2 ? practiceInfo.address.streetAddress2 : "",
                                "city": practiceInfo.address && practiceInfo.address.city ? practiceInfo.address.city : "",
                                "zipCode": practiceInfo.address && practiceInfo.address.zipCode ? practiceInfo.address.zipCode : "",
                                "state": practiceInfo.address && practiceInfo.address.state ? practiceInfo.address.state : "",
                                "country": practiceInfo.address && practiceInfo.address.country ? practiceInfo.address.country : ""
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

                                        {
                                            showInvalidAddressAlert?
                                            <Alert variant="danger">
                                                <Alert.Heading>Invalid Address</Alert.Heading>
                                                <p>The address you have entered is incorrect. We were not able to validate the address. If this is an error please contact us</p>
                                            </Alert>:
                                            null
                                        }
                                        
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
                                            <Button variant="primary" type="submit" disabled={isSubmitting}>
                                                <div className="d-flex flex-row align-items-center">
                                                    {
                                                        isSubmitting ?
                                                            <div className="mr-2">
                                                                <Spinner className="align-middle" variant="default" size="sm" animation="border"></Spinner>
                                                            </div> :
                                                            null
                                                    }
                                                    <div>Validate Address</div>
                                                </div>

                                            </Button>
                                            <Button variant="light" className="ml-2" onClick={() => { handleOnClose(false) }}>Close</Button>
                                        </div>

                                    </Form>
                                }
                            }
                        </Formik> :
                        <div>
                            <div className="py-2 border-bottom">
                                <b className="text-primary">Entered Address</b>
                                <DisplayAddress address={userEnteredAddressForConfirmation.current} />
                            </div>
                            <div className="py-2 border-bottom">
                                <b className="text-primary">Recommended Address</b>
                                <div>
                                   <b className={`${!validatedAddress.address.streetAddress1.ok?"text-danger":""}`}>{validatedAddress.address.streetAddress1.value}, </b> 
                                   <div className="d-flex flex-row small">
                                        <div className={`${!validatedAddress.address.city.ok?"text-danger":"text-muted"}`}>{validatedAddress.address.city.value}, </div> 
                                        <div className={`${!validatedAddress.address.state.ok?"text-danger":"text-muted"}`}>{validatedAddress.address.state.value}, </div> 
                                        <div className={`${!validatedAddress.address.zipCode.ok?"text-danger":"text-muted"}`}>{validatedAddress.address.zipCode.value}, </div> 
                                        <div className={`${!validatedAddress.address.country.ok?"text-danger":"text-muted"}`}>{countries.find(c => c._id === validatedAddress.address.country.value).name}</div>
                                   </div>
                                </div>
                            </div>

                            <div className="py-2 d-flex flex-row justify-content-end">
                                <Button variant="primary" type="submit" 
                                    onClick={()=>{
                                        handleRecommendedAddressConfirmation(validatedAddress)
                                    }}
                                    disabled={isSubmittingRecommendedAddress}>
                                    <div className="d-flex flex-row align-items-center">
                                        {
                                            isSubmittingRecommendedAddress ?
                                                <div className="mr-2">
                                                    <Spinner className="align-middle" variant="default" size="sm" animation="border"></Spinner>
                                                </div> :
                                                null
                                        }
                                        <div>Save Recommended Address</div>
                                    </div>
                                </Button>
                                <Button variant="light" className="ml-2" onClick={() => { handleOnClose(false) }}>Close</Button>
                            </div>

                        </div>
                }

            </Modal.Body>

        </Modal >
    )
}