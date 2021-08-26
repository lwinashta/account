import React, { useEffect, useState } from 'react';

import { AppContext } from "../../AppContext";

import { UpdateSpecialtiesForm } from "./updateSpecialtiesForm";

const specialtiesList=require('@oi/utilities/lists/specialties.json');

export const Specialties = () => {

    const [showForm, setShowForm] = useState(false);

    return (<>
        <AppContext.Consumer>
            {
                ({ userInfo }) => {
                    return <div className="d-flex flex-row align-items-center" 
                            onClick={() => setShowForm(true)}>
                        <div className="field-name font-weight-bold">Registration</div>
                        <div className="field-value">
                            {
                                userInfo.medicalRegistrationNumber && userInfo.medicalRegistrationNumber>0?
                                <div>
                                    <div>{userInfo.medicalRegistrationNumber}</div>
                                    <div className="mt-2">
                                        
                                    </div>
                                </div>:
                                <div className="small text-muted">Click to update your specialties</div>
                            }
                        </div>
                        
                        <div><span className="material-icons">chevron_right</span></div>
                    </div>
                }
            }
        </AppContext.Consumer>
        {
            showForm ?
                <UpdateSpecialtiesForm 
                    specialtiesList={specialtiesList}
                    handleOnClose={setShowForm} /> :
                null
        }
    </>
    );
}