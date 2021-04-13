import React, { useState, useContext, useEffect } from "react";
const countries = require('@oi/utilities/lists/countries.json');
import * as uiUtils from "@oi/utilities/lib/ui/utils";

import { FormContext } from "./../formContext";

export const PracticeAddressForm = () => {

    let contextValues = useContext(FormContext);
    
    return (
        <div>
            <div className="mb-3 font-weight-bold text-primary">Practice Address:</div>
            <div className="text-muted mb-3">
                The address will be visible to patients or users
                searching for healthcare providers (doctors) or facilities.
            </div>

            <div className="form-group">
                <label data-required="1">Address Street 1</label>
                <input type="text"
                    name="addressStreet2"
                    onInput={(e) => {
                        contextValues.handleFormValues({
                            addressStreet1: e.target.value
                        })
                    }}
                    className="form-control"
                    defaultValue={contextValues.setDefaultValueForFields("addressStreet1")}
                    placeholder="Address Street 1" />
                {
                    contextValues.validationErrors.length > 0 ?
                        contextValues.displayValidationError("addressStreet1") :
                        null
                }
            </div>

            <div className="form-group">
                <label>Address Street 2</label>
                <input type="text"
                    name="addressStreet2"
                    onInput={(e) => {
                        contextValues.handleFormValues({
                            addressStreet2: uiUtils.setFirstLetterUpperCase(e.target.value)
                        })
                    }}
                    className="form-control"
                    defaultValue={contextValues.setDefaultValueForFields("addressStreet2")}
                    placeholder="Address Street 2" />
            </div>

            <div className="row mt-2">
                <div className="col">
                    <label htmlFor="city" data-required="1">City </label>
                    <input type="text"
                        onInput={(e) => {
                            contextValues.handleFormValues({
                                city: uiUtils.setFirstLetterUpperCase(e.target.value)
                            })
                        }}
                        defaultValue={contextValues.setDefaultValueForFields("city")}
                        name="city"
                        className="form-control"
                        placeholder="City" />
                    {
                        contextValues.validationErrors.length > 0 ?
                            contextValues.displayValidationError("city") :
                            null
                    }
                </div>
                <div className="col">
                    <label htmlFor="address-state" data-required="1">State </label>
                    <input type="text" name="state"
                        onInput={(e) => {
                            contextValues.handleFormValues({
                                state: uiUtils.setFirstLetterUpperCase(e.target.value)
                            })
                        }}
                        defaultValue={contextValues.setDefaultValueForFields("state")}
                        id="address-state"
                        className="form-control"
                        placeholder="State" />
                    {
                        contextValues.validationErrors.length > 0 ?
                            contextValues.displayValidationError("state") :
                            null
                    }
                </div>
            </div>
            <div className="row mt-2">
                <div className="col">
                    <label htmlFor="address-zip-code" data-required="1">Zip Code </label>
                    <input type="text" name="zipCode"
                        onInput={(e) => {
                            contextValues.handleFormValues({
                                zipCode: e.target.value
                            })
                        }}
                        defaultValue={contextValues.setDefaultValueForFields("zipCode")}
                        className="form-control"
                        placeholder="Zip/Postal code"
                        data-required="1" />
                    {
                        contextValues.validationErrors.length > 0 ?
                            contextValues.displayValidationError("zipCode") :
                            null
                    }
                </div>

                <div className="col">
                    <label htmlFor="address-country" data-required="1">Country </label>
                    <select name="country"
                        onChange={(e) => {
                            contextValues.handleFormValues({
                                country: countries.find(_c => _c._id === e.target.value)
                            });
                        }}
                        defaultValue={contextValues.setDefaultValueForFields("country") !== null ? contextValues.setDefaultValueForFields("country")._id : null}
                        className="form-control"
                        placeholder="country">
                        <option value=""></option>
                        {
                            countries.map((c, indx) => {
                                return <option key={indx} value={c._id}>{c.name}</option>
                            })
                        }
                    </select>
                    {
                        contextValues.validationErrors.length > 0 ?
                            contextValues.displayValidationError("country") :
                            null
                    }
                </div>
            </div>

            <div className="d-flex flex-row justify-content-between mt-4">
                <div className="btn btn-primary pointer"
                    onClick={() => { contextValues.handleTabClick("general","address") }}>
                    <i className="mr-2 fas fa-arrow-left"></i>
                    <span>Previous</span>
                </div>
                <div className="btn btn-primary pointer"
                    onClick={() => { contextValues.handleTabClick("contacts","address") }}>
                    <i className="mr-2 fas fa-arrow-right"></i>
                    <span>Next</span>
                </div>
            </div>

           


        </div>
    )
}
