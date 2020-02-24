//import {runtime} from '../base/base.js';
import {healthcareProviderActions as actions} from './healthcare-provider-form-actions.js';
import {formjs, bindFormControlEvents, insertValues} from '/gfs/utilities/lib/js/form.js';
import {listjs} from '/gfs/utilities/lib/js/list.js';

//*** INITIALIZE VARIABLES */
const _formjs=new formjs();
const _bindEvents=new bindFormControlEvents({
    "formData": _formjs.formData//reference variable
});

//-- Insert list values -- 
var lists={};

/**
 * @params null.
 * Bind all the list fields 
 */
const bindListFields = async function () {

    //-- Set country and dial code drop down--
    let setCountriedDialCodeDD=await actions.bindFields.setCountryDialCodeDropDownField($('#form-parent-content-container').find('.country-dial-code-option-list'));
    let setCountriesDD=await actions.bindFields.setCountryDropDownField($('#form-parent-content-container').find('.country-name-option-list'));

    //--Set Specialties Drop down--- 
    let setSpecialtiesDD=await actions.bindFields.setMedicalSpecialtiesDropDownField($('#form-parent-content-container').find('.specialty-option-list'));
    
    //-- Set languages -- 
    let setLanguagesCF=await actions.bindFields.setLanguageComboField($('#known-languages-search-container'));

    //-- Set Medical Council -
    let medicalCouncilCF=await actions.bindFields.setMedicalCouncilComboField($('#medical-registration-council-search-container'));
    
    //--- set Medical Degree -- 
    let setMedicalDegreeCF=await actions.bindFields.setMedicalDegressComboField($('#medical-degree-search-container'))

    /** BIND MEDICAL FACILITY TYPE LIST  */
    let setFacilityType=await actions.bindFields.setMedicalFacilityTypeDropDownField($('.medical-facility-type-list'));

    //-- Year Drop down --- 
    actions.bindFields.setYearDropDownField($('.years-dropdown'));

};

//*** VALIDATE FORM FIELDS  
const validateForm=function(form){
    let errCount=_formjs.validateForm($(form),'entry-field');
    errCount+=_formjs.validateForm($(form).find('.multiple-data-entry'),'each-entry-field');
    return errCount;
};

//**** GET FORM DATA */
const aggregateData=function(form){

    let formData={};
    
    $(form).find('.entry-field').each(function(){
        formData=Object.assign(formData,_formjs.getFieldData(this));
    });

    // -- get data for the multiple entry fields --- 
    //-- start with data-level 1 --- 

    let insertItems=function(md,level,d){

        //--- name 
        let name=$(md).attr('name');

        if(!(name in d)){
            d[name]=[];
        }

        $(md).children('.item').each(function () {

            let fd = {};
            let index=$(this).index();

            $(this).find('.each-entry-field').each(function () {
                if($(this).closest('.multiple-data-entry').attr('data-level')===level){
                    fd = Object.assign(fd, _formjs.getFieldData(this));
                }
            });

            d[name][index]={};
            d[name][index]=fd;

            $(this).find('.multiple-data-entry').each(function(){
                insertItems(this,$(this).attr('data-level'),d[name][index]);
            });

        });
    }

    $(form).find('.multiple-data-entry[data-level="1"]').each(function(){

        let level=$(this).attr('data-level');

        insertItems(this,level,formData);
        
    });

    let formName=$(form).attr('name');

    if(!(formName in _formjs.formData)){
        _formjs.formData[formName]={};//initalize the object
    }
    
    _formjs.formData[formName]=Object.assign(_formjs.formData[formName],formData);
}

/**
 * @bindAddcontact - to add multiple contact information
 */
const bindAddContact = function () {

    let addContactLayout=function(parent){
        let items=$(parent).find('.item').length;
        return `<div class="row mt-2 row-item item">
            <div class="col">
                <select name="affiliation_contact_type" 
                    class="form-control each-entry-field" data-required="1"
                    placeholder="Contact Type">
                    <option value="">- Select contact type -</option>
                    <option value="Home Phone">Home Phone</option>
                    <option value="Mobile Phone">Mobile Phone</option>
                    <option value="Business Phone">Business Phone</option>
                    <option value="Email">Email</option>
                    <option value="Fax">Fax</option>
                </select>
            </div>
            <div class="col">
                <input type="text" name="contact_info" 
                    class="form-control each-entry-field" data-required="1"
                    placeholder="Contact information">
            </div>
            ${items>0?`<div class="col pointer remove-row-item">
                <i class="material-icons align-middle text-danger">clear</i>
            </div>`:`<div class="col"></div>`}
        </div>`
    };

    //bind multiple contact entry container 
    $('.multiple-contact-info-outer-container').find('.add-contact').on('click', function () {
        
        let innerContainer=$(this).closest('.multiple-contact-info-outer-container')
            .find('.multiple-contact-info-inner-container');

        $(innerContainer).append(addContactLayout(innerContainer));

    });

    $('.multiple-contact-info-outer-container').find('.add-contact').trigger('click');
};

