import React, { useContext, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { Formik } from 'formik';
import * as Yup from 'yup';//creates the validation schema 

import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert";

import { PracticeContext } from '../practiceContext';
import { TimeSlotEntry } from './timeSlotEntry';

const AvailabilityValidationScheme = Yup.object().shape({
    "availabilityDays": Yup.array().min(1).required("Please select atleast a day of the Availability").nullable(true),
    "availabilityTimeSlots": Yup.array().min(1).required("Please select atleast one time slot of your Availability").nullable(true),
});

const wkDays = require('@oi/utilities/lists/days.json');

export const PracticeAvailabilityEntry = ({
    handleOnClose = function () { },
    availabilityToUpdate = null
}) => {

    let { practiceProviderInfo, resetPracticeProviderInfo } = useContext(PracticeContext);

    let { timeSlotEntryError, setTimeSlotEntryError } = useState(false);

    const handleOnSubmit = async (values, formikBag) => {

        try {
            let data = { ...values };

            //validate timeslots
            let checkValidity = data.availabilityTimeSlots.reduce((acc, ci) => {
                if (ci.timeFrom.length === 0 || ci.timeTo.length === 0) acc.push(ci);
                return acc;
            }, []);

            if (checkValidity.length > 0) throw new Error("TIME_SLOT_VALIDATION_ERROR");

            let body = {};

            if (availabilityToUpdate === null) {
                data.uuid = uuidv4();
                data["deleted"] = false;
                body["$push"] = {
                    "availability": data
                }
            } else {
                console.log(availabilityToUpdate);
                body.query = {
                    "availability.uuid": availabilityToUpdate.uuid
                }
                body["availability.$"] = Object.assign(availabilityToUpdate, data);
            }

            console.log(body);

            let updatedResponse = await fetch('/account/api/practice/medicalprovider/update', {
                method: "POST",
                body: JSON.stringify(Object.assign(body, {
                    "_id": practiceProviderInfo._id
                })),
                headers: {
                    "content-type": "application/json",
                }

            });

            let updatedData = await updatedResponse.json();

            await resetPracticeProviderInfo();

            handleOnClose(false);//close the modal

        } catch (error) {
            console.error(error);

            if (error.message === "TIME_SLOT_VALIDATION_ERROR") {
                setTimeSlotEntryError(true);
            } else {
                alert("Error in saving");
                formikBag.setIsSubmitting(false);
            }

        }

    }

    return (
        <Modal show onHide={() => { handleOnClose(false) }}>

            <Modal.Header closeButton>
                <Modal.Title>{availabilityToUpdate ? "Update Availability" : "Add New Availability"}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Formik
                    validationSchema={AvailabilityValidationScheme}
                    onSubmit={(values, formikBag) => { handleOnSubmit(values, formikBag) }}
                    initialValues={{
                        "availabilityDays": availabilityToUpdate ? availabilityToUpdate.availabilityDays : [],
                        "availabilityTimeSlots": availabilityToUpdate ? availabilityToUpdate.availabilityTimeSlots : []
                    }}>
                    {
                        ({
                            handleSubmit,
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
                                    <Form.Label>Days</Form.Label>
                                    <Row>
                                        {
                                            wkDays.map(day => {
                                                return <Form.Group key={day.abbr} as={Col}>
                                                    <Form.Check
                                                        name="availabilityDays"
                                                        label={day.abbr}
                                                        defaultChecked={values.availabilityDays.length > 0 && values.availabilityDays.findIndex(v => v.abbr === day.abbr) > -1}
                                                        onChange={(e) => {
                                                            if (e.target.checked) { 
                                                                let _d = [...values.availabilityDays];
                                                                _d.push(day);
                                                                setFieldValue("availabilityDays", _d);
                                                                
                                                            }else {
                                                                let _d = [...values.availabilityDays]
                                                                let indx = _d.findIndex(v => v.abbr === day.abbr);
                                                                if (indx > -1) _d.splice(indx, 1);

                                                                setFieldValue("availabilityDays", _d);
                                                            }
                                                        }}
                                                    />
                                                </Form.Group>
                                            })
                                        }
                                    </Row>
                                </Form.Group>

                                {/* Time Slots */}
                                <div className="mt-2">
                                    <Form.Label>Time Slots</Form.Label>
                                    <Form.Text className="mb-2">You can add multiple time slots for the day. E.g., if you practice twice a, i.e., from 10am to 12p and then 4pm to 6pm.</Form.Text>
                                    {
                                        timeSlotEntryError ?
                                            <Alert>
                                                <Alert.Heading>Time Slot Entry Error</Alert.Heading>
                                                <p>Please make sure all time slots are entered and is entered correctly</p>
                                            </Alert> :
                                            null
                                    }

                                    {
                                        values.availabilityTimeSlots.length>0?
                                            values.availabilityTimeSlots.map(slot => {
                                                return <TimeSlotEntry key={slot.uuid} timeSlot={slot} />
                                            }):
                                        null
                                    }
                                </div>

                                <button
                                    type="button"
                                    className="btn-classic btn-white py-2 px-3"
                                    onClick={() => {
                                        
                                        let _d=[...values.availabilityTimeSlots];
                                        
                                        _d.push({
                                            uuid: uuidv4(),
                                            timeFrom: "",
                                            timeTo: ""
                                        });

                                        setFieldValue("availabilityTimeSlots", _d)
                                    }}>
                                    <div className="d-flex flex-row font-weight-bold justify-content-center align-items-baseline">
                                        <i className="fas fa-plus"></i>
                                        <div className="ml-2">Add Time Slot</div>
                                    </div>
                                </button>

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