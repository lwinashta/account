import React, { useEffect, useState } from 'react';

import { AppContext } from "../../AppContext";

import { UpdateSpecialtiesForm } from "./updateSpecialtiesForm";

const specialtiesList=require('@oi/utilities/lists/specialties.json');

export const Specialties = ({
    isDisabled=false
}) => {

    const [showForm, setShowForm] = useState(false);

    return (<>
        <AppContext.Consumer>
            {
                ({ userInfo }) => {
                    return <div className="d-flex flex-row align-items-top px-3">
                        <div className="field-name-lg">
                            <b>Specialties</b>
                            <div className="text-danger small">Required*</div>
                        </div>
                        <div className="field-value">
                            {
                                userInfo.specialties && userInfo.specialties.length>0?
                                <div className="d-flex flex-row flex-wrap">
                                {
                                    userInfo.specialties.map(s=>{
                                        return <div key={s} 
                                            className="text-capitalize border mr-2 px-2 py-1 bg-azure rounded">
                                            {specialtiesList.find(sp=>sp._id===s).name}    
                                        </div>
                                    })
                                }
                                </div>:
                                <div className="small text-muted">Click to update your specialties</div>
                            }
                        </div>
                        
                        <div>
                            <button 
                                title="Edit Name" 
                                className="icon-button"
                                disabled={isDisabled}
                                onClick={() => setShowForm(true)}>
                                <i className="fas fa-pencil-alt"></i>
                            </button>
                        </div>

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