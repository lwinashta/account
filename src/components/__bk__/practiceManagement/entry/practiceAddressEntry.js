import React, { useState, useContext, useEffect } from "react";
import { formjs, insertValues } from "@oi/utilities/lib/js/form";
import { Modal } from "@oi/reactcomponents";

const countries = require('@oi/utilities/lib/lists/countries.json');

export const PracticeAddressEntry = ({
    selectedPracticeInfo = {},
    onNextClick = null,
    onBackClick = null,
    setEntryData = null,
    onSubmission=null
}) => {

    /** States */

    const [confirmedAddress, setConfirmedAddress] = useState(selectedPracticeInfo);//sets the address 
    const [hideEntry, setHideEntry] = useState(false);

    const handleAddressConfirmation = (address) => {
                        
        if(onNextClick!==null){
            setConfirmedAddress(address);
            setHideEntry(true);
            onNextClick();
            setEntryData(address);

        }else if(onSubmission!==null){
            onSubmission(address);
        }
    
    }

    return (
        <div id="practice-address-container">
            <div>
                <div className="h5 font-weight-bold text-capitalize">Practice Address</div>
                <div className="text-muted small">
                    The address will be visible to patients or users searching for searching healthcare providers (doctors) or facilities.
                </div>
            </div>

            {
                hideEntry ?
                    <div className="small position-relative">
                        <div className="mt-2 mb-3 text-primary">
                            <div>
                                <span>{confirmedAddress.medical_facility_street_address_1}, </span>
                                {confirmedAddress.medical_facility_street_address_2.length > 0 ? <span>{confirmedAddress.medical_facility_street_address_2}</span> : null}
                            </div>
                            <div className="d-flex">
                                <div>{confirmedAddress.medical_facility_city},</div>
                                <div className="ml-1">{confirmedAddress.medical_facility_state},</div>
                                <div className="ml-1">{confirmedAddress.medical_facility_zip_code} </div>
                            </div>
                            <div>
                                {confirmedAddress.medical_facility_country}
                            </div>
                        </div>
                        <div className="push-right" onClick={() => { setHideEntry(false) }}>
                            <div className="btn-link pointer">Edit</div>
                        </div>
                        <div className="mt-2 d-flex justify-content-between">
                            <div className="btn-sm btn-secondary pointer small"
                                onClick={() => { onBackClick() }}>
                                <i className="fas fa-chevron-left mr-2"></i>
                                <span>Back</span>
                            </div>
                            <div className="btn-sm btn-info pointer small"
                                onClick={() => { onNextClick() }}>
                                <span>Next</span>
                                <i className="fas fa-chevron-right ml-2"></i>
                            </div>
                        </div>
                    </div> :
                    <AddressEntryForm
                        addressInfo={confirmedAddress}
                        onBackClick={onBackClick}
                        onAddressConfirmation={handleAddressConfirmation} />
            }
        </div>
    )
}

