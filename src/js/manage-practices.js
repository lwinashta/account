import {
    runtime
} from "./base.js";

import {
    listjs
} from '/gfs/utilities/lib/js/list.js';

import {healthcareProviderActions as actions} from './healthcare-provider-form-actions.js';

const _lists = new listjs();

export class managePractices {

    constructor(values){
        this.container={};
        let self=this;
        self=Object.assign(this,values);
    }

    async init(){

        let self=this;

        //get facilitytypes 
        runtime.facilityTypes = await _lists.getMedicalFacilityTypes();

        //get countries 
        runtime.countries = await _lists.getCountries();

        let practices = await self.getUserPractices();

        console.log(practices);

        let html = "";
        practices.forEach(p => {
            html += `<div class="mt-3 mb-2 practice-row position-relative border-bottom pb-3" facilityid="${p.facilityId}" facilityuserid="${p._id}">
                 <div class="position-absolute edit-practice-button pointer" 
                    style="right:5px;" edititem="practice">
                    <i class="material-icons align-middle small-icon">edit</i>
                </div>
                ${self.setFacilityInfo(p)}
                ${self.setAvailability(p)}
            </div>`;
        });

        $(self.container).find('#practices-inner-container').html(html);

        self.bindEvents();

    }

    bindEvents(){
        let self=this;

        const bindPracticeFormFields=async function(form){

            actions.bindFields.addMedicalFacilityMultipleContact($('.multiple-contact-info-outer-container'));
            $('.multiple-contact-info-outer-container').find('.add-contact').trigger('click');

            actions.bindFields.addMedicalFacilityAvailability($('.multiple-availability-outer-container'));
            $('.multiple-availability-outer-container').find('.add-availability-days').trigger('click');

            let setCountriedDialCodeDD=await actions.bindFields.setCountryDialCodeDropDownField($(form).find('.country-dial-code-option-list'));

            //bind all the remove-row-item buttons
            $(form).on('click', '.remove-row-item', function () {
                $(this).closest('.row-item').remove();
            });
        };

        $(self.container).on('click','.edit-practice-button',function(){
            
            let itemtype = $(this).attr('edititem');
            let facilityId=$(this).closest('.practice-row').attr('facilityid');

            //hide all pg sections and show only editfom-container section
            $.get(`/edit/${itemtype}`).done(function (ly) {
                
                $('.pg-section').addClass('d-none');
                $('#editform-container').removeClass('d-none').html(ly);

                //load the practice id in the form 
                $('#manage-practice-form').attr('facilityid',facilityId);

                //bid all the fields in the form 
                bindPracticeFormFields($('#manage-practice-form')).then(d=>{
                    //load the values in the practice form 


                });

                $('#manage-practice-form').find('.done-button',function(){
                    //-- edit practice information --- 
                    
                });

            });
            
        });

        $(self.container).on('click','.add-practice-button',function(){
            
            let itemtype = $(this).attr('edititem');

            //hide all pg sections and show only editfom-container section
            $.get(`/edit/${itemtype}`).done(function (ly) {
                
                $('.pg-section').addClass('d-none');
                $('#editform-container').removeClass('d-none').html(ly);

                //bid all the fields in the form 
                bindPracticeFormFields($('#manage-practice-form')).then(d=>{
                    //load the values in the practice form 
                });

            });
            
        });
        
    }
    
    getUserPractices() {

        return $.ajax({
            "url": '/account/api/heathcarefacilityuser/getbyuserid',
            "processData": true,
            "contentType": "application/json; charset=utf-8",
            "data": {
                "user_mongo_id": runtime.userInfo._id
            },
            "method": "GET"
        });
    }

    setFacilityInfo(info) {
        let html = "";
    
        info.facilityInfo.forEach(f => {
            html += `<div>
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

    setAvailability(info) {

        let days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    
        let groupByDay = {};
    
        days.forEach(day => {
            info.availability_information.forEach(av => {
                if (av.availability_days.indexOf(day) > -1 && Object.keys(groupByDay).indexOf(day) > -1) {
                    groupByDay[day].concat(av.availability_time_slots);
                } else if (av.availability_days.indexOf(day) > -1 && Object.keys(groupByDay).indexOf(day) === -1) {
                    groupByDay[day] = [];
                    groupByDay[day] = groupByDay[day].concat(av.availability_time_slots);
                }
            });
        });
    
        let html = `<div class="small mt-2">
            <div class="d-inline-block mr-2"><label>Hours: </label></div>
            <div class="d-inline-block align-top text-muted">`;
    
        Object.keys(groupByDay).forEach(day => {
            html += `<div>
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
    
        html += `</div>
        </div>`;
    
        return html;
    
    }

}