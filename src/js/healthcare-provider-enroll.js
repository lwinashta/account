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
    actions.bindFields.addMedicalFacilityMultipleContact($('.multiple-contact-info-outer-container'));
    $('.multiple-contact-info-outer-container').find('.add-contact').trigger('click');

    actions.bindFields.addMedicalFacilityAvailability($('.multiple-availability-outer-container'));
    $('.multiple-availability-outer-container').find('.add-availability-days').trigger('click');

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
