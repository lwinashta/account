import {listjs} from '/gfs/utilities/lib/js/list.js';
import {formjs, bindFormControlEvents, insertValues} from '/gfs/utilities/lib/js/form.js';

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
        setCountryDialCodeDropDownField: function () {
            
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
                    
                        let specialties = await thisModule._lists.getMedicalSpecialties();
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
        
                    thisModule.lists.countries.forEach(c => {
                        html += `<option value="${element._id}">${element.name}</option>`;
                    });
                    
                    $(container).html(html);

                    resolve(html,"country drop down set");

                } catch (error) {
                    reject(error);
                }

            });

        },

        addMedicalFacilityMultipleContact:function(){

        },

        addMedicalFacilityAvailability:function(){

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