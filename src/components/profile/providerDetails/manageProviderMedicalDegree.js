import React, { useEffect, useState, useContext } from "react";
import { UserInfo } from "../contexts/userInfo";
import { Modal} from "@oi/reactcomponents";
import { formjs, multiSelectDropDown} from "@oi/utilities/__bk__/form";
import * as userFunctions from './../reusable/userInfoFunctions';
import { DisplayItem, DisplayItemAsString } from './methods';

const degrees = require("@oi/utilities/lists/medical-degrees.json");

const _formjs = new formjs();

export const ManageProviderMedicalDegree = () => {

    let contextValues = useContext(UserInfo);

    const [userMedicalDegrees, setMedicalDegrees] = useState("medical_degrees" in contextValues.userInfo ? contextValues.userInfo.medical_degrees : []);
    const [showMedicalDegreeEntryForm, setShowMedicalDegreeEntryFormFlag] = useState(false);

    let formRef = React.createRef();

    /** UseEffect Hooks */

    useEffect(() => {
        if (showMedicalDegreeEntryForm) {
            let _multiSelectDropDown = new multiSelectDropDown({
                container: $(formRef.current),
                data: degrees,
                initialDataset: degrees,
                onItemSearch: function (val) {
                    let rgEx = new RegExp(val, 'i');
                    return degrees.filter(ds => rgEx.test(ds.name) || rgEx.test(ds.abbr));
                },
                displaySearchResults: function (items) {
                    return items.map((item, indx) => {
                        return `<div class="p-2 border-bottom pointer text-capitalize item" _id="${item._id}">${item.name} (${item.abbr})</div>`
                    });
                },
                onItemSelect: function (item) {
                    return DisplayItemAsString(`${item.name} (${item.abbr})`, item._id);
                }
            });

            _multiSelectDropDown.bind();

            let layout = userMedicalDegrees.map((degree, indx) => {
                let degreeInfo = degrees.filter(s => s._id === degree)[0];
                return DisplayItemAsString(degreeInfo.name, degreeInfo._id);
            })

            $(formRef.current).find('.selected-items').append(layout)

        }
    }, [showMedicalDegreeEntryForm]);

    /******************** */
    /** Event Handlers */

    const handleMedicalDegreeSubmission = (e) => {
        e.preventDefault();

        let form = e.target;

        let validate = _formjs.validateForm(form);

        if (validate === 0) {
            
            popup.onScreen("Updating...");
            let selectedMedicalDegrees = [];

            $(form).find('[name="medical_degrees"]').find('.selected-items').find('.item').each(function () {
                selectedMedicalDegrees.push($(this).attr('_id'));
            });

            userFunctions.submitUserUpdates({
                "medical_degrees": selectedMedicalDegrees,
                "_id": contextValues.userInfo._id

            }).then(response => {
                setMedicalDegrees(selectedMedicalDegrees);
                setShowMedicalDegreeEntryFormFlag(false);

                //Update the context
                contextValues.updateUserInfoContext({
                    medical_degrees: selectedMedicalDegrees
                });
                
                popup.remove();
                popup.onBottomCenterSuccessMessage("Medical Degree Updated");

            }).catch(err => {
                console.log(err);
                popup.onBottomCenterErrorOccured("Error while updating the info. Try again.");
            })
        } else {
            popup.onBottomCenterRequiredErrorMsg();
        }
    }

    /** Render */
    return (<div className="border-bottom pt-2 pb-3 position-relative">
        <div className="font-weight-bold" data-required="1">Medical Degrees</div>
        {
            userMedicalDegrees.length === 0 ?
                <div>
                    <div className="small mb-1 mt-1 btn-link pointer" onClick={() => { setShowMedicalDegreeEntryFormFlag(true) }}>Add Medical Degrees</div>
                </div> :
                <div>
                    {
                        'qualification_verification_status' in contextValues.userInfo &&
                        contextValues.userInfo.qualification_verification_status.length > 0 && 
                        contextValues.userInfo.qualification_verification_status === "pending"?
                            <div className="push-right">
                                <div className="small btn-link pointer" onClick={() => { setShowMedicalDegreeEntryFormFlag(true) }}>Edit</div>
                            </div> : null
                    }
                    <div className="d-flex flex-wrap">
                        {
                            userMedicalDegrees.map((degree, indx) => {
                                let degreeInfo = degrees.filter(d => d._id === degree)[0];
                                return <DisplayItem key={indx} item={degreeInfo.name + " (" + degreeInfo.abbr + ") "} />
                            })
                        }
                    </div>
                </div>
        }
        {
            showMedicalDegreeEntryForm ?
                <Modal header={<h3>Medical Degree Entry</h3>} onCloseHandler={() => { setShowMedicalDegreeEntryFormFlag(false) }}>
                    <form ref={formRef} onSubmit={(e) => { handleMedicalDegreeSubmission(e) }}>
                        <div className="form-group">
                            <label data-required="1">Medical Degrees</label>
                            <div name="medical_degrees"
                                className="multi-select-container hide-off-focus-outer-container entry-field"
                                data-required="1"
                                placeholder="Specialties">
                                <div className="selected-items mb-2 d-flex flex-wrap"> </div>
                                <div className="position-relative search-outer-container">
                                    <input type="text" className="form-control search-box" placeholder="Search Medical Degrees" />
                                    <div className="search-results-container hide-off-focus-inner-container"></div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-2 text-center">
                            <button className="btn btn-primary w-75" type="submit">Save Medical Degree</button>
                        </div>
                    </form>
                </Modal> : null
        }
    </div>
    )
}