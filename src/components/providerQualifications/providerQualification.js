import React, { useState, useEffect, useContext } from 'react';

import Container from 'react-bootstrap/Container';

import { Specialties } from "./specialties/specialties";
import { MedicalRegistration } from "./medicalRegistration/medicalRegistration"
import { MedicalDegrees } from './medicalDegrees/medicalDegrees';

export const ProviderQualification = () => {

    return (
        <Container >

            <div className="bg-white border rounded bg-white my-3">
                <div className="h3 my-2 px-3 py-2">Provider Qualifications</div>

                <div className="py-2 border-top field-container">
                    <Specialties />
                </div>

                <div className="py-2 border-top field-container">
                    <MedicalRegistration />
                </div>

                <div className="py-2 border-top field-container">
                    <MedicalDegrees />
                </div>

            </div>

        </Container>
    );
}