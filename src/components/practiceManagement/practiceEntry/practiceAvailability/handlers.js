const moment=require('moment');

export const getTimeSlots=() => {
    
    let loopHours = moment().hours(0).minutes(0).seconds(0);
    let td = moment().hours(0).minutes(0).seconds(0);

    let slots=[];
    
    while (loopHours.diff(td, 'days') <= 0) {
        slots.push(loopHours.format());
        loopHours.add(15, 'minutes');
    }

    return slots;
}