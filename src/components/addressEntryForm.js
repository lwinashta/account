import React, { useState, useContext, useEffect } from 'react';
import { UserInfo } from "../contexts/userInfo";
const countries = require('@oi/utilities/lib/lists/countries.json');
import { formjs, insertValues } from "@oi/utilities/lib/js/form";

export const AddressEntryForm = ({afterSubmission={},addressInfoToEdit={}}) => {

    let formRef = React.createRef();

    let params = useContext(UserInfo);
    let _formjs = new formjs();
    let _insertValues = new insertValues();

    const handleAddressSubmission = (e) => {
        e.preventDefault();

        let form = e.target;
        let validate = _formjs.validateForm(form);

        let submitButton = $(form).find('button[type="submit"]');

        //add loader to button 
        uiButtons.addLoader(submitButton);

        if (validate === 0) {

            let address = {};

            //aggregate the data 
            $(form).find('.entry-field[name]').each(function () {
                let fd = _formjs.getFieldData(this);
                address = Object.assign(address, fd);
            });

            let data = {
                user_addresses: [],
                _id: params.userInfo._id
            };

            let addressId="";
            
            //check if address exists
            if ('user_addresses' in params.userInfo && params.userInfo.user_addresses.length > 0 && Object.keys(addressInfoToEdit).length === 0) {
                //create mode
                address._id = getRandomId() + (params.userInfo.user_addresses.length + 1);
                address.default = false;
                data.user_addresses = params.userInfo.user_addresses.concat([address]);
                
                addressId=address._id;

            } else if ('user_addresses' in params.userInfo && params.userInfo.user_addresses.length > 0 && Object.keys(addressInfoToEdit).length > 0) {
                //Edit mode 
                let indx = params.userInfo.user_addresses.findIndex(a => a._id === addressInfoToEdit._id);
                let addresses = [...params.userInfo.user_addresses];
                addresses[indx] = Object.assign(addresses[indx],address);
                data.user_addresses = addresses;

                addressId=addresses[indx]._id;

            } else {
                //create mode
                address._id = getRandomId() + '0';
                address.default = true;
                data.user_addresses.push(address);
                
                addressId=address._id;
            }

            let fdata = _formjs.convertJsonToFormdataObject(data);

            $.ajax({
                "url": '/account/api/user/update',
                "processData": false,
                "contentType": false,
                "data": fdata,
                "method": "POST"
            }).then(response => {

                afterSubmission({
                    addresses:data.user_addresses,
                    addressId:addressId
                });

                popup.onBottomCenterSuccessMessage("Address updated");

            }).catch(err => {
                reject(err);
            });

        } else {
            uiButtons.removeLoader(submitButton);
            popup.onBottomCenterRequiredErrorMsg();
        }

    }

    useEffect(() => {

        if (Object.keys(addressInfoToEdit).length > 0) {

            let form = formRef.current;

            //insert the values in the form 
            _insertValues.container = form;
            _insertValues.insert(addressInfoToEdit);

        }

    }, []);

    return (
        <form ref={formRef} className="pl-2 pr-2" onSubmit={(e) => { handleAddressSubmission(e) }}>
            <div className="form-group">
                <label htmlFor="address-street-address-1" data-required="1">Street Address line #1 </label>
                <input type="text"
                    name="street_line1"
                    id="address-street-address-1"
                    className="form-control mt-2 entry-field"
                    data-required="1"
                    placeholder="Street Address line #1" />
            </div>
            <div className="form-group">
                <label htmlFor="address-street-address-2">Street Address line #2 <i className="small">(optional)</i></label>
                <input type="text"
                    name="street_line2"
                    id="address-street-address-2"
                    className="form-control mt-2 entry-field"
                    placeholder="Street Address line #2" />
            </div>
            <div className="row mt-2">
                <div className="col">
                    <label htmlFor="address-city" data-required="1">City </label>
                    <input type="text" name="city"
                        id="address-city"
                        className="form-control entry-field"
                        data-required="1"
                        placeholder="City" />
                </div>
                <div className="col">
                    <label htmlFor="address-zip-code" data-required="1">Zip Code </label>
                    <input type="text" name="zip_code"
                        id="address-zip-code"
                        className="form-control entry-field"
                        placeholder="Zip/Postal code"
                        data-required="1" />
                </div>
            </div>
            <div className="row mt-2">
                <div className="col">
                    <label htmlFor="address-state" data-required="1">State </label>
                    <input type="text" name="state"
                        id="address-state"
                        className="form-control entry-field"
                        data-required="1"
                        placeholder="State" />
                </div>
                <div className="col">
                    <label htmlFor="address-country" data-required="1">Country </label>
                    <select name="country"
                        id="address-country"
                        className="form-control country-name-option-list entry-field"
                        data-required="1" placeholder="country">
                        <option value=""></option>
                        {
                            countries.map((c, indx) => {
                                return <option key={indx} value={c._id}>{c.name}</option>
                            })
                        }
                    </select>
                </div>
            </div>
            <div className="mt-2 text-center">
                <button className="btn btn-primary w-75" type="submit">Save Address</button>
            </div>
        </form>
    )
}