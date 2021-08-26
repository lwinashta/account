import React, { useEffect, useState, useContext, useRef } from "react";
const moment = require('moment')
import { v4 as uuidv4 } from 'uuid';

import { form } from "form-module/form";
import { Modal } from "core/components/modal/web/modal";
import { SearchableMultiselectField } from "core/components/fields/web/multiselect/searchableMultiselectField";

import { AppContext } from "../../AppContext";
const degrees = require("@oi/utilities/lists/medical-degrees.json").map(d=>Object.assign(d,{name:`${d.name} (${d.abbr})`}));

const _iForm = new form();
_iForm.formConfig = require('account-manager-module/lib/user/qualification/medicalDegree/form/config.json');

const sd=moment().subtract(110,'years').year();
const years=Array.from(new Array(110)).map((x,i)=>{return sd+i});

export const MedicalDegreeForm = ({
    onCloseHandler=function(){},
    medicalDegreeToUpdate=null
}) => {

    let AppLevelContext = useContext(AppContext);

    let formValues = useRef(medicalDegreeToUpdate!==null?
        Object.assign(_iForm.getInitialFormObject(),medicalDegreeToUpdate) : _iForm.getInitialFormObject());

    const [validationError, setValidationError] = useState([]);

    const setDefaultValueForFields = (fieldName) => {
        return (medicalDegreeToUpdate!==null 
            && (fieldName in medicalDegreeToUpdate)) ?
            medicalDegreeToUpdate[fieldName] : null
    }

    const handleFormValues = (params) => {
        formValues.current = Object.assign(formValues.current, params);
    }
  
    const handleDegreeSelection=(selectedItem)=>{
        //console.log(selectedItem);
        formValues.current.degrees=selectedItem;
    }

    const handleMedicalDegreeSubmission = async (e) => {
        try {

            e.preventDefault();

            //validation check 
            let _d = _iForm.validateForm(formValues.current);
            //console.log(formValues.current,_d);
            setValidationError(_d);

            if (_d.length > 0) {
                alert("Please enter required information.");

            } else {
                //Insert necessary values in the data 
                let data={
                    _id:AppLevelContext.userInfo._id
                };
                if(medicalDegreeToUpdate===null){
                    formValues.current.uuid=uuidv4();
                    data["$push"]={
                        medicalDegrees:formValues.current
                    }

                }else if(medicalDegreeToUpdate!==null){
                    data.query={
                        "medicalDegrees.uuid":medicalDegreeToUpdate.uuid
                    }
                    data["medicalDegrees.$"]=formValues.current;
                }
                
                let updatedUserInfo = await fetch("/account/api/user/profile/update", {
                    method: "POST",
                    body: JSON.stringify(data),
                    headers: {
                        "content-type": "application/json"
                    }
                });

                let updateUserInfoJson=await updatedUserInfo.json();

                //reset user info
                //let resetUserInfo = await AppLevelContext.resetUserInformation();

                AppLevelContext.updateUserContextInfo(updateUserInfoJson);

                AppLevelContext.setPopup({
                    show:true,
                    message:medicalDegreeToUpdate===null?"Medical Degree added":"Medical Degree updated",
                    messageType:"success"
                });

                onCloseHandler(false);
                
            }

        } catch (error) {
            console.log(error);

        }
    }

    /** Render */
    return (<Modal
            header={<h3>Medical Degree Entry</h3>}
            onCloseHandler={() => { onCloseHandler(false) }}>
        <form onSubmit={(e) => { handleMedicalDegreeSubmission(e) }}>
            <div className="form-group">
                <label data-required="1">Medical Degree</label>
                <div>
                    <SearchableMultiselectField  
                        handleOnItemSelection={handleDegreeSelection}
                        selections={
                            ("medicalDegrees" in AppLevelContext.userInfo) 
                                && AppLevelContext.userInfo.medicalDegrees.length>0?
                                degrees.reduce((acc,ci)=>{
                                    //exclude items from data which are already added to profile
                                    if(AppLevelContext.userInfo.medicalDegrees.find(s=>s.degrees._id===ci._id)===undefined){
                                        acc.push(ci);
                                    }
                                    return acc;
                                },[]):
                            degrees
                        }
                        dataToUpdate={medicalDegreeToUpdate!==null 
                            && ('degrees' in medicalDegreeToUpdate) 
                            && medicalDegreeToUpdate.degrees.length>0? 
                                medicalDegreeToUpdate.degrees:null
                        }
                        numberOfDefaultItems={degrees.length}/>
                </div>
                {validationError.length > 0 ?
                    _iForm.displayValidationError("degrees") : null
                }
            </div>

            <div className="form-group">
                <label data-required="1">Educational Institute/ University </label>
                <input type="text"
                    name="educationalInstitute"
                    onInput={(e) => {
                        handleFormValues({
                            educationalInstitute: e.target.value
                        })
                    }}
                    className="form-control"
                    data-required="1"
                    defaultValue={setDefaultValueForFields("educationalInstitute")}
                    placeholder="Educational Institute/ University" />
                {validationError.length > 0 ?
                    _iForm.displayValidationError("educationalInstitute") : null
                }
            </div>

            <div className="form-group d-flex flex-row" style={{justifyContent:"space-evenly"}}>
                    <div className="px-2" style={{flexGrow:1}}>
                        <label htmlFor="startYear-medicalDegree" data-required="1">Start Year</label>
                        <select name="startYear"
                            onChange={(e) => {
                                handleFormValues({ startYear: e.target.value });
                            }}
                            defaultValue={setDefaultValueForFields("startYear")}
                            id="startYear-medicalDegree"
                            className="form-control"
                            data-required="1"
                            placeholder="Start Year" >
                            <option value=""></option>
                            {years.map(year => {
                                return <option key={year} value={year}>{year} </option>
                            })}
                        </select>
                        {validationError.length > 0 ?
                            _iForm.displayValidationError("startYear") : null
                        }
                    </div>

                    <div className="px-2" style={{flexGrow:1}}>
                        <label htmlFor="completionYear-medicalDegree" data-required="1">Year of Completion</label>
                        <select name="startYear"
                            onChange={(e) => {
                                handleFormValues({ completionYear: e.target.value });
                            }}
                            defaultValue={setDefaultValueForFields("completionYear")}
                            id="completionYear-medicalDegree"
                            className="form-control"
                            data-required="1"
                            placeholder="Year of Completion" >
                            <option value=""></option>
                            {years.map(year => {
                                return <option key={year} value={year}>{year} </option>
                            })}
                        </select>
                        {validationError.length > 0 ?
                            _iForm.displayValidationError("completionYear") : null
                        }
                    </div>
                    
                </div>

            <div className="mt-2 text-center">
                <button className="btn btn-primary w-75" type="submit">Save Medical Degree</button>
            </div>

        </form>
    </Modal>
    )
}