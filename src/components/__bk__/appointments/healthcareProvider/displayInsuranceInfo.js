import React from "react";
import { AppointmentContext } from "../../../../contexts/appoinment";

export const DisplayInsuranceInfo = () => {

    return (
        <AppointmentContext.Consumer>
            {({
                selectedAppointment = {}
            }) => {
                return <div>
                    {
                        'insurance_information' in selectedAppointment 
                            && Object.keys(selectedAppointment.insurance_information).length > 0 ?
                            <div className="d-flex mt-2">
                                <div>
                                    {
                                        selectedAppointment.insurance_information.insurance_files.length > 0 ?
                                            <div className="sm-img">
                                                <img src={'/file/public/fs/' + selectedAppointment.insurance_information.insurance_files[0]._id} />
                                            </div> :
                                            <i className="fas fa-hand-holding-medical"></i>
                                    }
                                </div>
                                <div className="ml-2">
                                    <div>
                                        <div>{selectedAppointment.insurance_information.insurance_provider}</div>
                                        <div className="text-muted small">{selectedAppointment.insurance_information.insurance_member_id}</div>
                                        {
                                            selectedAppointment.insurance_information.insurance_files.length > 0 ?
                                                <div className="mt-2 d-flex flex-wrap">
                                                    {
                                                        selectedAppointment.insurance_information.insurance_files.map(file => {
                                                            return <div className="med-img mr-2" key={file._id}>
                                                                <img className="rounded" src={'/file/public/fs/' + file._id} />
                                                            </div>
                                                        })
                                                    }
                                                </div>
                                                : null
                                        }
                                    </div>

                                </div>
                            </div>
                            : null
                    }
                </div>
            }}
        </AppointmentContext.Consumer>

    )
}