/**
 * bind add multiple availability slots
 */
const bindAddAvailability = function () {

    let wkdays = [{
        "name": "sunday",
        "abbr": "sun"
    }, {
        "name": "monday",
        "abbr": "mon"
    }, {
        "name": "tuesday",
        "abbr": "tue"
    }, {
        "name": "wednesday",
        "abbr": "wed"
    }, {
        "name": "thursday",
        "abbr": "thur"
    }, {
        "name": "friday",
        "abbr": "fri"
    }, {
        "name": "saturday",
        "abbr": "sat"
    }];

    let loopHours=window.moment().hours(0).minutes(0).seconds(0);
    let td = window.moment().hours(0).minutes(0).seconds(0);
    let hours = [];
    while (loopHours.diff(td, 'days') <= 0) {
        hours.push({
            "displayFormat": loopHours.format('hh:mm a'),
            "hours": loopHours.hours(),
            "minutes": loopHours.minutes(),
            "meridian": loopHours.format('a')
        });
        loopHours.add(15, 'minutes');
    }

    let addTimeSlot = function (parent) {

        let items=$(parent).find('.item').length;

        return `<div class="row-item item mt-2">
            <div class="form-group d-inline-block" style="width:auto">
                <select name="availability_from_slot_time" style="width: auto;" 
                    class="form-control d-inline-block each-entry-field" 
                    data-required="1" placeholder="From Time">
                    <option value=''> - Select from Time - </option>
                    ${hours.map(e2 => {
                        return `<option value='${JSON.stringify(e2)}'>${e2.displayFormat}</option>`
                    }).join('')}
                </select>
            </div>

            <div class="ml-2 mr-2 d-inline-block"><i> to</i></div>

            <div class="form-group d-inline-block" style="width:auto">
                <select name="availability_to_slot_time" style="width: auto;" 
                class="form-control d-inline-block each-entry-field" 
                data-required="1" placeholder="To Time">
                <option value=''> - Select to Time - </option>
                    ${hours.map(e2 => {
                    return `<option value='${JSON.stringify(e2)}'>${e2.displayFormat}</option>`
                }).join('')}    
            </select>
            </div>
            
            ${items>0?`<div class="pointer remove-row-item d-inline-block ml-2">
                <i class="material-icons align-middle text-danger">clear</i>
            </div>`:''}
             
        </div>`;
    };

    let addAvailableDays=function(parent,indx){

        let items=$(parent).find('.item').length;

        return `<div class="row-item item form-group mt-2 p-2 availability-row-container" style="border: 1px dashed lightgrey;">
            
            <label data-required="1">Select Days</label>

            ${items>0?`<div class="pointer remove-row-item float-right">
                <i class="material-icons align-middle text-danger">clear</i>
            </div>`:''}

            <div class="availability-day-container checkbox-control-group each-entry-field" 
                data-required="1" name="availability_days">
                ${wkdays.map((e1, j) => {
                return `<div class="form-check d-inline-block mr-3">
                        <input id="availability-${e1.abbr}-${j}-${indx}" class="form-check-input" 
                            type="checkbox" name="availability_day" value="${e1.name}">
                        <label for="availability-${e1.abbr}-${j}-${indx}">${e1.abbr}</label>
                    </div>`;
            }).join('')}
            </div>

            <div class="form-group mt-2 availability-hours-container">
                <div>
                    <label data-required="1">Select Hours</label>
                    <div class="ctooltip"
                        content="You can add multiple time slots for each day. Click on the add icon to add additional time slots">
                        <i class="material-icons align-middle">info</i>
                    </div>
                </div>

                <div class="mt-2 availability-hours-session-container multiple-data-entry" 
                    data-required="1" data-level="2" name="availability_time_slots"></div>
                
                <div class="mt-2 add-time-slot d-inline-block pointer" title="Add another slot">
                    <div class="btn btn-info"> <label class="m-0 pointer">Add Time Slot</label></div>
                </div>

            </div>
        </div>`;
    }

    $('.multiple-availability-outer-container').on('click', '.add-time-slot', function () {

        let innerContainer=$(this).closest('.availability-hours-container')
            .find('.availability-hours-session-container');

        $(innerContainer).append(addTimeSlot(innerContainer));

    });

    //bind multiple availability entry 
    $('.multiple-availability-outer-container').find('.add-availability-days').click(function () {

        let innerContainer = $(this)
            .closest('.multiple-availability-outer-container')
            .find('.multiple-availability-inner-container');

        let indx = $(innerContainer).find('.availability-row-container').length;

        $(innerContainer).append(addAvailableDays(innerContainer, indx));

        let items=$(innerContainer).find('.availability-row-container');
        $(items[indx]).find('.add-time-slot').trigger('click');

    });

    $('.multiple-availability-outer-container')
        .find('.add-availability-days')
        .trigger('click');

};

