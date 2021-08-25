import React, { useContext } from 'react';

import { Formik } from 'formik';
import * as Yup from 'yup';//creates the validation schema 

import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

import { AppContext } from "../../../AppContext";

const UserNameUpdateValidationScheme = Yup.object().shape({
    "firstName": Yup.string().required("Please enter the firstname").nullable(true),
    "lastName": Yup.string().required("Please enter the lastName").nullable(true)
});

export const UpdateNameForm = ({
    handleOnClose
}) => {

    let { userInfo, updateUserContextInfo } = useContext(AppContext);

    const handleOnSubmit=(values)=>{

        let data={
            "firstName":values.firstName,
            "lastName":values.lastName,
            "fullName":`${values.firstName} ${values.lastName}`
        }

        fetch('/account/api/user/profile/update',{
            method:"POST",
            body:JSON.stringify(Object.assign(data,{
                 "_id":userInfo._id
            })),
            headers: {
                "content-type": "application/json",
            }

        }).then(response=>response.json())
        .then(data=>{
            
            updateUserContextInfo(data);

            handleOnClose(false);//close the modal

        }).catch(err=>{
            alert("Issue in updating about me. Please try again later");
        });
    }

    return (
        <Modal show onHide={() => { handleOnClose(false) }}>

            <Modal.Header closeButton>
                <Modal.Title>Update Name</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Formik
                    validationSchema={UserNameUpdateValidationScheme}
                    onSubmit={(values)=>{handleOnSubmit(values)}}
                    initialValues={{
                        "firstName": userInfo.firstName,
                        "lastName": userInfo.lastName
                    }}>
                    {
                        ({
                            handleChange,
                            handleBlur,
                            handleSubmit,
                            isSubmitting,
                            errors,
                            values
                        }) => {
                            return <Form noValidate onSubmit={(e) => {
                                e.preventDefault();
                                handleSubmit();
                            }}>
                                <Form.Group>
                                        <Form.Label>First Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="firstName"
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            isInvalid={!!errors.firstName}
                                            defaultValue={values.firstName}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.firstName}
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group className="my-3">
                                        <Form.Label>Last Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="lastName"
                                            onChange={handleChange}
                                            handleBlur={handleBlur}
                                            isInvalid={!!errors.lastName}
                                            defaultValue={values.lastName}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.lastName}
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                <div className="py-2 d-flex flex-row justify-content-end">
                                    <Button variant="primary" type="submit" className="d-flex flex-row align-contents-center" disabled={isSubmitting}>
                                        {
                                            isSubmitting?
                                            <div className="mr-2"><Spinner variant="default" size="sm" animation="border"></Spinner></div>:
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