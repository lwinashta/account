import React from 'react';
import { AppointmentContext } from "../../../contexts/appoinment";
import { ProviderContext } from "../../../contexts/provider";
import { DisplayAppointmentState } from "./displayAppointmentState";
const config=require('../../../../../efs/core/config/config.json');
export const DisplayProviderDemographics = () => {

    return (<AppointmentContext.Consumer>
        {({ specialties = [] }) => {

            return <ProviderContext.Consumer>
                {({ provider = {} }) => {
                    return <div className="provider-demographics">
                        
                        {/* doctor name */}
                        <div className="d-flex">
                            <a href={`${config.domains[config.host][config.env].web}/profile/healthcare-provider/${provider._id}`}>
                                <div className="font-weight-bold">Dr. {provider.first_name} {provider.last_name}</div>
                            </a>
                            <div className="ml-2"><DisplayAppointmentState /></div>
                        </div>

                        {/* doc Specialty */}
                        <div className="mt-2">
                            {
                                "specialties" in provider ?
                                    <div className="d-flex small flex-wrap text-capitalize align-middle">
                                        {
                                            provider.specialties.map((specialty, indx) => {
                                                let classNames = indx > 0 ? " ml-1 dot-seprator " : "";
                                                return specialties.filter(s => s._id === specialty).map((s, si) => {
                                                    return <div className={classNames} key={si}>{s.name}</div>
                                                })
                                            })
                                        }
                                    </div> : null
                            }
                        </div>
                    </div>
                }}
            </ProviderContext.Consumer>

        }}
    </AppointmentContext.Consumer>)
}