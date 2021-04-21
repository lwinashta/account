import React from 'react';
import { PracticeStateInfo, PracticeStateDescription } from './practiceState';

export const DisplayGeneralInfo=({
    facilityInfo={}
})=>{
    return (
        <div>
            <div className="py-2 border-bottom d-flex flex-row align-items-center" >
                <PracticeName facilityInfo={facilityInfo} />
                <PracticeStateInfo facilityInfo={facilityInfo} />
            </div>
            <PracticeStateDescription facilityInfo={facilityInfo}/>
            <PracticeFacilityTypes facilityInfo={facilityInfo} />
        </div>
    );
}

export const PracticeName=({facilityInfo={}})=>{
    return (<div style={{fontSize:"1.2em"}}>{facilityInfo.name}</div>)
}

export const PracticeFacilityTypes = ({ facilityInfo = {} }) => {
    return (<div className="d-flex mt-1 flex-row flex-wrap">
        {
            facilityInfo.facilityTypes.map(type => {
                return <div className="mr-2 p-2 rounded small bg-whitesmoke" key={type._id}>{type.name}</div>
            })
        }
    </div>);
}