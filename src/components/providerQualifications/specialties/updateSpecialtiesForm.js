import React, { useContext } from 'react';

import { Formik } from 'formik';
import * as Yup from 'yup';//creates the validation schema 

import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

import { AppContext } from "../../AppContext";

import { SearchableMultiSelectField } from 'core/components/fields/web/multiSelect/searchableMultiselectField'

const SpecialtiesValidationScheme = Yup.object().shape({
    "specialties": Yup.array().min(1).required("Please select the specialties").nullable(true)
});

export const UpdateSpecialtiesForm = ({
    handleOnClose,
    specialtiesList
}) => {

    let { userInfo, updateUserContextInfo } = useContext(AppContext);

    const handleOnSubmit = (values, formikBag) => {

        //console.log(values);

        let data = {
            "specialties": values.specialties
        }

        fetch('/account/api/user/profile/update', {
            method: "POST",
            body: JSON.stringify(Object.assign(data, {
                "_id": userInfo._id
            })),
            headers: {
                "content-type": "application/json",
            }

        })
        .then(response => response.json())
        .then(data => {

            updateUserContextInfo(data);

            handleOnClose(false);//close the modal

        }).catch(err => {
            formikBag.setIsSubmitting(false);
        });
    }

    return (
        <Modal show onHide={() => { handleOnClose(false) }}>

            <Modal.Header closeButton>
                <Modal.Title>Update Specialties</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Formik
                    validationSchema={SpecialtiesValidationScheme}
                    onSubmit={(values, formikBag) => { handleOnSubmit(values, formikBag) }}
                    initialValues={{
                        "specialties": userInfo.specialties ? userInfo.specialties : []
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
                            console.log(values,errors)
                                e.preventDefault();
                                handleSubmit(e);
                            }}>
                                <Form.Group>
                                    <Form.Label>Specialties</Form.Label>
                                    <SearchableMultiSelectField
                                        dataset={specialtiesList}
                                        dataSelected={
                                            values.specialties.length>0?
                                            values.specialties.map(s=>{
                                                return specialtiesList.find(sp=>sp._id===s)
                                            }):
                                            []
                                        }
                                        handleOnItemSelection={(items) => {
                                            setFieldValue("specialties", items.map(i=>i._id));
                                        }} />
                                    {
                                        errors.specialties ?
                                            <div className="my-2 small text-danger">{errors.specialties}</div> :
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