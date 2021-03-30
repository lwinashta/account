import React, { useEffect, useState, useContext } from "react";
import { UserInfo } from "../contexts/userInfo";
import { Modal } from "@oi/reactcomponents";
import { formjs, multiSelectDropDown} from "@oi/utilities/__bk__/form";
import * as userFunctions from './../reusable/userInfoFunctions';
import { DisplayItem, DisplayItemAsString } from './methods';

const councils = require("@oi/utilities/lists/medical-councils.json");

const _formjs = new formjs();

export const ManageProviderMedicalCouncil = () => {

    let contextValues = useContext(UserInfo);

    const [userMedicalCouncils, setMedicalCouncil] = useState("medical_councils" in contextValues.userInfo ? contextValues.userInfo.medical_councils : []);
    const [showMedicalCouncilEntryForm, setShowMedicalCouncilEntryFormFlag] = useState(false);

    let formRef = React.createRef();

    /** UseEffect Hooks */

    useEffect(() => {
        if (showMedicalCouncilEntryForm) {
            let _multiSelectDropDown = new multiSelectDropDown({
                container: $(formRef.current),
                data: councils,
                initialDataset: councils,
                onItemSearch: function (val) {
                    let rgEx = new RegExp(val, 'i');
                    return degrees.filter(ds => rgEx.test(ds.name));
                },
                displaySearchResults: function (items) {
                    return items.map((item, indx) => {
                        return `<div class="p-2 border-bottom pointer text-capitalize item" _id="${item._id}">${item.name}</div>`
                    });
                },
                onItemSelect: function (item) {
                    return DisplayItemAsString(`${item.name}`, item._id);
                }
            });
            _multiSelectDropDown.bind();

            let layout = userMedicalCouncils.map((council, indx) => {
                let councilInfo = councils.filter(s => s._id === council)[0];
                return DisplayItemAsString(councilInfo.name, councilInfo._id);
            })

            $(formRef.current).find('.selected-items').append(layout)

        }
    }, [showMedicalCouncilEntryForm]);

    /******************** */
    /** Event Handlers */

    const handleMedicalCouncilSubmission = (e) => {
        e.preventDefault();

        let form = e.target;

        let validate = _formjs.validateForm(form);

        if (validate === 0) {
            popup.onScreen("Updating...");
            let selectedMedicalCouncils = [];

            $(form).find('[name="medical_councils"]').find('.selected-items').find('.item').each(function () {
                selectedMedicalCouncils.push($(this).attr('_id'));
            });

            userFunctions.submitUserUpdates({
                "medical_councils": selectedMedicalCouncils,
                "_id": contextValues.userInfo._id

            }).then(response => {
                setMedicalCouncil(selectedMedicalCouncils);
                setShowMedicalCouncilEntryFormFlag(false);

                //Update the context
                contextValues.updateUserInfoContext({
                    medical_councils: selectedMedicalCouncils
                });

                popup.remove();
                popup.onBottomCenterSuccessMessage("Medical Council Updated");

            }).catch(err => {
                console.log(err);
                popup.onBottomCenterErrorOccured("Error while updating the info. Try again.");
            });
        } else {
            popup.onBottomCenterRequiredErrorMsg();
        }
    }

    /** Render */
    return (<div className="border-bottom pt-2 pb-3 position-relative">
        <div className="font-weight-bold" data-required="1">Medical Councils</div>
        {
            userMedicalCouncils.length === 0 ?
                <div>
                    <div className="small mb-1 mt-1 btn-link pointer" onClick={() => { setShowMedicalCouncilEntryFormFlag(true) }}>Add Medical Council</div>
                </div> :
                <div>
                    {
                        'qualification_verification_status' in contextValues.userInfo &&
                        contextValues.userInfo.qualification_verification_status.length > 0 && 
                        contextValues.userInfo.qualification_verification_status === "pending" ?
                            <div className="push-right">
                                <div className="small pointer btn-link" onClick={() => { setShowMedicalCouncilEntryFormFlag(true) }}>Edit</div>
                            </div> : null
                    }
                    <div className="d-flex flex-wrap">
                        {
                            userMedicalCouncils.map((council, indx) => {
                                let councilInfo = councils.filter(d => d._id === council)[0];
                                return <DisplayItem key={indx} item={councilInfo.name} />
                            })
                        }
                    </div>
                </div>
        }
        {
            showMedicalCouncilEntryForm ?
                <Modal header={<h3>Medical Council Entry</h3>} onCloseHandler={() => { setShowMedicalCouncilEntryFormFlag(false) }}>
                    <form ref={formRef} onSubmit={(e) => { handleMedicalCouncilSubmission(e) }}>
                        <div className="form-group">
                            <label data-required="1">Medical Councils</label>
                            <div name="medical_councils"
                                className="multi-select-container hide-off-focus-outer-container entry-field"
                                data-required="1"
                                placeholder="Medical Council">
                                <div className="selected-items mb-2 d-flex flex-wrap"> </div>
                                <div className="position-relative search-outer-container">
                                    <input type="text" className="form-control search-box" placeholder="Search Medical Council" />
                                    <div className="search-results-container hide-off-focus-inner-container"></div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-2 text-center">
                            <button className="btn btn-primary w-75" type="submit">Save Medical Council</button>
                        </div>
                    </form>
                </Modal> : null
        }
    </div>

    )
}