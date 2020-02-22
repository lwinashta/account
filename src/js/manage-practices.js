import {
    runtime
} from "./base.js";

import {listjs} from '/gfs/utilities/lib/js/list.js';

const _lists = new listjs();

const getUserPractices=function(){
    
    return $.ajax({
        "url":'/account/api/heathcarefacilityuser/getbyuserid',
        "processData": true,
        "contentType": "application/json; charset=utf-8",
        "data":{"user_mongo_id":runtime.userInfo._id},
        "method":"GET"
    });
}

const setFacilityInfo=function(info){
    let html="";

    info.facilityInfo.forEach(f=>{
        html+=`<div>
            <h4 class="d-inline-block">${f.medical_facility_name}</h4>
            <div class="dot-seprator d-inline-block">${info.practice_type[0]==="private_practice"?"Private Practice":"Affiliation"}</div>
        </div>
        <div class="small text-muted mb-2">${runtime.facilityTypes.filter(ftype=>ftype._id===parseInt(f.medical_facility_type))[0].name}</div>   
        <div class="small border-bottom">
            <label>Address: </label>
            <span class="text-muted">
                ${f.medical_facility_street_address_1},
                ${f.medical_facility_street_address_2.length>0?f.medical_facility_street_address_2+", ":""}
                ${f.medical_facility_city}, ${f.medical_facility_zip_code}, ${f.medical_facility_state}, ${runtime.countries.filter(co=>co._id===f.medical_facility_country)[0].name}
            </span>
        </div>
        <div class="small border-bottom mt-2">
            <div class="d-inline-block mr-2"><label>Contact: </label></div>
            <div class="d-inline-block align-top text-muted">
                ${f.medical_facility_contact_information.map(contact=>{
                    return `<div><b>${contact.contact_info}</b> (${contact.affiliation_contact_type})</div>` 
                }).join('')}
            </div>
        </div>`;
    });

    return html;
}

const setAvailability=function(info){
    let days=["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];

    let groupByDay={};

    days.forEach(day=>{
        info.availability_information.forEach(av=>{
            if(av.availability_days.indexOf(day)>-1 && Object.keys(groupByDay).indexOf(day)>-1){
                groupByDay[day].concat(av.availability_time_slots);
            }else if(av.availability_days.indexOf(day)>-1 && Object.keys(groupByDay).indexOf(day)===-1){
                groupByDay[day]=[];
                groupByDay[day]=groupByDay[day].concat(av.availability_time_slots);
            }
        });  
    });

    let html=`<div class="small mt-2">
        <div class="d-inline-block mr-2"><label>Hours: </label></div>
        <div class="d-inline-block align-top text-muted">`;

    Object.keys(groupByDay).forEach(day=>{
        html+=`<div>
            <span class="text-capitalize">${day}: </span>
            <span>
                ${groupByDay[day].length>0?groupByDay[day].map(avd=>{
                    let from=JSON.parse(avd.availability_from_slot_time);
                    let to=JSON.parse(avd.availability_to_slot_time);
                    return `<b>${from.displayFormat} to ${to.displayFormat}</b>`;
                }).join(', '):"<b>Closed</b>"}
            </span>
        </div>`;
    });

    html+=`</div>
    </div>`;

    return html;

}

//INITIAL DATA LOAD 
async function dataLoad() {
    try {
        // get user info 
        runtime.userInfo = await runtime.getUserInfo();

        //get facilitytypes 
        runtime.facilityTypes=await _lists.getMedicalFacilityTypes();

        //get countries 
        runtime.countries=await _lists.getCountries();

        let practices=await getUserPractices();

        console.log(practices);

        let html="";
        practices.forEach(p => {
            html+= `<div class="tile white-tile mb-2 practice-row position-relative">
                <div class="position-absolute" style="top:8px;right:5px;">
                    <div class="btn btn-primary btn-sm"><label class="m-0 pointer">Edit</label></div>
                </div>
                ${setFacilityInfo(p)}
                ${setAvailability(p)}
            </div>`;
        });

        $('#practices-outer-container').html(html);

    } catch (error) {
        console.error(error);
    }
}




$('document').ready(function () {
    //Initial Data Load 
    dataLoad().then(r1=>{
        
    });    
});
