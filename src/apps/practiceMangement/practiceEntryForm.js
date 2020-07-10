import React, { useEffect, useState, useContext } from "react";
const countries = require('@oi/utilities/lib/lists/countries.json');
import { Modal } from "@oi/reactcomponents";
import { formjs, insertValues, fileUploadField, multiSelectDropDown } from "@oi/utilities/lib/js/form";
import { UserInfo } from "../../contexts/userInfo";
import { ShowAvailability } from "./showAvailability";
import { AvailabilityEntry } from "./availabilityEntry";
import { DisplayFacilityInfo} from "./displayFacilityInfo";
import { saveNewPracticeUser } from "./methods";

let _manageFiles = new fileUploadField();

const DisplayItemAsString = (item, _id) => {
    return (`<div _id="${_id}" class="item bg-lgrey text-capitalize border rounded pr-2 pl-2 pt-1 pb-1 mt-1 mr-2">
        <div class="d-inline-block align-middle">${item}</div>
        <div class="d-inline-block btn-link text-danger align-middle remove-item pointer">
            <i class="fas fa-times"></i>
        </div>
    </div>`);
}

const getCordinates = (enteredAddress) => {
    return new Promise((resolve, reject) => {
        try {
            //get the cordinates of the practice address
            let address = `${enteredAddress.medical_facility_street_address_1},
                ${enteredAddress.medical_facility_city},
                ${enteredAddress.medical_facility_state}, 
                ${enteredAddress.medical_facility_zip_code}`;

            $.getJSON('/google/maps/api/getaddresscordinates', {
                "address": address,
                "strict": true
            }).then(results => {
                resolve(results);
            });

        } catch (error) {
            reject(error);
        }

    });
}

