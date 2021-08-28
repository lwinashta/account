import React, { useState, useEffect, useContext } from 'react';

import Container from 'react-bootstrap/Container';

import { Specialties } from "./specialties/specialties";
import { MedicalRegistration } from "./medicalRegistration/medicalRegistration"
import { MedicalDegrees } from './medicalDegrees/medicalDegrees';
import { Certificates } from './certificates/certificates';

import { WorkflowButtons } from './workflowButtons/workflowButtons'
import { AppContext } from '../AppContext';

export const ProviderQualification = () => {

    let { userInfo } = useContext(AppContext);

    return (
        <Container>

            <div className="bg-white border rounded bg-white my-3">
                <div className="h3 my-2 px-3 py-2">Provider Qualifications</div>

                <div className="py-2 border-top">
                    <WorkflowButtons />
                </div>

                <div className="py-2 border-top field-container">
                    <Specialties isDisabled={userInfo.qualificationVerificationState && userInfo.qualificationVerificationState !== "pending"} />
                </div>

                <div className="py-2 border-top field-container">
                    <MedicalRegistration isDisabled={userInfo.qualificationVerificationState && userInfo.qualificationVerificationState !== "pending"} />
                </div>

                <div className="py-2 border-top field-container">
                    <MedicalDegrees isDisabled={userInfo.qualificationVerificationState && userInfo.qualificationVerificationState !== "pending"} />
                </div>

                <div className="py-2 border-top field-container">
                    <Certificates  />
                </div>

            </div>

        </Container>
    );
}