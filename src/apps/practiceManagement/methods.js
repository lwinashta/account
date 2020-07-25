import { formjs} from "@oi/utilities/lib/js/form";

/**
 * @function used while creating new practice or affiliating user to practice
 * @param {string} userId 
 * @param {string} facilityId 
 * @param {Array} availability 
 * @param {Boolean} affiliation //Defined if the user is affilaited to practice or have directly linked and created the practice.
 */
export const saveNewPracticeUser=(userId,facilityId,availability,affiliation)=>{
    
    let _formjs=new formjs();
    let facilityUserInfo = _formjs.convertJsonToFormdataObject({
        "affiliation":affiliation,
        "user_mongo_id.$_id": userId,
        "facilityId.$_id": facilityId,
        "availability_information": availability,
        "settings":{//default settings set by the system. User can change settings later 
            "appointment_time_slot_diff":"15",
            "appointment_allowed_booking_types":[
                "video","call","inperson"
            ]
        },
        "deleted.$boolean": false,
        "verified.$boolean":false
    });

    return $.ajax({
        "url": '/account/api/heathcarefacilityuser/create',
        "processData": false,
        "contentType": false,
        "data": facilityUserInfo,
        "method": "POST"
    }); 

}

export const updatePracticeUser=(data)=>{
    
    let _formjs=new formjs();
    let facilityUserInfo = _formjs.convertJsonToFormdataObject(data);

    return $.ajax({
        "url": '/account/api/heathcarefacilityuser/update',
        "processData": false,
        "contentType": false,
        "data": facilityUserInfo,
        "method": "POST"
    });

}