const _formjs = new formjs();
const _bindEvents = new bindFormControlEvents({
    "formData": _formjs.formData
});

/**
 * @params null.
 * Bind all the list fields 
 */
const bindListFields = async function () {

    let _lists = new listjs();

    //*** BIND COUNTRIES DROP DOWN FIELD ***
    let countries = await _lists.getCountries();
    countries = countries.sort(function (a, b) {
        if (a.name > b.name) return 1;
        return -1;
    });

    let optionDialCodeHtml = "<option value=''>Select country code</option>";
    let countryNameHtml = "<option value=''>Select country</option>";

    countries.forEach(c => {
        optionDialCodeHtml += `<option value="${c._id}">${c.name} (${c.dial_code}) </option>`;
        countryNameHtml += `<option value="${c._id}">${c.name}</option>`
    });

    //add data to all the fields related to countries 
    $('#form-parent-content-container').find('.country-dial-code-option-list').html(optionDialCodeHtml);
    $('#form-parent-content-container').find('.country-name-option-list').html(countryNameHtml);

    //*** BIND MEDICAL SPECIALTIES DROP DOWN FIELDS ***
    let specialties = await _lists.getMedicalSpecialties();
    specialties = specialties.sort(function (a, b) {
        if (a.name > b.name) return 1;
        return -1;
    });

    specialties.map(m => m.name = capitalizeText(m.name));

    let specialtiesHtml = "<option value=''> - Select specialty - </option>";

    specialties.forEach(c => {
        specialtiesHtml += `<option class="text-capitalize" value="${c._id}">${c.name}</option>`;
    });

    //add data to all the fields related to countries 
    $('#form-parent-content-container')
        .find('.specialty-option-list')
        .html(specialtiesHtml);

    /**** BIND LANGUAGES DROP DOWN FIELDS ***/
    let languages = await _lists.getLanguages();
    languages = languages.sort(function (a, b) {
        if (a.name > b.name) return 1;
        return -1;
    });

    //bind the language container 
    _bindEvents.datasetSearchAndSelect({
        "container": $('#known-languages-search-container'),
        "dataset": languages,
        "search": function (txt) {
            let rgEx = new RegExp(txt, 'i');
            return languages.reduce(function (acc, ci) {
                if (rgEx.test(ci.name)) {
                    acc.push(ci);
                }
                return acc;
            }, []);
        },
        "initialSearchResults": languages.slice(0, 20),
        "displayItems": function (items) {
            let html = '';
            items.forEach((element, indx) => {
                html += `<div class='p-2 search-results-item border-bottom' indx="${indx}" _id="${element._id}">
                    <div class="text-capitalize">${element.name}</div>
                </div>`;
            });
            return html;
        },
        "displayOnSelect": function (item) {

            let itemId = $(item).attr('_id');
            let langageInfoIndx = languages.findIndex(l => l._id === itemId);

            return `<div class="d-inline-block item p-1 pl-2 pr-2 mr-2 border" _id="${itemId}">
                <div class="d-inline-block mr-2">${languages[langageInfoIndx].name}</div>
                <div class="d-inline-block remove-item">
                    <i class="material-icons text-danger align-middle pointer">clear</i>
                </div>
            </div>`;
        }
    });


    /**** BIND MEDICAL COUNCILS */
    let councils = await _lists.getMedicalCouncils();
    councils = councils.sort(function (a, b) {
        if (a.name > b.name) return 1;
        return -1;
    });

    //bind the medical council container 
    _bindEvents.datasetSearchAndSelect({
        "container": $('#medical-registration-council-search-container'),
        "dataset": councils,
        "single": true,
        "search": function (txt) {
            let rgEx = new RegExp(txt, 'i');
            return councils.reduce(function (acc, ci) {
                if (rgEx.test(ci.name)) {
                    acc.push(ci);
                }
                return acc;
            }, []);
        },
        "initialSearchResults": councils.slice(0, 20),
        "displayItems": function (items) {
            let html = '';
            items.forEach((element, indx) => {
                html += `<div class='p-2 search-results-item border-bottom' indx="${indx}" _id="${element._id}">
                    <div class="text-capitalize">${element.name}</div>
                </div>`;
            });
            return html;
        },
        "displayOnSelect": function (item) {
            let itemId = $(item).attr('_id');
            let indx = councils.findIndex(l => l._id === itemId);

            return `<div class="d-inline-block item p-1 pl-2 pr-2 mr-2 border" _id="${itemId}">
                <div class="d-inline-block mr-2">${councils[indx].name}</div>
                <div class="d-inline-block remove-item">
                    <i class="material-icons text-danger align-middle pointer">clear</i>
                </div>
            </div>`;
        }
    });


    /** MEDICAL DEGREES */
    let degrees = await _lists.getMedicalDegrees();
    degrees = degrees.sort(function (a, b) {
        if (a.name > b.name) return 1;
        return -1;
    });

    //bind the language container 
    _bindEvents.datasetSearchAndSelect({
        "container": $('#medical-degree-search-container'),
        "dataset": degrees,
        "search": function (txt) {
            let rgEx = new RegExp(txt, 'i');
            return degrees.reduce(function (acc, ci) {
                if (rgEx.test(ci.name) || rgEx.test(ci.abbr)) {
                    acc.push(ci);
                }
                return acc;
            }, []);
        },
        "initialSearchResults": degrees.slice(0, 20),
        "displayItems": function (items) {
            let html = '';
            items.forEach((element, indx) => {
                html += `<div class='p-2 search-results-item border-bottom' indx="${indx}" _id="${element._id}">
                    <div class="text-capitalize">${element.abbr} (${element.name})</div>
                </div>`;
            });
            return html;
        },
        "displayOnSelect": function (item) {

            let itemId = $(item).attr('_id');
            let indx = degrees.findIndex(l => l._id === itemId);

            return `<div class="d-inline-block item p-1 pl-2 pr-2 mr-2 border" _id="${itemId}">
                <div class="d-inline-block mr-2">${degrees[indx].abbr} (${degrees[indx].name})</div>
                <div class="d-inline-block remove-item">
                    <i class="material-icons text-danger align-middle pointer">clear</i>
                </div>
            </div>`;
        }
    });


    /** BIND MEDICAL FACILITY TYPE LIST  */
    let types = await _lists.getMedicalFacilityTypes();

    types = types.sort(function (a, b) {
        if (a.name > b.name) return 1;
        return -1;
    });
    let html = '<option value="">- Select the facility type -</option>';
    types.forEach(element => {
        html += `<option value="${element._id}">${element.name}</option>`;
    });

    $('.medical-facility-type-list').html(html);


    /** BIND YEARS FIELDS */
    //-- add years in the drop down -- 
    let md = window.moment();
    let yearloop = 80;
    $('.years-dropdown').append(`<option value="">- Select the year -</option>`);
    while (yearloop > 0) {
        $('.years-dropdown').append(`<option value="${md.year()}">${md.year()}</option>`);
        md.subtract(1, 'year');
        yearloop--;
    }

};

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

    let loopHoursMoment = window.moment().hours(0).minutes(0).seconds(0);
    let td = window.moment().hours(0).minutes(0).seconds(0);
    let hours = [];
    while (loopHoursMoment.diff(td, 'days') <= 0) {
        hours.push({
            "displayFormat": loopHoursMoment.format('hh:mm a'),
            "hours": loopHoursMoment.hours(),
            "minutes": loopHoursMoment.minutes(),
            "meridian": loopHoursMoment.format('a')
        });
        loopHoursMoment.add(15, 'minutes');
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

            <div class="availability-day-container checkbox-control-group each-entry-field" data-required="1">
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

                <div class="mt-2 availability-hours-session-container multiple-data-entry each-entry-field" data-required="1"></div>
                
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

            let formValidation=_formjs.validateForm($(this).closest('.form-content-container'),'entry-field');

            if(formValidation===0){
                //add data to formdata array 
                _formjs.aggregateData($(this).closest('.form-content-container'));

                console.log(_formjs.formData);

                goToPg(this);
            }

        } else if ($(this).hasClass('previous-step-button')) {
            goToPg(this);
        }

    });
};

const bindCreateProfileButton = function () {

    $('.create-profile-button').click(function () {

        let formValidation=_formjs.validateForm($(this).closest('.form-content-container'),'entry-field');

            if(formValidation===0){
                //add data to formdata array 
                _formjs.aggregateData($(this).closest('.form-content-container'));

                console.log(_formjs.formData);

            }
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

            let validation=_formjs.validateForm($(visibleFormContainer),'entry-field');
            if(validation===0){
                //add data to formdata array 
                _formjs.aggregateData($(visibleFormContainer));
    
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
    bindCreateProfileButton();

    //--- bind lists ---- 
    bindListFields().then(function () {
        //hide the loader 
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