const bindStepClickButton = function () {

    let goToPg = function (btn) {

        let stepnum = parseFloat($(btn).attr('stepnum'));

        let tab = $('.tabs[stepnum="' + stepnum + '"]');

        //console.log(nextStep,$(tab).length);
        if ($(tab).length > 0) {

            //--- check if show el exists for the tab -- 
            if (!$(tab).hasClass('tab-enabled') && $(tab).hasClass('tab-disabled')) {
                $(tab).removeClass('tab-disabled').addClass('tab-enabled');
            }

            $(tab).trigger('click')
                .find('.btn-rounded-sides')
                .removeClass('bg-light text-muted')
                .addClass('bg-primary');

        } else {

            //--- just show the tab 
            //hide all form container
            $('.form-content-container').hide();
            $('.form-content-container[stepnum  ="' + stepnum + '"]').show();

        }
    };

    $('.step-click').click(function () {

        //if the step click is next button then check the required fields
        if ($(this).hasClass('next-button')) {

            let formValidation=validateForm($(this).closest('.form-content-container'));

            if(formValidation===0){
                //add data to formdata array 
                aggregateData($(this).closest('.form-content-container'));

                console.log(_formjs.formData);

                goToPg(this);
            }

        } else if ($(this).hasClass('previous-step-button')) {
            goToPg(this);
        }

    });
};

const bindCreateProfileButton = function (user) {

    const sendAjaxReq=function(uri,data){
        return $.ajax({
            "url": uri,
            "processData": false,
            "contentType": false,
            "data": data,
            "method": "POST"
        });
    };

    $('.create-profile-button').click(async function () {

        try {
            $('body').append(`<div class="screen-loader" message="Saving your details"></div>`);

            let form = $('.form-content-container:visible');
            let formValidation = validateForm(form); //validate the current visible form

            let totalSteps=3;
            let completedSteps=1;

            if (formValidation === 0) {

                //add data to formdata array 
                aggregateData(form);
                console.log(_formjs.formData)

                let profileInfo = new FormData();

                //append data to formData Object 
                profileInfo = _formjs.convertJsonToFormdataObject(_formjs.formData.personal_info_form);
                profileInfo.append("_id", user._id);

                //update the information 
                let updateProfileInfo = await sendAjaxReq("/account/api/user/update", profileInfo);

                //set qualification data
                let qualification = new FormData();

                if ("qualification_form" in _formjs.formData) {
                    qualification = _formjs.convertJsonToFormdataObject(_formjs.formData.qualification_form);
                    qualification.append("_id", user._id);

                   let updateQualification = await sendAjaxReq("/account/api/user/update", qualification);
                   
                   completedSteps++;

                }

                //set the practice details
                if ("practice_details_form" in _formjs.formData) {

                    //--- split the elements for the "healthcareFacilityUsers" table
                    let healthcareFacilityUserInfo={
                        "user_mongo_id.$_id":user._id,
                        "practice_type":_formjs.formData.practice_details_form.practice_type,
                        "availability_information":_formjs.formData.practice_details_form.availability_information,
                    };

                    //remove the user information from facility details 
                    delete _formjs.formData.practice_details_form.practice_type;
                    delete _formjs.formData.practice_details_form.availability_information;

                    _formjs.formData.practice_details_form.registration_number=user.registration_number;

                    //get the cordinates of the practice address
                    let address=`${_formjs.formData.practice_details_form.medical_facility_street_address_1},${_formjs.formData.practice_details_form.medical_facility_city},${_formjs.formData.practice_details_form.medical_facility_state}, ${_formjs.formData.practice_details_form.medical_facility_zip_code}`;

                    let coordinates = await $.getJSON('/google/maps/api/getaddresscordinates', {
                        "address": address,
                        "strict": true
                    });

                    _formjs.formData.practice_details_form["medical_facility_cordinates.$object"]=JSON.stringify({
                        type: "Point",
                        coordinates: [coordinates.json.results[0].geometry.location.lng, coordinates.json.results[0].geometry.location.lat]
                    });

                    let healthcareFacility = await sendAjaxReq("/account/api/heathcarefacility/create", _formjs.convertJsonToFormdataObject(_formjs.formData.practice_details_form));

                    //-- Inject facility Id in facilityUserInfo
                    healthcareFacilityUserInfo["facilityId.$_id"]=healthcareFacility.insertedId;

                    let healthcareFacilityUserDbInfo=await sendAjaxReq("/account/api/heathcarefacilityuser/create", _formjs.convertJsonToFormdataObject(healthcareFacilityUserInfo));
                    
                    completedSteps++;

                }

                let enrollmentPercentage=Math.round((completedSteps/totalSteps)*100);

                ///update the user info stating enrollment complete : enrolled: true
                let enrollment=new FormData();
                enrollment.append("_id",user._id);
                enrollment.append("enrollmentProgress",enrollmentPercentage);

                let updateEnrolled = await sendAjaxReq("/account/api/user/update", enrollment);

                //all updates completed with no failure 
                window.location.assign('/summary');//go to summary page

            }
        } catch (error) {   
            console.error(error);

            //add notification for invalid address 
            $('body').find(`.screen-loader`).remove();
        }
        
    });

};

