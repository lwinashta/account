import React,{useState,useEffect} from "react";

export const ShowAvailability=({availability=[],showEachForEntry=false})=>{
    
    //console.log(availability);
    const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

    const groupDataByDay=(day)=>{
        let grouping = {};

        if (showEachForEntry) {
            if (availability.availability_days.indexOf(day) > -1 && Object.keys(grouping).indexOf(day) > -1) {
                grouping[day] = grouping[day].concat(availability.availability_time_slots);

            } else if (availability.availability_days.indexOf(day) > -1 && Object.keys(grouping).indexOf(day) === -1) {
                grouping[day] = [];
                grouping[day] = grouping[day].concat(availability.availability_time_slots);
            }
        } else {
            availability.forEach(av => {
                if (av.availability_days.indexOf(day) > -1 && Object.keys(grouping).indexOf(day) > -1) {
                    grouping[day] = grouping[day].concat(av.availability_time_slots);

                } else if (av.availability_days.indexOf(day) > -1 && Object.keys(grouping).indexOf(day) === -1) {
                    grouping[day] = [];
                    grouping[day] = grouping[day].concat(av.availability_time_slots);
                }
            });
        }

        return grouping;
    }

    return (
        <div>
            <table className="table table-borderless td-p-1" style={{width:'auto'}}>
                <tbody>
            {
                DAYS.map((day,i)=>{
                    let groupByDay=groupDataByDay(day);
                    return (<tr key={i} >
                        <td className="text-capitalize align-top">{day}: </td>
                        <td>
                        {
                            day in groupByDay?
                            groupByDay[day].map((avd,j)=>{

                                let from=JSON.parse(avd.availability_from_slot_time);
                                let to=JSON.parse(avd.availability_to_slot_time);

                                return (<div key={j} className="font-weight-bold">
                                            {from.displayFormat} - {to.displayFormat}
                                        </div>)

                            }):<div>
                                <b className="text-danger">Closed</b>
                            </div>
                        }
                        </td>
                    </tr>)
                })
            }
            </tbody>
            </table>
            
        </div>  
    );

}