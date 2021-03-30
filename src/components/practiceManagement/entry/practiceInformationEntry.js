import React, { useContext, useEffect } from "react";

import { formjs, insertValues, multiSelectDropDown } from "@oi/utilities/lib/js/form";
import { UserInfo } from "../../../contexts/userInfo";

const DisplayItemAsString = (item, _id) => {
    return (`<div _id="${_id}" class="item bg-lgrey text-capitalize border rounded pr-2 pl-2 pt-1 pb-1 mt-1 mr-2">
        <div class="d-inline-block align-middle">${item}</div>
        <div class="d-inline-block btn-link text-danger align-middle remove-item pointer">
            <i class="fas fa-times"></i>
        </div>
    </div>`);
}

export const PracticeInformationEntry = ({ 
    selectedPracticeInfo = {},
    onNextClick=null,
    setEntryData=null,
    onSubmission=null
}) => {

    let practiceInfoRef = React.createRef();
    let contextValues = useContext(UserInfo);

    useEffect(() => {

        //Bind the multiselect field
        let _multiSelectDropDown = new multiSelectDropDown({
            container: $(practiceInfoRef.current).find('[name="medical_facility_type"]'),
            data: contextValues.facilityTypes,
            initialDataset: contextValues.facilityTypes,
            onItemSearch: function (val) {
                let rgEx = new RegExp(val, 'i');
                return contextValues.facilityTypes.filter(ds => rgEx.test(ds.name));
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
        if (Object.keys(selectedPracticeInfo).length > 0) {

            //Assign Values 
            let facilityInfo = selectedPracticeInfo;
            let _insertValues = new insertValues({
                container: $(practiceInfoRef.current),
                fieldCallbacks: {
                    "medical_facility_type": {
                        onselect: function (item) {
                            let type = contextValues.facilityTypes.filter(f => f._id === item)[0];
                            return DisplayItemAsString(type.name, type._id)
                        }
                    }
                }
            });
            _insertValues.insert(facilityInfo);

        }
    }, []);

    //** handlers */
    const getData=()=>{

        try {
            let _formjs=new formjs();
            let form=$(practiceInfoRef.current);
            
            let validate=_formjs.validateForm(form);

            if (validate===0){
                let data={};
                
                $(form).find('.entry-field[name]').each(function () {
                    let fd = _formjs.getFieldData(this);
                    data = Object.assign(data, fd);
                });
    
                return data;

            }else{
                throw new Error("validation error");
            }

        } catch (error) {
            console.log(error);
            if(error==="validation error") popup.onBottomCenterRequiredErrorMsg();
            return null;
        }
    }

    const handleOnNext=()=>{
        
        let data=getData();
        if(data!==null){
            setEntryData(data);
            onNextClick();
        }
        
    }

    const handleOnSubmit=()=>{
        let data=getData();
        console.log(data);
        if(data!==null){
            onSubmission(data);
        }
    }

    return (
        <div ref={practiceInfoRef}>
            <div className="form-group">
                <div className="h5 font-weight-bold text-capitalize">Practice General Information</div>
                <label htmlFor="private-practice-name" data-required="1">Name </label>
                <div className="text-muted small">The facility name will be visible to patients or users searching healthcare providers (doctors) or facilities.</div>
                <input type="text" id="private-practice-name"
                    name="medical_facility_name"
                    className="form-control entry-field  mt-2" data-required="1"
                    placeholder="Name of the establishment"
                    defaultValue={Object.keys(selectedPracticeInfo).length > 0 ? selectedPracticeInfo.medical_facility_name : ""} />
            </div>

            <div className="form-group">
                <label htmlFor="private-practice-type" data-required="1" >Practice Facility Type </label>
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
                    <label htmlFor="private-practice-description">Practice Description/ Services Available
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
            {
                onNextClick !== null ?
                    <div className="mt-2 text-right">
                        <div className="btn-sm btn-info pointer small d-inline-block"
                            onClick={() => { handleOnNext() }}><span>Next</span>
                            <i className="fas fa-chevron-right ml-2"></i></div>
                    </div> :
                onSubmission !== null ?
                        <div className="mt-2 text-center pt-2 border-top">
                            <button className="btn btn-primary w-75" 
                                type="submit" 
                                onClick={()=>{handleOnSubmit()}}>Save Information</button>
                        </div> :
                    null
            }

        </div>
    );
}