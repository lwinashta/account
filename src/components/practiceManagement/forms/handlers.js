export const saveMedicalFacilityInfo=(data)=>{
    let uri='/account/api/practice/medicalfacility/create';
    if("_id" in data) uri='/account/api/practice/medicalfacility/update';

    return fetch(uri,{
        method:"POST",
        body:JSON.stringify(data),
        headers:{
            "content-type": "application/json"
        }
    });
}

export const saveMedicalProvider=(data)=>{
    let uri='/account/api/practice/medicalprovider/create';
    if("_id" in data) uri='/account/api/practice/medicalprovider/update';

    return fetch(uri,{
        method:"POST",
        body:JSON.stringify(data),
        headers:{
            "content-type": "application/json"
        }
    });
}
