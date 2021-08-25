import React, { useContext } from 'react';

import { Formik } from 'formik';
import * as Yup from 'yup';//creates the validation schema 

import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

import { AppContext } from "../../../AppContext";

const UserGenderUpdateValidationScheme = Yup.object().shape({
    "birthdate": Yup.string().required("Please enter the birthdate").nullable(true),
});

export const UpdateBirthDateForm = ({
    handleOnClose
}) => {

    let { userInfo, updateUserContextInfo } = useContext(AppContext);

    const handleOnSubmit=(values)=>{

        let data={
            "birthdate":values.birthdate
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
                <Modal.Title>Update Gender</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Formik
                    validationSchema={UserGenderUpdateValidationScheme}
                    onSubmit={(values)=>{handleOnSubmit(values)}}
                    initialValues={{
                        "birthdate": userInfo.birthdate
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
                                        <Form.Label>Birth Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="birthdate"
                                            onChange={handleChange}
                                            isInvalid={!!errors.birthdate}
                                            defaultValue={values.birthdate} />

                                        <Form.Control.Feedback type="invalid">
                                            {errors.birthdate}
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