export const PracticeEntryForm = ({ afterSubmission = {} }) => {

    let _formjs = new formjs();
    let params = useContext(UserInfo);
    let contactFormRef = React.createRef();
    let practiceEntryFormRef = React.createRef();
    let practiceFormData = {};

    const [practiceEnteredData, setPracticeEnteredData] = useState({});

    const [facilityContacts, setFacilityContacts] = useState([]);
    const [showContactEntryForm, setShowContactEntryFormFlag] = useState(false);
    const [editContactId, setEditContactId] = useState("");

    const [availability, setAvailability] = useState([]);
    const [showAvialabilityEntryForm, setShowAvialabilityEntryFormFlag] = useState(false);
    const [editAvailabilityId, setEditAvailabilityId] = useState("");

    const [practiceFiles, setPracticeFiles] = useState({});

    const [confirmAddressRecommendationModal, setConfirmAddressRecommendationModalFlag] = useState(false);
    const [enteredAddress, setEnteredAddress] = useState({});
    const [recommendedAddress, setRecommendedAddress] = useState({});
    const [googleAddressResponse, setGoogleAddressResponse] = useState({});

    useEffect(() => {
        //Set values if edit mode 
        //Bind the form upload pics 
        _manageFiles.container = $(practiceEntryFormRef.current).find('.droppable-file-container');
        _manageFiles.multiple = true;
        _manageFiles.name = $(practiceEntryFormRef.current).find('.droppable-file-container').attr('name');
        _manageFiles.onFileSelectionCallback = function (file, allUploaded) {
            setPracticeFiles(allUploaded);
        };
        _manageFiles.bind();//bind file drg and drop

        //Bind the multiselect field
        let _multiSelectDropDown = new multiSelectDropDown({
            container: $(practiceEntryFormRef.current).find('[name="medical_facility_type"]'),
            data: params.facilityTypes,
            initialDataset: params.facilityTypes,
            onItemSearch: function (val) {
                let rgEx = new RegExp(val, 'i');
                return params.facilityTypes.filter(ds => rgEx.test(ds.name));
            },
            displaySearchResults: function (items) {
                return items.map((item, indx) => {
                    return `<div class="p-2 border-bottom pointer text-capitalize item" _id="${item._id}">${item.name}</div>`
                });
            },
            onItemSelect: function (item) {
                return DisplayItemAsString(item.name, item._id);
            }
        });
        _multiSelectDropDown.bind();

        //Check if edit mode 
        if (Object.keys(params.selectedPracticeInfo).length > 0) {

            //Assign Values 
            let facilityInfo = params.selectedPracticeInfo.facilityInfo[0];
            let _insertValues = new insertValues({
                container: $(practiceEntryFormRef.current),
                fieldCallbacks: {
                    "medical_facility_type": {
                        onselect: function (item) {
                            let type = params.facilityTypes.filter(f => f._id === item)[0];
                            return DisplayItemAsString(type.name, type._id)
                        }
                    }
                }
            });
            _insertValues.insert(facilityInfo);

            //Insert files 
            _manageFiles.fileData = facilityInfo.files;
            _manageFiles.insertFiles();

            setAvailability(params.selectedPracticeInfo.availability_information);
            setFacilityContacts(facilityInfo.medical_facility_contact_information);

        }
    }, []);

    useEffect(() => {
        if (!showContactEntryForm) {
            setEditContactId("");
        }

        if (showContactEntryForm && editContactId.length > 0) {
            let contact = facilityContacts.filter(c => c._id === editContactId)[0];
            let _insertValues = new insertValues({
                container: $(contactFormRef.current)
            });

            _insertValues.insert(contact);

        }
    }, [showContactEntryForm, editContactId]);

    useEffect(() => {
        if (!showAvialabilityEntryForm) {
            setEditAvailabilityId("");
        }
    }, [showAvialabilityEntryForm]);

    useEffect(() => {
        //The data for the practice has been updated 
        //Do the address validatin and then submit the information 
        if (Object.keys(practiceEnteredData).length > 0) {

            getCordinates(practiceEnteredData).then(resultAddress => {
                setGoogleAddressResponse(resultAddress);

            }).catch(err => {
                console.log(err);
                $('#practice-address-container').append('<div class="required-err">Invalid Address. Please verify your address</div>');
            });

        }

    }, [practiceEnteredData]);

    useEffect(() => {

        if (Object.keys(googleAddressResponse).length > 0) {

            let validatedAddr = checkAddressValidity(practiceEnteredData, googleAddressResponse);

            if (Object.keys(validatedAddr).length > 0) {
                //popup confirmaton box to rectify the addr
                setEnteredAddress(practiceEnteredData);
                setRecommendedAddress(validatedAddr);
                setConfirmAddressRecommendationModalFlag(true);

            } else {
                //Save the Information
                submitPracticeInfo();
            }

        }
    }, [googleAddressResponse]);


    const addNewPracticeFiles = (linkedMongoId) => {

        let files = practiceFiles;
        let fileData = new FormData();

        Object.keys(files).forEach(key => {
            fileData.append(key, files[key]);
        });

        fileData.append("linked_mongo_id", linkedMongoId);
        fileData.append("linked_db_name", "accounts");
        fileData.append("linked_collection_name", "healthcareFacilities");

        return $.ajax({
            "url": '/g/uploadfiles',
            "processData": false,
            "contentType": false,
            "data": fileData,
            "method": "POST"
        });
    }

    const handleNewPracticeSubmission = (facilityInfo) => {

        let facilityId = "";
        let facilityUserId = "";

        //Save the facility Info .
        $.ajax({
            "url": '/account/api/heathcarefacility/create',
            "processData": false,
            "contentType": false,
            "data": _formjs.convertJsonToFormdataObject(facilityInfo),
            "method": "POST"
        }).then(facility => {

            facilityId = facility.insertedId;

            //Save New Practice User
            return saveNewPracticeUser(params.userInfo._id,facilityId,availability,false);

        }).then(facilityUserResponse => {

            facilityUserId = facilityUserResponse.insertedId;

            //Save Facility files 
            if (Object.keys(practiceFiles).length > 0) {
                return addNewPracticeFiles(facilityId);
            }

        }).then(uploadedFilesResponse => {

            //get the inof from sever fr the new / updated facility by Id
            return $.getJSON('account/api/heathcarefacilityuser/get', {
                "_id": facilityUserId
            });

        }).then(updatedReponse => {
            afterSubmission(updatedReponse);

        }).catch(err => {
            console.log(err);
        });
    }

    const handleUpdatePracticeSubmission = (facilityInfo) => {

        facilityInfo._id = params.selectedPracticeInfo.facilityInfo[0]._id;

        console.log(facilityInfo);

        //Save the facility Info .
        $.ajax({
            "url": '/account/api/heathcarefacility/update',
            "processData": false,
            "contentType": false,
            "data": _formjs.convertJsonToFormdataObject(facilityInfo),
            "method": "POST"
        }).then(facility => {

            //Save the facility User Info
            let facilityUserInfo = _formjs.convertJsonToFormdataObject({
                "_id": params.selectedPracticeInfo._id,
                "availability_information": availability
            });

            return $.ajax({
                "url": '/account/api/heathcarefacilityuser/update',
                "processData": false,
                "contentType": false,
                "data": facilityUserInfo,
                "method": "POST"
            });

        }).then(facilityUserResponse => {

            //Save Facility files 
            if (Object.keys(practiceFiles).length > 0) {
                return addNewPracticeFiles(facilityInfo._id);
            }
        }).then(uploadedFilesResponse => {

            //get the inof from sever fr the new / updated facility by Id
            return $.getJSON('account/api/heathcarefacilityuser/get', {
                "_id": params.selectedPracticeInfo._id
            });

        }).then(updatedReponse => {
            afterSubmission(updatedReponse);

        }).catch(err => {
            console.log(err);
        });
    }

    const submitPracticeInfo = () => {

        let facilityInfo = { ...practiceEnteredData };

        //Insert the 
        facilityInfo.medical_facility_city = 'medical_facility_city' in recommendedAddress ? recommendedAddress.medical_facility_city : facilityInfo.medical_facility_city;
        facilityInfo.medical_facility_state = 'medical_facility_state' in recommendedAddress ? recommendedAddress.medical_facility_state : facilityInfo.medical_facility_state;
        facilityInfo.medical_facility_zip_code = 'medical_facility_zip_code' in recommendedAddress ? recommendedAddress.medical_facility_zip_code : facilityInfo.medical_facility_zip_code;
        facilityInfo.medical_facility_country = 'medical_facility_country' in recommendedAddress ? recommendedAddress.medical_facility_country : facilityInfo.medical_facility_country;

        facilityInfo.medical_facility_cordinates = ({
            type: "Point",
            coordinates: [googleAddressResponse.json.results[0].geometry.location.lng, googleAddressResponse.json.results[0].geometry.location.lat]
        });

        facilityInfo.medical_facility_contact_information = facilityContacts;

        if (Object.keys(params.selectedPracticeInfo).length > 0) {
            handleUpdatePracticeSubmission(facilityInfo);

        } else {
            facilityInfo.registration_number = params.userInfo.registration_number;
            facilityInfo["deleted.$boolean"] = false;
            facilityInfo["verified.$boolean"] = false;

            handleNewPracticeSubmission(facilityInfo);
        }

        //console.log(facilityInfo, availability, facilityContacts, practiceFiles);

    }

    /**
     * 
     * @Submission Execution Flow: 
     * 1. Validate the Information - Start Loader Here 
     * 2. Gather the information 
     * 3. SetPracticeEnteredData state - This Tiggers useEffect to get the Address Cordinates - executes getCordinates and sets googleAddressResponse state
     * 4a. If Address is correct, go to 5 
     * 4b. If address doesnt match. Pop up box to confirm the address match and the once Accepted go to 5 - Stop Loader Here
     * 5. Once Address cordinates are verified = executes submitPracticeInfo
     * 6. submitPracticeInfo checks if edit mode or create mode by looking into practiceInfo has passed
     * 7a. If create mode execute - handleNewPracticeSubmission + addNewPracticeFiles  - Stop Loader Here
     * 7b. If update mode execute - handleNewPracticeSubmission + addNewPracticeFiles  - Stop Loader Here
     */
    const handlePracticeSubmission = (e) => {
        e.preventDefault();
        let form = e.target;
        
        let validate = _formjs.validateForm(form);

        if (availability.length === 0) {
            $(form).find('#availability-container').append('<div class="required-err">Please enter availability</div>');
            validate++;
        }

        if (facilityContacts.length === 0) {
            $(form).find('#contact-info-container').append('<div class="required-err">Please enter contact information</div>');
            validate++;
        }

        if (validate === 0) {

            let data = {};

            $(form).find('.entry-field[name]').each(function () {
                let fd = _formjs.getFieldData(this);
                data = Object.assign(data, fd);
            });

            setPracticeEnteredData(data);

        } else {
            popup.onBottomCenter('Please enter required information');
        }

    }

    const handleAvailabilityEntrySubmission = (values) => {
        let userAvailability = [...availability];

        if (editAvailabilityId.length > 0) {
            let indx = userAvailability.findIndex(a => a._id === editAvailabilityId);
            userAvailability[indx] = values;
        } else {
            userAvailability.push(values);
        }

        setAvailability(userAvailability);
        setShowAvialabilityEntryFormFlag(false);

    }

    const handleEditAvailability = (_id) => {
        setEditAvailabilityId(_id);
        setShowAvialabilityEntryFormFlag(true);
    }

    const handleContactSubmission = (e) => {
        e.preventDefault();

        let form = e.target;
        let contacts = [...facilityContacts];

        //Get values 
        let data = {};
        $(form).find('.entry-field[name]').each(function () {
            let fd = _formjs.getFieldData(this);
            data = Object.assign(data, fd);
        });

        if (editContactId.length > 0) {
            data._id = editContactId;
            let indx = contacts.findIndex(c => c._id === editContactId);
            contacts[indx] = data;
        } else {
            data._id = getRandomId(facilityContacts.length);
            contacts.push(data);
        }
        setFacilityContacts(contacts);
        setShowContactEntryFormFlag(false);
    }

    const handleContactEdit = (_id) => {
        setEditContactId(_id);
        setShowContactEntryFormFlag(true);
    }

   

    /**
     * 
     * @param {address entered by user} addressEntered 
     * @param {reponse from gogle api to check the address} googleResponse 
     * @Logic match the city, zip and country with google response and ask user to confirm the changes
     */
    const checkAddressValidity = (addressEntered, googleResponse) => {
        console.log(addressEntered, googleResponse);
        let getGoogleResults = googleResponse.json.results[0];
        let getGoogleCity = getGoogleResults.address_components.filter(addr => addr.types.indexOf('locality') > -1);
        let getGoogleState = getGoogleResults.address_components.filter(addr => addr.types.indexOf("administrative_area_level_1") > -1);
        let getGooglePostalCode = getGoogleResults.address_components.filter(addr => addr.types.indexOf("postal_code") > -1);
        let getGoogleCountry = getGoogleResults.address_components.filter(addr => addr.types.indexOf("country") > -1);

        let recommendedAddr = {};

        if (getGoogleCity.length === 0 || getGoogleState.length === 0 || getGooglePostalCode.length === 0 || getGoogleCountry.length === 0) {
            throw new Error("invalid address");
        }

        if (getGoogleCity[0].long_name !== addressEntered.medical_facility_city && getGoogleCity[0].short_name !== addressEntered.medical_facility_city) {
            recommendedAddr.medical_facility_city = getGoogleCity[0].long_name;
        }

        if (getGoogleState[0].long_name !== addressEntered.medical_facility_state && getGoogleState[0].short_name !== addressEntered.medical_facility_state) {
            recommendedAddr.medical_facility_state = getGoogleState[0].long_name;
        }

        if (getGooglePostalCode[0].long_name !== addressEntered.medical_facility_zip_code && getGooglePostalCode[0].short_name !== addressEntered.medical_facility_zip_code) {
            recommendedAddr.medical_facility_zip_code = getGooglePostalCode[0].long_name;
        }

        if (getGoogleCountry[0].long_name !== addressEntered.medical_facility_country && getGoogleCountry[0].short_name !== addressEntered.medical_facility_country) {
            recommendedAddr.medical_facility_country = getGoogleCountry[0].short_name;
        }

        return recommendedAddr;

    }

    return (
        <UserInfo.Consumer>
            {({ selectedPracticeInfo = {} }) => {
                return <div>
                    <form ref={practiceEntryFormRef} onSubmit={(e) => { handlePracticeSubmission(e) }}>

                        {
                            Object.keys(selectedPracticeInfo).length > 0 && selectedPracticeInfo.facilityInfo[0].verified ?
                                <div className="pb-2 position-relative">
                                    <DisplayFacilityInfo facilityInfo={selectedPracticeInfo.facilityInfo[0]}/>                                      
                                    <hr />
                                </div> :
                                <div>
                                    <div className="form-group">
                                        <label htmlFor="private-practice-name"
                                            className="h5 font-weight-bold text-capitalize" data-required="1">Name </label>
                                        <div className="text-muted small">The facility name will be visible to patients or users searching healthcare providers (doctors) or facilities.</div>
                                        <input type="text" id="private-practice-name"
                                            name="medical_facility_name"
                                            className="form-control entry-field  mt-2" data-required="1"
                                            placeholder="Name of the establishment"
                                            defaultValue={Object.keys(selectedPracticeInfo).length > 0 ? selectedPracticeInfo.facilityInfo[0].medical_facility_name : ""} />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="private-practice-type" data-required="1" className="h5 font-weight-bold text-capitalize">Practice Facility Type </label>
                                        <div className="text-muted small">  The facility type will be visible to patients or users searching healthcare providers (doctors) or facilities.</div>
                                        <div name="medical_facility_type"
                                            className="multi-select-container hide-off-focus-outer-container entry-field"
                                            data-required="1"
                                            placeholder="Facility type">
                                            <div className="selected-items mb-2 d-flex flex-wrap"> </div>
                                            <div className="position-relative search-outer-container">
                                                <input type="text" className="form-control search-box" placeholder="Search Facilities" />
                                                <div className="search-results-container hide-off-focus-inner-container"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <div>
                                            <label className="h5 font-weight-bold text-capitalize" htmlFor="private-practice-description">Practice Description/ Services Available
                                                <i className="small text-muted ml-2">(Optional)</i>
                                            </label>
                                            <div className="text-muted small"> Please provide brief description about the facility and services provided
                                            (e.g., general and specialty surgical services, x ray/radiology services, laboratory services).
                                            Providing descripton helps patients to understand if it right choice for them</div>
                                        </div>
                                        <textarea className="mt-2 form-control entry-field"
                                            name="medical_facility_description"
                                            placeholder="Description"></textarea>
                                    </div>

                                    <div className="form-group mt-2" id="practice-address-container">
                                        <div>
                                            <label className="h5 font-weight-bold text-capitalize" data-required="1">Practice Address </label>
                                            <div className="text-muted small">
                                                The address will be visible to patients or users searching for searching healthcare providers (doctors) or facilities.
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <input type="text" name="medical_facility_street_address_1" id="private-practice-street-address-1"
                                                data-required="1" className="form-control mt-2 entry-field" placeholder="Street Address line #1" />
                                        </div>

                                        <div className="form-group">
                                            <input type="text" name="medical_facility_street_address_2" id="private-practice-street-address-2"
                                                className="form-control mt-2 entry-field" placeholder="Street Address line #2 (Optional)" />
                                        </div>

                                        <div className="form-group d-flex mt-1">
                                            <div className="pr-2 w-50">
                                                <input type="text" name="medical_facility_city" id="private-practice-city" data-required="1"
                                                    className="form-control entry-field" placeholder="City" />
                                            </div>
                                            <div className="w-50 pl-2">
                                                <input type="text" name="medical_facility_zip_code" id="private-practice-zip-code" data-required="1"
                                                    className="form-control entry-field" placeholder="Zip/Postal code" />
                                            </div>
                                        </div>

                                        <div className="form-group d-flex mt-1">

                                            <div className="pr-2 w-50">
                                                <input type="text" name="medical_facility_state" id="private-practice-address-state"
                                                    className="form-control entry-field" data-required="1" placeholder="State" />
                                            </div>

                                            <div className="w-50 pl-2">
                                                <select name="medical_facility_country" id="private-practice-country"
                                                    className="form-control country-name-option-list entry-field" data-required="1"
                                                    placeholder="country" >
                                                    <option value=""></option>
                                                    {
                                                        countries.map((c, indx) => {
                                                            return <option key={indx} value={c._id}>{c.name}</option>
                                                        })
                                                    }
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group">

                                        <label htmlFor="insurance-file" className="h5 font-weight-bold text-capitalize" data-required="1">Attach Practice Pictures </label>
                                        <div className="text-muted small">Attach your practice pictures. The pictures will be viewable to everyone who will be viewing your profile.</div>
                                        <div id="practice-pics-file-container"
                                            name="medical_facility_pictures"
                                            className="mt-2 p-2 position-relative droppable-file-container entry-field"
                                            placeholder="Practice Pictures">

                                            <div className="droppable-file-action-container">

                                                <div className="small text-muted d-inline-block">Drag and drop or upload the file</div>

                                                <div className="position-relative ml-2 upload-file-container d-inline-block">
                                                    <input type="file" id="insurance-file" className="form-control" multiple="multiple" />
                                                    <div className="btn-info p-1 rounded text-center input-overlay small">Upload File</div>
                                                </div>

                                            </div>

                                            <div className="droppable-file-preview-container"></div>

                                        </div>

                                    </div>

                                    <div className="form-group" id="contact-info-container">
                                        <div>
                                            <label data-required="1" className="h5 font-weight-bold text-capitalize">Practice Contact </label>
                                            <div className="text-muted small">
                                                The contact information will be visible to patients and users searching healthcare providers (doctors) or facilities.
                                            </div>
                                        </div>

                                        <div className="mt-2">
                                            {
                                                facilityContacts.length > 0 ? <div>
                                                    {
                                                        facilityContacts.map((contact, indx) => {
                                                            return <div key={indx} className="small p-2 border-bottom position-relative">
                                                                <div>
                                                                    <span>{contact.contact_info}</span>
                                                                    <span className="ml-2">({contact.contact_type})</span>
                                                                </div>
                                                                <div className="push-right d-flex">
                                                                    <div className="btn-link pointer " onClick={() => { handleContactEdit(contact._id) }}>Edit</div>
                                                                    <div className="btn-link text-danger ml-2 pointer">Delete</div>
                                                                </div>
                                                            </div>
                                                        })
                                                    }
                                                </div> : null
                                            }
                                            <div className="mt-2">
                                                <div className="small btn-link pointer" onClick={() => { setShowContactEntryFormFlag(true) }}>Add New Contact</div>
                                            </div>
                                        </div>

                                    </div>

                                </div>

                        }

                        <div className="form-group" id="availability-container">
                            <div>
                                <label data-required="1" className="h5 font-weight-bold text-capitalize">Your Availability At Above Location </label>
                                <div className="text-muted small">
                                    The availability information will be visible to all users or patients
                                    viewing your profile. System will determine the next available
                                    appointments per the availability provided here.
                                <br />
                                </div>
                            </div>

                            <div className="mt-2">
                                <div className="small">
                                    {
                                        availability.length > 0 ? <div>
                                            {availability.map((av, indx) => {
                                                return <div key={av._id} className="border-bottom p-2 position-relative">
                                                    <ShowAvailability
                                                        availability={av}
                                                        showEachForEntry={true} />
                                                    <div className="push-right d-flex">
                                                        <div className="btn-link pointer" onClick={() => { handleEditAvailability(av._id) }}>Edit</div>
                                                        <div className="btn-link ml-2 text-danger pointer">Delete</div>
                                                    </div>
                                                </div>
                                            })}
                                        </div> : null
                                    }
                                </div>

                                <div className="mt-2">
                                    <div className="small btn-link pointer" onClick={() => { setShowAvialabilityEntryFormFlag(true) }}>Add Availability</div>
                                </div>

                            </div>

                        </div>

                        <div className="mt-2 text-center pt-2 border-top">
                            <button className="btn btn-primary w-75" type="submit">Save Information</button>
                        </div>

                    </form>
                    {
                        showContactEntryForm ?
                            <Modal header={<h3>Contact Entry</h3>}
                                onCloseHandler={() => { setShowContactEntryFormFlag(false) }}>
                                <form onSubmit={(e) => { handleContactSubmission(e) }} ref={contactFormRef}>
                                    <div className="form-group">
                                        <label data-required="1">Contact Type</label>
                                        <select name="contact_type"
                                            className="form-control entry-field" data-required="1"
                                            placeholder="Contact Type">
                                            <option value="">- Select contact type -</option>
                                            <option value="Mobile Phone">Mobile Phone</option>
                                            <option value="Business Phone">Business Phone</option>
                                            <option value="Email">Email</option>
                                            <option value="Fax">Fax</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label data-required="1">Contact info</label>
                                        <input type="text" name="contact_info"
                                            className="form-control entry-field" data-required="1"
                                            placeholder="Contact information" />
                                    </div>
                                    <div className="mt-2 text-center pt-2" >
                                        <button className="btn btn-info w-75" type="submit">Save Contact Information</button>
                                    </div>
                                </form>
                            </Modal> : null
                    }
                    {
                        showAvialabilityEntryForm ?
                            <Modal header={<h3>Availability Entry</h3>}
                                onCloseHandler={() => { setShowAvialabilityEntryFormFlag(false) }}>
                                <AvailabilityEntry
                                    _editAvailabilityId={editAvailabilityId}
                                    _editAvailabilityInfo={editAvailabilityId.length > 0 ? availability.filter(v => v._id === editAvailabilityId)[0] : {}}
                                    _indx={Object.keys(params.selectedPracticeInfo).length > 0 ? params.selectedPracticeInfo.availability_information.length : 0}
                                    afterSubmission={handleAvailabilityEntrySubmission} />
                            </Modal> : null
                    }
                    {
                        confirmAddressRecommendationModal ?
                            <Modal header={<h3>Confirm Address</h3>}
                                onCloseHandler={() => { setConfirmAddressRecommendationModalFlag(false) }}>
                                <div>
                                    Looks like the address you have entered doesn't match our validated address.
                                    Please accept the recommended address by clicking on "Accept" button below.
                        </div>
                                <div className="mt-3">
                                    <div className="font-weight-bold">Entered Address:</div>
                                    <div className="text-muted small">
                                        <div>{enteredAddress.medical_facility_street_address_1}</div>
                                        {enteredAddress.medical_facility_street_address_2.length > 0 ? <div>{enteredAddress.medical_facility_street_address_2}</div> : null}
                                        <div>
                                            {enteredAddress.medical_facility_city}, {enteredAddress.medical_facility_state}, {enteredAddress.medical_facility_zip_code}
                                        </div>
                                        <div>
                                            {enteredAddress.medical_facility_country}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <div className="font-weight-bold text-primary">Recommended Address:</div>
                                    <div className="text-muted small">
                                        <div>{enteredAddress.medical_facility_street_address_1}</div>
                                        {enteredAddress.medical_facility_street_address_2.length > 0 ? <div>{enteredAddress.medical_facility_street_address_2}</div> : null}
                                        <div>
                                            {'medical_facility_city' in recommendedAddress ? <span className="text-danger">{recommendedAddress.medical_facility_city}</span> : enteredAddress.medical_facility_city},
                                    {'medical_facility_state' in recommendedAddress ? <span className="text-danger">{recommendedAddress.medical_facility_state}</span> : enteredAddress.medical_facility_state},
                                    {'medical_facility_zip_code' in recommendedAddress ? <span className="text-danger">{recommendedAddress.medical_facility_zip_code}</span> : enteredAddress.medical_facility_zip_code}
                                        </div>
                                        <div>
                                            {'medical_facility_country' in recommendedAddress ? <span className="text-danger">{recommendedAddress.medical_facility_country}</span> : enteredAddress.medical_facility_country}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 text-center pt-2" onClick={() => { submitPracticeInfo() }}>
                                    <button className="btn btn-primary w-75" type="submit">Accept Address Change</button>
                                </div>
                            </Modal> : null
                    }
                </div>

            }}
        </UserInfo.Consumer>
    );
}
