import {
    listjs
} from '/efs/utilities/lib/js/list.js';

import {
    formjs,
    bindFormControlEvents,
    insertValues
} from '/efs/utilities/lib/js/form.js';

const _bindEvents=new bindFormControlEvents();

let providerActions={};

(function () {

    /**
     * INITIALIZE
     */
    let thisModule=this;
    this._lists=new listjs();
    this.lists={};

    /**
    * Callbacks for fields in the form 
    */     
    this.fieldCallbacks = {
        "known_languages": {
            "onselect": function (itemId) {
                let languages = thisModule.lists.languages;
                let langageInfoIndx = languages.findIndex(l => l._id === itemId);

                return `<div class="d-inline-block item p-1 pl-2 pr-2 mr-2 mt-1 border" _id="${itemId}">
                <div class="d-inline-block mr-2">${languages[langageInfoIndx].name}</div>
                <div class="d-inline-block remove-item">
                    <i class="material-icons text-danger align-middle pointer">clear</i>
                </div>
            </div>`;

            }
        },
        "medical_degree": {
            "onselect": function (itemId) {

                let degrees = thisModule.lists.degrees;
                let indx = degrees.findIndex(l => l._id === itemId);

                return `<div class="d-inline-block item p-1 pl-2 pr-2 mr-2 mt-1 border" _id="${itemId}">
                <div class="d-inline-block mr-2">${degrees[indx].abbr} (${degrees[indx].name})</div>
                <div class="d-inline-block remove-item">
                    <i class="material-icons text-danger align-middle pointer">clear</i>
                </div>
            </div>`;
            }
        },
        "medical_registration_council": {
            "onselect": function (itemId) {

                let councils = thisModule.lists.councils;
                let indx = councils.findIndex(l => l._id === itemId);

                return `<div class="d-inline-block item p-1 pl-2 pr-2 mr-2 mt-1 border" _id="${itemId}">
                <div class="d-inline-block mr-2">${councils[indx].name}</div>
                <div class="d-inline-block remove-item">
                    <i class="material-icons text-danger align-middle pointer">clear</i>
                </div>
            </div>`;
            }
        }
    };

    this.bindFields={
        
        //*** BIND COUNTRIES DROP DOWN FIELD ***
        setCountryDropDownField:function(container){

            return new Promise(async (resolve,reject)=>{

                try {

                    if(!('countries' in thisModule.lists)){
                    
                        let countries = await thisModule._lists.getCountries();
                        countries = countries.sort(function (a, b) {
                            if (a.name > b.name) return 1;
                            return -1;
                        });
    
                        thisModule.lists.countries=countries;
                    }
        
                    let html = '<option value="">Select country</option>';
        
                    thisModule.lists.countries.forEach(c => {
                        html += `<option value="${c._id}">${c.name}</option>`;
                    });
                    
                    $(container).html(html);

                    resolve(html,"country drop down set");

                } catch (error) {
                    reject(error);
                }

            });
            
        },

        //*** BIND COUNTRIES DIAL CODE DROP DOWN FIELD ***
        setCountryDialCodeDropDownField: function (container) {
            
            return new Promise(async (resolve,reject)=>{

                try {
                    
                    if(!('countries' in thisModule.lists)){
                    
                        let countries = await thisModule._lists.getCountries();
                        countries = countries.sort(function (a, b) {
                            if (a.name > b.name) return 1;
                            return -1;
                        });
    
                        thisModule.lists.countries=countries;
                    }
        
                    let html = '<option value="">Select country code</option>';

                    thisModule.lists.countries.forEach(c => {
                        html += `<option value="${c._id}">${c.name} (${c.dial_code}) </option>`;
                    });
        
                    $(container).html(html);

                    resolve(html,"country dial code drop down set");

                } catch (error) {
                    reject(error);
                }

            });

        },

        //*** BIND MEDICAL SPECIALTIES DROP DOWN FIELDS ***
        setMedicalSpecialtiesDropDownField:function(container){
            
            return new Promise(async (resolve,reject)=>{

                try {

                    if(!('specialties' in thisModule.lists)){
                    
                        let specialties = await $.getJSON('/healthcare/api/specialties/getall');
                        specialties = specialties.sort(function (a, b) {
                            if (a.name > b.name) return 1;
                            return -1;
                        });
                        specialties.map(m => m.name = capitalizeText(m.name));
    
                        thisModule.lists.specialties=specialties;
                    }
        
                    let html = "<option value=''> - Select specialty - </option>";

                    thisModule.lists.specialties.forEach(c => {
                        html += `<option class="text-capitalize" value="${c._id}">${c.name}</option>`;
                    });
        
                    $(container).html(html);

                    resolve(html,"specialty drop down set");

                } catch (error) {
                    reject(error);
                }

            });
    
        },

        /**** BIND LANGUAGES DROP DOWN FIELDS ***/
        setLanguageComboField: function (container) {

            return new Promise(async (resolve,reject)=>{

                try {

                    if(!('languages' in thisModule.lists)){
                    
                        let languages = await thisModule._lists.getLanguages();
                        languages = languages.sort(function (a, b) {
                            if (a.name > b.name) return 1;
                            return -1;
                        });
    
                        thisModule.lists.languages = languages;
                    }
        
                    //bind the language container 
                    _bindEvents.datasetSearchAndSelect({
                        "container": container,
                        "dataset": thisModule.lists.languages,
                        "search": function (txt) {
                            let rgEx = new RegExp(txt, 'i');
                            return thisModule.lists.languages.reduce(function (acc, ci) {
                                if (rgEx.test(ci.name)) {
                                    acc.push(ci);
                                }
                                return acc;
                            }, []);
                        },
                        "initialSearchResults": thisModule.lists.languages.slice(0, 20),
                        "displayItems": function (items) {
                            let html = '';
                            items.forEach((element, indx) => {
                                html += `<div class='p-2 search-results-item border-bottom' indx="${indx}" _id="${element._id}">
                                <div class="text-capitalize">${element.name}</div>
                            </div>`;
                            });
                            return html;
                        },
                        "displayOnSelect": function (itemId) {
                            return thisModule.fieldCallbacks.known_languages.onselect(itemId);
                        }
                    });

                    resolve("language field set");

                } catch (error) {
                    reject(error);
                }

            });
            
        },

        /**** BIND MEDICAL COUNCILS */
        setMedicalCouncilComboField: function (container) {

            return new Promise(async (resolve, reject) => {

                try {

                    if (!('councils' in thisModule.lists)) {

                        let councils = await thisModule._lists.getMedicalCouncils();
                        councils = councils.sort(function (a, b) {
                            if (a.name > b.name) return 1;
                            return -1;
                        });

                        thisModule.lists.councils = councils;
                    }


                    //bind the medical council container 
                    _bindEvents.datasetSearchAndSelect({
                        "container": container,
                        "dataset": thisModule.lists.councils,
                        "single": true,
                        "search": function (txt) {
                            let rgEx = new RegExp(txt, 'i');
                            return thisModule.lists.councils.reduce(function (acc, ci) {
                                if (rgEx.test(ci.name)) {
                                    acc.push(ci);
                                }
                                return acc;
                            }, []);
                        },
                        "initialSearchResults": thisModule.lists.councils.slice(0, 20),
                        "displayItems": function (items) {
                            let html = '';
                            items.forEach((element, indx) => {
                                html += `<div class='p-2 search-results-item border-bottom' indx="${indx}" _id="${element._id}">
                                <div class="text-capitalize">${element.name}</div>
                            </div>`;
                            });
                            return html;
                        },
                        "displayOnSelect": function (itemId) {
                            return thisModule.fieldCallbacks.medical_registration_council.onselect(itemId);
                        }
                    });

                    resolve("medical council field set");

                } catch (error) {
                    reject(error);
                }

            });

        },

        /** MEDICAL DEGREES */
        setMedicalDegressComboField: function (container) {

            return new Promise(async (resolve, reject) => {

                try {

                    if (!('degrees' in thisModule.lists)) {

                        let degrees = await thisModule._lists.getMedicalDegrees();
                        degrees = degrees.sort(function (a, b) {
                            if (a.name > b.name) return 1;
                            return -1;
                        });

                        thisModule.lists.degrees = degrees;
                    }

                    //bind the medical degree container 
                    _bindEvents.datasetSearchAndSelect({
                        "container": container,
                        "dataset": thisModule.lists.degrees,
                        "search": function (txt) {
                            let rgEx = new RegExp(txt, 'i');
                            return thisModule.lists.degrees.reduce(function (acc, ci) {
                                if (rgEx.test(ci.name) || rgEx.test(ci.abbr)) {
                                    acc.push(ci);
                                }
                                return acc;
                            }, []);
                        },
                        "initialSearchResults": thisModule.lists.degrees.slice(0, 20),
                        "displayItems": function (items) {
                            let html = '';
                            items.forEach((element, indx) => {
                                html += `<div class='p-2 search-results-item border-bottom' indx="${indx}" _id="${element._id}">
                                    <div class="text-capitalize">${element.abbr} (${element.name})</div>
                                </div>`;
                            });
                            return html;
                        },
                        "displayOnSelect": function (itemId) {
                            return thisModule.fieldCallbacks.medical_degree.onselect(itemId);
                        }
                    });

                    resolve("medical degree field set");

                } catch (error) {
                    reject(error);
                }

            });

        },

        setMedicalFacilityTypeDropDownField:function(container){

            return new Promise(async (resolve,reject)=>{

                try {

                    if(!('facilitytypes' in thisModule.lists)){
                    
                        let facilitytypes = await thisModule._lists.getMedicalFacilityTypes();
                        facilitytypes = facilitytypes.sort(function (a, b) {
                            if (a.name > b.name) return 1;
                            return -1;
                        });
    
                        thisModule.lists.facilitytypes=facilitytypes;
                    }
        
                    let html = '<option value="">- Select the facility type -</option>';
        
                    thisModule.lists.facilitytypes.forEach(element => {
                        html += `<option value="${element._id}">${element.name}</option>`;
                    });
                    
                    $(container).html(html);

                    resolve(html,"country drop down set");

                } catch (error) {
                    reject(error);
                }

            });

        },

        /**
         * to add multiple contact information
         */
        addMedicalFacilityMultipleContact:function(container){
            
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
            $(container).find('.add-contact').on('click', function () {
                
                let innerContainer=$(this).closest('.multiple-contact-info-outer-container')
                    .find('.multiple-contact-info-inner-container');
        
                $(innerContainer).append(addContactLayout(innerContainer));
        
            });
        
        },

        addMedicalFacilityAvailability:function(container){
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
        
            $(container).on('click', '.add-time-slot', function () {
        
                let innerContainer=$(this).closest('.availability-hours-container')
                    .find('.availability-hours-session-container');
        
                $(innerContainer).append(addTimeSlot(innerContainer));
        
            });
        
            //bind multiple availability entry 
            $(container).find('.add-availability-days').click(function () {
        
                let innerContainer = $(this)
                    .closest(container)
                    .find('.multiple-availability-inner-container');
        
                let indx = $(innerContainer).find('.availability-row-container').length;
        
                $(innerContainer).append(addAvailableDays(innerContainer, indx));
        
                let items=$(innerContainer).find('.availability-row-container');
                $(items[indx]).find('.add-time-slot').trigger('click');
        
            });
        },

        setYearDropDownField: function (container) {
            /** BIND YEARS FIELDS */
            //-- add years in the drop down -- 
            let md = window.moment();
            let yearloop = 80;

            let html = `<option value="">- Select the year -</option>`;

            while (yearloop > 0) {
                html += `<option value="${md.year()}">${md.year()}</option>`;
                md.subtract(1, 'year');
                yearloop--;
            }

            $(container).html(html);

        }

    }

}).apply(providerActions);

export var healthcareProviderActions=providerActions;