const getUserId=function(){
    return window.location.pathname.split('/').pop();
};

const getPersonalInfo=function(){
    let _id=getUserId();
    return $.getJSON('/account/api/user/get',{
        "_id":_id
    });
};

/** INITIATE EXECUTION */
$('document').ready(function () {

    //insert all the drop downs options
    $('#tabs-container').on('click', '.tab-enabled', function () {

        let me=this;

        let goToPg=function(){
            //hide all form container
            $('.form-content-container').hide();
    
            //show the element selected 
            let showel = $(me).attr('showel');
            $(`#${showel}`).show();

            //add checkmark 
            $('#tabs-container').find('.tabs .btn-rounded-sides').removeClass('bg-info');

            $(me).find('.btn-rounded-sides').addClass('bg-info');
        };

        //check all required elements for the current visible tab 
        let visibleFormContainer = $('.form-content-container:visible');

        //check if the stepnum for the current page is more than the clicked tab
        //if the user is going to prev step - dont need valdation of current page 
        // validatio is required only if user is going to next page 
        let currentstepnum = parseFloat($(visibleFormContainer).attr('stepnum'));
        let clickedstepnum = parseFloat($(this).attr('stepnum'));

        if (currentstepnum < clickedstepnum) {

            let validation=validateForm($(visibleFormContainer));

            if(validation===0){
                //add data to formdata array 
                aggregateData($(visibleFormContainer));
    
                goToPg();
            }

        }else{

            goToPg();
        }

    });

    $('.tabs[showel="heathcare-provider-personal-info-form"]').trigger('click');

    _bindEvents.container = $('#form-parent-content-container');

    _bindEvents.dragDropFileContainer();

    //bind fields
    bindAddContact();
    bindAddAvailability();
    bindStepClickButton();
    
    //--- bind lists ---- 
    //add data to all the fields related to countries 
    
    bindListFields().then(function () {
        //get the user personal information 
        return getPersonalInfo();
    }).then(users=>{

        //insert personal info values 
        let user=users[0];

        //assign values to the fields 
        let _insert=new insertValues({
            "container":$('#heathcare-provider-personal-info-form,#heathcare-provider-qualification-form'),
            "fieldCallbacks":actions.fieldCallbacks//callback especially for the onselect multi select field
        }).insert(user);

        bindCreateProfileButton(user);
        
    });

    //bind upload profile image 
    $('#update-profile-img-input').change(function(e){
        
        let me=this;
        if(e.target.files.length>0){
            
            let reader = new FileReader();

            reader.onload = function (event) {
                //console.log(event.target.result);
                $(me).closest('.form-group').find('img').attr("src",event.target.result);
            }

            reader.readAsDataURL(e.target.files[0]);
        }
        
    });

    //-- bind practice selection --- 
    //-- change the next button stepnum per the radio selection ---
    $('#heathcare-provider-practice-selection')
        .find('input[type="radio"][name="practice_selection_radio"]').change(function () {
            if ($(this).val() === "private_practice") {
                $('#heathcare-provider-practice-selection')
                    .find('.next-button').attr('stepnum', '3.2');

            } else if ($(this).val() === "affiliated_to_facility") {
                $('#heathcare-provider-practice-selection')
                    .find('.next-button').attr('stepnum', '3.1');
            }
        });

    //bind all the remove-row-item buttons
    $('#form-parent-content-container').on('click', '.remove-row-item', function () {
        $(this).closest('.row-item').remove();
    });

});
