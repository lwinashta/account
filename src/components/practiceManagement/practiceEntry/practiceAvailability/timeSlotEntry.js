import React, { useEffect, useState } from 'react';

import { useFormikContext } from 'formik';

import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { getTimeSlots } from 'account-manager-module/lib/practiceManagement/handlers';

const moment = require('moment');

export const TimeSlotEntry = ({ timeSlot }) => {

    let { values, setFieldValue } = useFormikContext();

    const [fromTimeSlots, setFromTimeSlots] = useState(getTimeSlots());
    const [selectedFromTimeSlot, setSelectedFromSlot] = useState(timeSlot.timeFrom ? timeSlot.timeFrom : "");

    const [toTimeSlots, setToTimeSlots] = useState([]);
    const [selectedToTimeSlot, setSelectedToSlot] = useState(timeSlot.timeTo ? timeSlot.timeTo : "");

    const handleTimeSlotDeletion = () => {
        let _d = [...values.availabilityTimeSlots];
        let indx = _d.findIndex(v => v.uuid === timeSlot.uuid);

        if (indx > -1) {
            _d.splice(indx, 1);
            setFieldValue("availabilityTimeSlots", _d);
        }
    }

    const handleTimeSlotChange=(slot)=>{
        let _d = [...values.availabilityTimeSlots];
        let indx = _d.findIndex(v => v.uuid === timeSlot.uuid);

        _d[indx]=Object.assign(_d[indx],slot);

        setFieldValue("availabilityTimeSlots", _d);        
    }

    useEffect(() => {
        console.log(selectedFromTimeSlot)
        if (selectedFromTimeSlot.length > 0) {
            //calc timeslots. The to timeSlot must be greater than from time.


            let formMomentTime = moment(selectedFromTimeSlot, "YYYY-MM-DDThh:mmTZD").second(0);
            let loopTime = moment().hours(formMomentTime.hour()).minutes(formMomentTime.minute()+15).second(0);
            let endTime=moment(loopTime.format()).add(1,'day').hour(0).minute(0).seconds(0);

            let _d = [];

            while (loopTime.diff(formMomentTime, 'minutes') > 0 && loopTime.diff(endTime,'minutes')<0) {
                _d.push(loopTime.format());
                loopTime.add(15, 'minutes');
            }

            setToTimeSlots(_d);

        } else {
            setToTimeSlots([]);
        }
    }, [selectedFromTimeSlot])

    return (
        <div className="d-flex flex-row align-items-center">
            <div>
                <Form.Group>
                    <Form.Control
                        as="select"
                        defaultValue={selectedFromTimeSlot}
                        name="timeFrom"
                        onChange={(e) => {
                            setSelectedFromSlot(e.target.value);
                            handleTimeSlotChange({
                                "timeFrom":e.target.value
                            });
                        }}>
                        <option value="" disabled>... Select From ...</option>
                        {
                            fromTimeSlots.map(t => {
                                return <option key={t} value={t}>{moment(t).format("hh:mm a")}</option>
                            })
                        }
                    </Form.Control>
                </Form.Group>
            </div>

            <div className="ml-2">
                <Form.Group >
                    <Form.Control
                        as="select"
                        disabled={selectedFromTimeSlot.length === 0}
                        defaultValue={selectedToTimeSlot}
                        name="timeTo"
                        onChange={(e) => {
                            setSelectedToSlot(e.target.value);
                            handleTimeSlotChange({
                                timeTo:e.target.value
                            });
                        }}>

                        <option value="" disabled>... Select To ...</option>

                        {
                            toTimeSlots.map(t => {
                                return <option key={t} value={t}>{moment(t).format("hh:mm a")}</option>
                            })
                        }
                    </Form.Control>
                </Form.Group>
            </div>

            <div className="text-danger ml-2"
                onClick={() => { handleTimeSlotDeletion() }}>
                <i className="far fa-trash-alt"></i>
            </div>

        </div>)
}