const AddressEntryForm = ({
    addressInfo = {},
    onBackClick = null,
    onAddressConfirmation = null
}) => {

    const [enteredAddress, setEnteredAddress] = useState({});

    const [recommendedAddress, setRecommendedAddress] = useState({});//address recoomendation after comparing google response and user entered address

    const [googleAddressResponse, setGoogleAddressResponse] = useState({});//Stores all responses
    const [googleAddress, setGoogleAddress] = useState({});//stores the repsonse in the format we want if user accepts the change

    const [confirmAddressRecommendationModal, setConfirmAddressRecommendationModalFlag] = useState(false);

    //** Refs */
    let addressEntryContainerRef = React.createRef();

    useEffect(() => {
        if (Object.keys(addressInfo).length > 0) {
            let _insertValues = new insertValues();
            _insertValues.container = $(addressEntryContainerRef.current);

            _insertValues.insert(addressInfo);
        }
    }, []);

    //Trigger After the google Address is obtained
    useEffect(() => {
        //Cehck the entered Address with google Address
        if (Object.keys(enteredAddress).length > 0 && Object.keys(googleAddressResponse).length > 0) {
            let _getRecommendedAddr = checkAddressValidity(enteredAddress, googleAddressResponse);

            console.log(_getRecommendedAddr);

            setRecommendedAddress(_getRecommendedAddr);

        }

    }, [enteredAddress, googleAddressResponse]);

    //Trigger after address comparision is complete 
    useEffect(() => {
        if (Object.keys(googleAddress).length > 0) {

            if (recommendedAddress === null) {
                throw 'invalid address';

            } else if (Object.keys(recommendedAddress).length > 0) {//Confirm Address Box
                setConfirmAddressRecommendationModalFlag(true);

            } else if (Object.keys(recommendedAddress).length === 0) {
                handleDoNotAcceptAddressChange();
            }

        }
    }, [googleAddress, recommendedAddress]);

    //***** Handlers */
    const getEnteredAddress = () => {
        let container = $(addressEntryContainerRef.current);
        let address = {};

        address.medical_facility_street_address_1 = $(container).find('[name="medical_facility_street_address_1"]').val();
        address.medical_facility_street_address_2 = $(container).find('[name="medical_facility_street_address_2"]').val();
        address.medical_facility_city = $(container).find('[name="medical_facility_city"]').val();
        address.medical_facility_state = $(container).find('[name="medical_facility_state"]').val();
        address.medical_facility_zip_code = $(container).find('[name="medical_facility_zip_code"]').val();
        address.medical_facility_country = $(container).find('[name="medical_facility_country"]').val();

        return address;
    }

    const getCordinates = (enteredAddress) => {

        let setAddress = `${enteredAddress.medical_facility_street_address_1},
            ${enteredAddress.medical_facility_street_address_2.length > 0 ? enteredAddress.medical_facility_street_address_1 + "," : ""}
            ${enteredAddress.medical_facility_city},
            ${enteredAddress.medical_facility_state}, 
            ${enteredAddress.medical_facility_zip_code}`;

        return $.getJSON('/google/maps/api/getaddresscordinates', {
            "address": setAddress
        });
    }

    /**
     * 
     * @param {address entered by user} addressEntered 
     * @param {reponse from gogle api to check the address} googleResponse 
     * @Logic match the city, zip and country with google response and ask user to confirm the changes
     */
    const checkAddressValidity = (addressEntered, googleResponse) => {
        console.log(addressEntered, googleResponse);
        let setGoogleAddressFromResponse = {};
        let getGoogleResults = googleResponse.json.results[0];//Take only the first resultset

        let googleStreetName1 = getGoogleResults.address_components.filter(addr => addr.types.indexOf('sublocality_level_2') > -1);
        setGoogleAddressFromResponse.medical_facility_street_address_1 = googleStreetName1.length > 0 ? googleStreetName1[0].long_name : addressEntered.medical_facility_street_address_1;
        let gs1RegEx = googleStreetName1.length > 0 ? new RegExp(`${googleStreetName1[0].long_name}|${googleStreetName1[0].short_name}`, 'i') : null;

        let googleStreetName2 = getGoogleResults.address_components.filter(addr => addr.types.indexOf('sublocality_level_1') > -1);
        setGoogleAddressFromResponse.medical_facility_street_address_2 = googleStreetName2.length > 0 ? googleStreetName2[0].long_name : addressEntered.medical_facility_street_address_2;
        let gs2RegEx = googleStreetName2.length > 0 ? new RegExp(`${googleStreetName2[0].long_name}|${googleStreetName2[0].short_name}`, 'i') : null;

        let getGoogleCity = getGoogleResults.address_components.filter(addr => addr.types.indexOf('locality') > -1);
        setGoogleAddressFromResponse.medical_facility_city = getGoogleCity.length > 0 ? getGoogleCity[0].long_name : addressEntered.medical_facility_city;
        let gCityRegEx = getGoogleCity.length > 0 ? new RegExp(`${getGoogleCity[0].long_name}\\b|${getGoogleCity[0].short_name}\\b`, 'i') : null;

        let getGoogleState = getGoogleResults.address_components.filter(addr => addr.types.indexOf("administrative_area_level_1") > -1);
        setGoogleAddressFromResponse.medical_facility_state = getGoogleState.length > 0 ? getGoogleState[0].long_name : addressEntered.medical_facility_state;
        let gStateRegEx = getGoogleState.length > 0 ? new RegExp(`${getGoogleState[0].long_name}\\b|${getGoogleState[0].short_name}\\b`, 'i') : null;

        let getGooglePostalCode = getGoogleResults.address_components.filter(addr => addr.types.indexOf("postal_code") > -1);
        setGoogleAddressFromResponse.medical_facility_zip_code = getGooglePostalCode.length > 0 ? getGooglePostalCode[0].long_name : addressEntered.medical_facility_zip_code;
        let gPostalCodeRegEx = getGooglePostalCode.length > 0 ? new RegExp(`${getGooglePostalCode[0].long_name}\\b|${getGooglePostalCode[0].short_name}\\b`, 'i') : null;

        let getGoogleCountry = getGoogleResults.address_components.filter(addr => addr.types.indexOf("country") > -1);
        setGoogleAddressFromResponse.medical_facility_country = getGoogleCountry.length > 0 ? getGoogleCountry[0].short_name : addressEntered.medical_facility_country;
        let gCountryRegEx = getGoogleCountry.length > 0 ? new RegExp(`${getGoogleCountry[0].long_name}|${getGoogleCountry[0].short_name}`, 'i') : null;

        let recommendedAddr = {};

        //Returning null = invalid address
        if (getGoogleCity.length === 0 || getGoogleState.length === 0 || getGooglePostalCode.length === 0 || getGoogleCountry.length === 0) {
            return null;
        }

        //Sublocality check. Address line 1
        if (addressEntered.medical_facility_street_address_1.length > 0 && gs1RegEx !== null
            && !(gs1RegEx.test(addressEntered.medical_facility_street_address_1))) {
            recommendedAddr.medical_facility_street_address_1 = googleStreetName1[0].long_name;
        }

        //Sublocality check. Address line 2
        if (addressEntered.medical_facility_street_address_2.length > 0 && gs2RegEx !== null
            && !(gs2RegEx.test(addressEntered.medical_facility_street_address_2))) {
            recommendedAddr.medical_facility_street_address_2 = googleStreetName2[0].long_name;
        }

        //City Check
        //console.log(gCityRegEx,addressEntered.medical_facility_city,gCityRegEx.test(addressEntered.medical_facility_city));
        if (gCityRegEx !== null && !(gCityRegEx.test(addressEntered.medical_facility_city))) {
            recommendedAddr.medical_facility_city = getGoogleCity[0].long_name;
        }

        //State Check
        //console.log(gStateRegEx,addressEntered.medical_facility_state,gStateRegEx.test(addressEntered.medical_facility_state));
        if (gStateRegEx !== null && !(gStateRegEx.test(addressEntered.medical_facility_state))) {
            recommendedAddr.medical_facility_state = getGoogleState[0].long_name;
        }

        //zip code check
        //console.log(gPostalCodeRegEx,addressEntered.medical_facility_zip_code,gPostalCodeRegEx.test(addressEntered.medical_facility_zip_code));
        if (gPostalCodeRegEx !== null && !(gPostalCodeRegEx.test(addressEntered.medical_facility_zip_code))) {
            recommendedAddr.medical_facility_zip_code = getGooglePostalCode[0].long_name;
        }

        //country check
        if (gCountryRegEx !== null && !(gCountryRegEx.test(addressEntered.medical_facility_country))) {
            recommendedAddr.medical_facility_country = getGoogleCountry[0].short_name;
        }

        setGoogleAddressFromResponse.medical_facility_cordinates = ({
            type: "Point",
            coordinates: [getGoogleResults.geometry.location.lng, getGoogleResults.geometry.location.lat]
        });

        setGoogleAddress(setGoogleAddressFromResponse);

        return recommendedAddr;

    }

    //*** VALIDATE ENTERED ADDRESS */
    //** */ VALIDATES THE ADDRESS AND GETS THE CORDINATES **/
    const validateAddress = (e) => {

        let btn = $(e.target);

        let _getEnteredAddress = getEnteredAddress();

        try {

            let form = $(addressEntryContainerRef.current);
            let validate = new formjs().validateForm(form);

            if (validate > 0) {
                throw ("validation Error");
            }

            uiButtons.addLoader(btn);

            getCordinates(_getEnteredAddress).then(googleAddressResponse => {

                console.log(googleAddressResponse);

                setEnteredAddress(_getEnteredAddress);
                setGoogleAddressResponse(googleAddressResponse);

                uiButtons.removeLoader(btn);

            }).catch(err => {
                console.log(err);
                if (err === "invalid address") {
                    $(addressEntryContainerRef.current).append('<div class="required-err">Invalid Address. Please check the address you have entered.</div>');
                }
            });
        } catch (error) {
            popup.onBottomCenterRequiredErrorMsg();
        }

    }

    const handleAcceptAddressChange = (e) => {
        //Get the google Address 
        onAddressConfirmation({ ...googleAddress });
        setConfirmAddressRecommendationModalFlag(false);
    }

    const handleDoNotAcceptAddressChange = (e) => {

        let _d = { ...enteredAddress };
        let _g = { ...googleAddress };

        //If user refuses to accept the recommended address the address remains the same but coordinates will be from google address response 
        _d.medical_facility_cordinates = _g.medical_facility_cordinates;
        _d.medical_facility_city = _g.medical_facility_city;
        _d.medical_facility_state = _g.medical_facility_state;

        console.log(_d);
        setConfirmAddressRecommendationModalFlag(false);
        onAddressConfirmation(_d);

    }

    return (
        <div>
            <div className="mt-2" ref={addressEntryContainerRef}>
                <div className="form-group ">
                    <label data-required="1">Street Address Line 1</label>
                    <input type="text" name="medical_facility_street_address_1" id="private-practice-street-address-1"
                        data-required="1" className="form-control mt-2 entry-field"
                        placeholder="Street Address line #1" />
                </div>

                <div className="form-group ">
                    <label>Street Address Line 2</label>
                    <input type="text" name="medical_facility_street_address_2"
                        id="private-practice-street-address-2"
                        className="form-control mt-2 entry-field"
                        placeholder="Street Address line #2 (Optional)" />
                </div>

                <div className="d-flex mt-1">
                    <div className="pr-2 w-50 form-group ">
                        <label data-required="1">City</label>
                        <input type="text" name="medical_facility_city" id="private-practice-city" data-required="1"
                            className="form-control entry-field" placeholder="City" />
                    </div>
                    <div className="w-50 pl-2 form-group ">
                        <label data-required="1">Zip Code/ Pin Code/ Postal Code</label>
                        <input type="text" name="medical_facility_zip_code" id="private-practice-zip-code" data-required="1"
                            className="form-control entry-field" placeholder="Zip/Postal code" />
                    </div>
                </div>

                <div className="d-flex mt-1">

                    <div className="pr-2 w-50 form-group ">
                        <label data-required="1">State</label>
                        <input type="text" name="medical_facility_state" id="private-practice-address-state"
                            className="form-control entry-field" data-required="1" placeholder="State" />
                    </div>

                    <div className="w-50 pl-2 form-group ">
                        <label data-required="1">Country</label>
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

                {
                    onBackClick!==null?
                        <div className="mt-2 d-flex justify-content-between">
                            <div className="btn-sm btn-secondary pointer small"
                                onClick={() => { onBackClick() }}>
                                <i className="fas fa-chevron-left mr-2"></i>
                                <span>Back</span>
                            </div>
                            <div className="btn-sm btn-info pointer small"
                                onClick={(e) => { validateAddress(e) }}>
                                <span>Validate Address & Go Next</span>
                                <i className="fas fa-chevron-right ml-2"></i>
                            </div>
                        </div>:
                        <div className="mt-2 text-center pt-2 border-top" 
                            onClick={(e) => { validateAddress(e) }}>
                            <button className="btn btn-primary w-75" type="submit">Validate Address</button>
                        </div>
                }

            </div>
            {
                confirmAddressRecommendationModal ?
                    <Modal header={<h3>Confirm Address</h3>}
                        onCloseHandler={() => { setConfirmAddressRecommendationModalFlag(false) }}>
                        <div className="p-2">
                            <div className="small text-danger">
                                Looks like the address you have entered doesn't match our validated address.
                                Please accept the recommended address by clicking on "Accept" button below.
                            </div>

                            <div className="mt-3">
                                <div className="font-weight-bold">Entered Address:</div>
                                <div className="mt-2 text-muted small position-relative">
                                    <div>
                                        <span>{enteredAddress.medical_facility_street_address_1}, </span>
                                        {enteredAddress.medical_facility_street_address_2.length > 0 ? <span>{enteredAddress.medical_facility_street_address_2}</span> : null}
                                    </div>
                                    <div className="d-flex">
                                        <div>{enteredAddress.medical_facility_city},</div>
                                        <div className="ml-1">{enteredAddress.medical_facility_state},</div>
                                        <div className="ml-1">{enteredAddress.medical_facility_zip_code} </div>
                                    </div>
                                    <div>
                                        {enteredAddress.medical_facility_country}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3">
                                <div className="font-weight-bold text-primary">Recommended Address:</div>
                                <div className="mt-2 small position-relative">
                                    <div>
                                        <span>{'medical_facility_street_address_1' in recommendedAddress ? <span className="text-danger font-weight-bold">{recommendedAddress.medical_facility_street_address_1}</span> : enteredAddress.medical_facility_street_address_1}, </span>
                                        {enteredAddress.medical_facility_street_address_2.length
                                            && 'medical_facility_street_address_2' in recommendedAddress ?
                                            <span className="text-danger font-weight-bold ">{recommendedAddress.medical_facility_street_address_2}</span> :
                                            <span>{enteredAddress.medical_facility_street_address_2}, </span>}
                                    </div>
                                    <div className="d-flex">
                                        <div>{'medical_facility_city' in recommendedAddress ? <span className="text-danger font-weight-bold">{recommendedAddress.medical_facility_city}</span> : enteredAddress.medical_facility_city},</div>
                                        <div className="ml-1">{'medical_facility_state' in recommendedAddress ? <span className="text-danger font-weight-bold">{recommendedAddress.medical_facility_state}</span> : enteredAddress.medical_facility_state},</div>
                                        <div className="ml-1">{'medical_facility_zip_code' in recommendedAddress ? <span className="text-danger font-weight-bold">{recommendedAddress.medical_facility_zip_code}</span> : enteredAddress.medical_facility_zip_code} </div>
                                    </div>
                                    <div>
                                        {'medical_facility_country' in recommendedAddress ? <span className="text-danger">{recommendedAddress.medical_facility_country}</span> : enteredAddress.medical_facility_country}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 d-flex justify-content-end">
                                <div className="btn-sm btn-info small pointer"
                                    onClick={() => { handleAcceptAddressChange() }}>
                                    <i className="fas fa-check-circle"></i>
                                    <span className="ml-2">Accept Address Change</span>
                                </div>
                                <div className="ml-3 btn-sm btn-danger small pointer"
                                    onClick={() => { handleDoNotAcceptAddressChange() }}>
                                    <i className="fas fa-minus-circle"></i>
                                    <span className="ml-2">Do not Accept Change</span>
                                </div>
                            </div>

                        </div>

                    </Modal> : null
            }
        </div>

    );
}