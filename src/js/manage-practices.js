import {
    runtime
} from "./base.js";

import {
    listjs
} from '/gfs/utilities/lib/js/list.js';

import {formjs, insertValues} from '/gfs/utilities/lib/js/form.js';

import {healthcareProviderActions as actions} from './healthcare-provider-form-actions.js';

const _lists = new listjs();
const _insertValues=new insertValues();

export class managePractices {

    constructor(values){
        this.container={};
        this.practices=[];
        let self=this;
        self=Object.assign(this,values);
    }

    async init(){

        let self=this;

        //get facilitytypes 
        runtime.facilityTypes = await _lists.getMedicalFacilityTypes();

        //get countries 
        runtime.countries = await _lists.getCountries();

        self.practices = await self.getUserPractices();

        console.log(self.practices);

        let html = "";
        self.practices.forEach(p => {
            html += `<div class="mt-3 mb-2 practice-row position-relative border-bottom-2px pb-3 " facilityid="${p.facilityId}" facilityuserid="${p._id}">
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

    sendAjaxReq(uri,data){
        return $.ajax({
            "url": uri,
            "processData": false,
            "contentType": false,
            "data": data,
            "method": "POST"
        });
    };

    //**** GET FORM DATA */
    aggregateFormData(form,_formjs) {

        let formData = {};

        $(form).find('.entry-field').each(function () {
            formData = Object.assign(formData, _formjs.getFieldData(this));
        });

        // -- get data for the multiple entry fields --- 
        //-- start with data-level 1 --- 

        let insertItems = function (md, level, d) {

            //--- name 
            let name = $(md).attr('name');

            if (!(name in d)) {
                d[name] = [];
            }

            $(md).children('.item').each(function () {

                let fd = {};
                let index = $(this).index();

                $(this).find('.each-entry-field').each(function () {
                    if ($(this).closest('.multiple-data-entry').attr('data-level') === level) {
                        fd = Object.assign(fd, _formjs.getFieldData(this));
                    }
                });

                d[name][index] = {};
                d[name][index] = fd;

                $(this).find('.multiple-data-entry').each(function () {
                    insertItems(this, $(this).attr('data-level'), d[name][index]);
                });

            });
        }

        $(form).find('.multiple-data-entry[data-level="1"]').each(function () {

            let level = $(this).attr('data-level');

            insertItems(this, level, formData);

        });

        return formData;
    }

    getCordinates(data) {
        return new Promise((resolve, reject) => {
            try {
                //get the cordinates of the practice address
                let address = `${data.medical_facility_street_address_1},${data.medical_facility_city},${data.medical_facility_state}, ${data.medical_facility_zip_code}`;

                $.getJSON('/google/maps/api/getaddresscordinates', {
                    "address": address,
                    "strict": true
                }).then(coordinates => {
                    resolve({
                        type: "Point",
                        coordinates: [coordinates.json.results[0].geometry.location.lng, coordinates.json.results[0].geometry.location.lat]
                    });
                });
                

            } catch (error) {
                reject(error);
            }

        });
    }

    async updatePracticeInformation(info,form){
        let self = this;

        try {

            const _formjs=new formjs();

            //-- validate the form 
            let validate=_formjs.validateForm(form);

            if(validate>0) throw "validation error";

            //-- edit practice information --- 
            _formjs.formData=self.aggregateFormData(form,_formjs);

            //update the information accordingly 
            //--- split the elements for the "healthcareFacilityUsers" table
            let type = [];
            type.push(_formjs.formData.practice_type);

            let healthcareFacilityUserInfo = {
                "practice_type": type,
                "availability_information": _formjs.formData.availability_information,
            };

            let data = _formjs.convertJsonToFormdataObject(healthcareFacilityUserInfo);
            data.append("user_mongo_id.$_id",info.user_mongo_id);
            data.append("_id",info._id);  //used for query therefore its not required to have .$_id 
            
            let updateUser = await self.sendAjaxReq('/account/api/heathcarefacilityuser/update', data);
            //console.log(updateUser);
            //remove the availability_information and practice_type since those are user information 
            delete _formjs.formData.availability_information;
            delete _formjs.formData.practice_type;

            //get updated cordinates of facility
            let getCordinates=await self.getCordinates(_formjs.formData);
            _formjs.formData["medical_facility_cordinates.$object"]=JSON.stringify(getCordinates); 

            let healthcareFacilityData = _formjs.convertJsonToFormdataObject(_formjs.formData);
            healthcareFacilityData.append("_id",info.facilityId);
            
            let healthcareFacility = await self.sendAjaxReq("/account/api/heathcarefacility/update",healthcareFacilityData);

            return "updated successfully";

        } catch (error) {
            console.log(error);
        }
        
    }

    async addNewPracticeInformation(form) {
        let self = this;

        try {

            const _formjs = new formjs();

            //-- validate the form 
            let validate = _formjs.validateForm(form);

            if (validate > 0) throw "validation error";

            //-- edit practice information --- 
            _formjs.formData = self.aggregateFormData(form, _formjs);

            //get user id
            let userid = $(form).attr('userid');
            console.log(userid);
            // --- get user information --- 
            let userInfo = await $.getJSON('/account/api/user/get', {
                "_id": userid
            });

            userInfo=userInfo.pop();

            //update the information accordingly 
            //--- split the elements for the "healthcareFacilityUsers" table
            let type = [];
            type.push(_formjs.formData.practice_type);

            let healthcareFacilityUserInfo = {
                "user_mongo_id.$_id": userInfo._id,
                "practice_type": type,
                "availability_information": _formjs.formData.availability_information,
            };

            //remove the availability_information and practice_type since those are user information 
            delete _formjs.formData.availability_information;
            delete _formjs.formData.practice_type;

            //get updated cordinates of facility
            let getCordinates = await self.getCordinates(_formjs.formData);
            _formjs.formData["medical_facility_cordinates.$object"] = JSON.stringify(getCordinates);

            let healthcareFacility = await self.sendAjaxReq("/account/api/heathcarefacility/create", _formjs.convertJsonToFormdataObject(_formjs.formData));

            //-- Inject facility Id in facilityUserInfo
            healthcareFacilityUserInfo["facilityId.$_id"] = healthcareFacility.insertedId;

            let healthcareFacilityUserDbInfo = await self.sendAjaxReq("/account/api/heathcarefacilityuser/create", _formjs.convertJsonToFormdataObject(healthcareFacilityUserInfo));

            return "added successfully";

        } catch (error) {
            console.error(error);
        }

    }

    bindEvents(){
        let self=this;

        const bindPracticeFormFields=async function(form){

            actions.bindFields.addMedicalFacilityMultipleContact($('.multiple-contact-info-outer-container'));
            $('.multiple-contact-info-outer-container').find('.add-contact').trigger('click');

            actions.bindFields.addMedicalFacilityAvailability($('.multiple-availability-outer-container'));
            $('.multiple-availability-outer-container').find('.add-availability-days').trigger('click');

            let setCountriedDialCodeDD=await actions.bindFields.setCountryDropDownField($(form).find('.country-name-option-list'));

            let setFacilityType=await actions.bindFields.setMedicalFacilityTypeDropDownField($(form).find('.medical-facility-type-list'));

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

                let form=$('#manage-practice-form');

                //load the practice id in the form 
                $(form).attr('facilityid',facilityId);

                let info=self.practices.filter(p=>p.facilityId===facilityId);

                //bind all the fields in the form 
                bindPracticeFormFields(form).then(d=>{
                    //load the values in the practice form 
                    
                    _insertValues.container=$(form);

                    _insertValues.insert(info[0]);
                    _insertValues.insert(info[0].facilityInfo[0]);

                    //load medical facility contacts 
                    let contacts=info[0].facilityInfo[0].medical_facility_contact_information;
                    let medicalFacilityContactContainer=$(form).find('[name="medical_facility_contact_information"]');
                    
                    contacts.forEach((c,indx)=>{
                        if(indx>0) $('.multiple-contact-info-outer-container').find('.add-contact').trigger('click');
                        let row=$(medicalFacilityContactContainer).find('.row').eq(indx);
                        Object.keys(c).forEach(key=>{
                            $(row).find(`[name="${key}"]`).val(c[key]);
                        });
                    });

                    //load user availability  
                    let availability=info[0].availability_information;
                    let availabilityContainer=$(form).find('[name="availability_information"]');

                    availability.forEach((a,indx)=>{
                        
                        if(indx>0) $(form).find('.multiple-availability-outer-container').find('.add-availability-days').trigger('click');
                        let row=$(availabilityContainer).find('> .row-item').eq(indx);
                        
                        a.availability_days.forEach(d=>{
                            $(row).find(`[name="availability_days"]`).find('input[type="checkbox"][value="'+d+'"]').prop('checked',true);
                        });

                        a.availability_time_slots.forEach((av,avIndx)=>{
                            
                            if(avIndx>0) $(row).find('.add-time-slot').trigger('click');
                            let avRow=$(row).find('.availability-hours-session-container').find(' > .row-item').eq(avIndx);

                            $(avRow).find(`[name="availability_from_slot_time"]`).val(av.availability_from_slot_time);
                            $(avRow).find(`[name="availability_to_slot_time"]`).val(av.availability_to_slot_time);

                        });

                    });


                });

                $(form).find('.done-button').click(function(){
                    popup.onScreen("Updating practice");
                   self.updatePracticeInformation(info[0],form).then(d=>{
                       window.location.reload();

                   }).catch(err=>{
                       console.log(error);
                   });

                });

            });
            
        });

        $(self.container).on('click','.add-practice-button',function(){
            
            let itemtype = $(this).attr('edititem');

            //hide all pg sections and show only editfom-container section
            $.get(`/edit/${itemtype}`).done(function (ly) {
                
                $('.pg-section').addClass('d-none');
                $('#editform-container').removeClass('d-none').html(ly);

                let form=$('#manage-practice-form');

                //bind all the fields in the form 
                bindPracticeFormFields($('#manage-practice-form')).then(d=>{
                    
                });

                $(form).find('.done-button').click(function(){

                    popup.onScreen("Adding New Practice");
                    
                    self.addNewPracticeInformation(form).then(d=>{
                        //console.log(d);
                        window.location.reload();
 
                    }).catch(err=>{
                        console.log(error);
                    });
 
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
            <div class="small border-bottom mt-2 pb-2">
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
                    groupByDay[day]=groupByDay[day].concat(av.availability_time_slots);

                } else if (av.availability_days.indexOf(day) > -1 && Object.keys(groupByDay).indexOf(day) === -1) {
                    groupByDay[day] = [];
                    groupByDay[day] = groupByDay[day].concat(av.availability_time_slots);
                }
            });
        });

        //console.log(groupByDay);
    
        let html = `<div class="small mt-2 pb-2">
            <div class="d-inline-block mr-2"><label>Hours: </label></div>
            <div class="d-inline-block align-top text-muted">`;
    
        days.forEach(day => {
            html += `<div>
                <span class="text-capitalize">${day}: </span>
                <span>
                    ${day in groupByDay?groupByDay[day].map(avd=>{
                        let from=JSON.parse(avd.availability_from_slot_time);
                        let to=JSON.parse(avd.availability_to_slot_time);
                        return `<b>${from.displayFormat} to ${to.displayFormat}</b>`;
                    }).join(', '):"<b style='color:red'>Closed</b>"}
                </span>
            </div>`;
        });
    
        html += `</div>
        </div>`;
    
        return html;
    
    }

}