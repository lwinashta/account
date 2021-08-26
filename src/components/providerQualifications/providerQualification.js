import React, { useState, useEffect, useContext } from 'react';

import { Specialties } from "./specialties/specialties";

export const ProviderQualification = () => {

    return (
        <div className="border rounded bg-white my-2">
            <div className="h3 my-2 px-3 py-2">Provider Qualification</div>

            <div className="px-3 py-2 border-top field-container">
                <Specialties />
            </div>

        </div>);
}