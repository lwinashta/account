import React, { useState, useContext, useEffect, useRef } from 'react';

import { form } from "form-module/form";
import { Modal } from "core/components/modal/web/modal";
const countries = require('@oi/utilities/lists/countries.json');

import { AppContext } from "../../AppContext";

const _iForm = new form();
_iForm.formConfig = require('account-manager-module/lib/user/address/form/config.json');

export const AddressEntryForm = ({
    onCloseHandler=function(){},
    afterSubmission=function(){},
    addressToUpdate=null
}) => {

    let AppLevelContext = useContext(AppContext);

    let formValues = useRef(addressToUpdate !== null ?
        {...addressToUpdate} : _iForm.getInitialFormObject());

    const [validationError, setValidationError] = useState([]);

    const handleFormValues = (params) => {
        formValues.current = Object.assign(formValues.current, params);
    }

    const handleAddressSubmission = async (e) => {

        try {
            e.preventDefault();

            //validation check 
            let _d = _iForm.validateForm(formValues.current);
            setValidationError(_d);

            if (_d.length > 0) {
                alert("Please enter required information.");

            } else { 

                //Insert necessary values in the data 
                let {isDefault,...data}=formValues.current;

                data["isDefault.$boolean"]=isDefault?isDefault:false;
                data["userMongoId.$_id"]=AppLevelContext.userInfo._id;

                let uri="/account/api/user/address/create";

                if(addressToUpdate!==null){
                    uri="/account/api/user/address/update";
                }else{
                    data["deleted.$boolean"]=false;
                }

                let addressInfo=await fetch(uri,{
                    method:"POST",
                    body:JSON.stringify(data),
                    headers:{
                        "content-type": "application/json"
                    }
                });

                let addressJson=await addressInfo.json();
                console.log(addressJson);
                afterSubmission(addressJson);

            }

        } catch (error) {
            alert("Error in saving address info");
        }

    }

    return (
        <Modal
            onCloseHandler = {() => { onCloseHandler() }}
            header={<h3>Address Entry</h3>}>
            <form className="pl-2 pr-2" onSubmit={(e) => { handleAddressSubmission(e) }}>
            <div className="form-group">
                <label htmlFor="user-streetAddress1" data-required="1">Street Address line #1 </label>
                <input type="text"
                    name="streetAddress1"
                    onInput={(e)=>{
                        handleFormValues({
                            streetAddress1:e.target.value
                        })
                    }}
                    defaultValue={addressToUpdate!==null?addressToUpdate.streetAddress1:null}
                    id="user-streetAddress1"
                    className="form-control"
                    data-required="1"
                    placeholder="Street Address line #1" />
                {validationError.length > 0 ?
                    _iForm.displayValidationError("streetAddress1") : null
                }
            </div>
            <div className="form-group">
                <label htmlFor="user-streetAddress2">Street Address line #2 
                    <i className="small">(optional)</i>
                </label>
                <input type="text"
                    name="streetAddress2"
                    defaultValue={addressToUpdate!==null?addressToUpdate.streetAddress2:null}
                    onInput={(e)=>{
                        handleFormValues({
                            streetAddress2:e.target.value
                        })
                    }}
                    id="user-streetAddress2"
                    className="form-control entry-field"
                    placeholder="Street Address line #2" />
            </div>
            <div className="row mt-2">
                <div className="col">
                    <label htmlFor="address-city" data-required="1">City </label>
                    <input type="text" 
                        onInput={(e)=>{
                            handleFormValues({
                                city:e.target.value
                            })
                        }}
                        defaultValue={addressToUpdate!==null?addressToUpdate.city:null}
                        name="city"
                        id="address-city"
                        className="form-control entry-field"
                        data-required="1"
                        placeholder="City" />
                    {validationError.length > 0 ?
                        _iForm.displayValidationError("city") : null
                    }
                </div>
                <div className="col">
                    <label htmlFor="address-zip-code" data-required="1">Zip Code </label>
                    <input type="text" name="zip_code"
                        onInput={(e)=>{
                            handleFormValues({
                                zipCode:e.target.value
                            })
                        }}
                        defaultValue={addressToUpdate!==null?addressToUpdate.zipCode:null}
                        id="address-zip-code"
                        className="form-control entry-field"
                        placeholder="Zip/Postal code"
                        data-required="1" />
                    {validationError.length > 0 ?
                        _iForm.displayValidationError("zipCode") : null
                    }
                </div>
            </div>
            <div className="row mt-2">
                <div className="col">
                    <label htmlFor="address-state" data-required="1">State </label>
                    <input type="text" name="state"
                        onInput={(e)=>{
                            handleFormValues({
                                state:e.target.value
                            })
                        }}
                        defaultValue={addressToUpdate!==null?addressToUpdate.state:null}
                        id="address-state"
                        className="form-control entry-field"
                        data-required="1"
                        placeholder="State" />
                    {validationError.length > 0 ?
                        _iForm.displayValidationError("state") : null
                    }
                </div>
                <div className="col">
                    <label htmlFor="address-country" data-required="1">Country </label>
                    <select name="country"
                        onChange={(e) => {
                            handleFormValues({ country: countries.find(_c => _c._id === e.target.value) });
                        }}
                        defaultValue={addressToUpdate!==null?addressToUpdate.country._id:null}
                        id="address-country"
                        className="form-control"
                        data-required="1" placeholder="country">
                        <option value=""></option>
                        {
                            countries.map((c, indx) => {
                                return <option key={indx} value={c._id}>{c.name}</option>
                            })
                        }
                    </select>
                    {validationError.length > 0 ?
                        _iForm.displayValidationError("country") : null
                    }
                </div>
            </div>
            <div className="form-group mt-4">
                <input type="checkbox"
                    name="isDefault"
                    onChange={(e) => {
                        handleFormValues({ isDefault: e.target.checked});
                    }}
                    defaultChecked={addressToUpdate!==null?addressToUpdate.isDefault:false}
                    id="user-isDefaultAddress"
                    className="mr-2"
                    placeholder="Default Address" />
                <label htmlFor="user-isDefaultAddress">
                    Mark as default
                </label>
            </div>
            <div className="mt-2 text-center">
                <button className="btn btn-primary w-75" type="submit">Save Address</button>
            </div>
        </form>
        </Modal>
    )
}