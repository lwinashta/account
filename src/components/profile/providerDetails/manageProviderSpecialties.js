import React, { useEffect, useState, useContext } from "react";
import { UserInfo } from "../contexts/userInfo";
import { Modal } from "@oi/reactcomponents";
import { formjs, multiSelectDropDown} from "@oi/utilities/__bk__/form";
import * as userFunctions from './../reusable/userInfoFunctions';
import { DisplayItem, DisplayItemAsString } from './methods';

const _formjs = new formjs();

export const ManageProviderSpecialties = () => {

    let contextValues = useContext(UserInfo);

    const [userSpecialties, setSpecialties] = useState([]);
    const [showSpecialtyEntryForm, setShowSpecialtyEntryFormFlag] = useState(false);
    const [specialties, setSpecialtiesList] = useState([]);

    let formRef = React.createRef();

    /** UseEffect Hooks */
    useEffect(() => {
        $.getJSON('/healthcare/api/specialties/getall').then(response => {
            //console.log(response)
            setSpecialtiesList(response);

            //set all states 
            setSpecialties("specialties" in contextValues.userInfo ? contextValues.userInfo.specialties : []);

        });
    }, []);

    useEffect(() => {
        if (showSpecialtyEntryForm) {
            let _multiSelectDropDown = new multiSelectDropDown({
                container: $(formRef.current),
                data: specialties,
                initialDataset: specialties,
                onItemSearch: function (val) {
                    let rgEx = new RegExp(val, 'i');
                    return specialties.filter(ds => rgEx.test(ds.name));
                },
                displaySearchResults: function (items) {
                    console.log(items);
                    return items.map((item, indx) => {
                        return `<div class="p-2 border-bottom pointer text-capitalize item" _id="${item._id}">${item.name}</div>`
                    });
                },
                onItemSelect: function (item) {
                    return DisplayItemAsString(item.name, item._id);
                }
            });
            _multiSelectDropDown.bind();

            let layout = userSpecialties.map((specialty, indx) => {
                let specialtyinfo = specialties.filter(s => s._id === specialty)[0];
                return DisplayItemAsString(specialtyinfo.name, specialtyinfo._id);
            })

            $(formRef.current).find('.selected-items').append(layout)

        }
    }, [showSpecialtyEntryForm]);

    /******************** */
    /** Event Handlers */
    const handleSpecialtySubmission = (e) => {
        e.preventDefault();

        let form = e.target;

        let validate = _formjs.validateForm(form);

        if (validate === 0) {
            popup.onScreen("Updating...");
            let selectedSpecialties = [];

            $(form).find('[name="specialties"]').find('.selected-items').find('.item').each(function () {
                selectedSpecialties.push($(this).attr('_id'));
            });

            userFunctions.submitUserUpdates({
                "specialties": selectedSpecialties,
                "_id": contextValues.userInfo._id

            }).then(response => {
                setSpecialties(selectedSpecialties);
                setShowSpecialtyEntryFormFlag(false);

                //Update the context
                contextValues.updateUserInfoContext({
                    specialties: selectedSpecialties
                });

                popup.remove();
                popup.onBottomCenterSuccessMessage("Specialty Updated");

            }).catch(err => {
                console.log(err);
                popup.onBottomCenterErrorOccured("Error while updating the info. Try again.");
            })
        } else {
            popup.onBottomCenterRequiredErrorMsg();
        }
    }

    /** Render */
    return (<div className="border-bottom pb-3 pt-2 position-relative">

        <div className="font-weight-bold" data-required="1">Specialty</div>
        {
            userSpecialties.length === 0 ?
                <div>
                    <div className="small mb-1 mt-1 btn-link pointer" onClick={() => setShowSpecialtyEntryFormFlag(true)}>Add Specialties</div>
                </div> :
                <div>
                    {
                        'qualification_verification_status' in contextValues.userInfo &&
                            contextValues.userInfo.qualification_verification_status.length > 0 && 
                            contextValues.userInfo.qualification_verification_status === "pending" ?
                            <div className="push-right">
                                <div className="small btn-link pointer" onClick={() => setShowSpecialtyEntryFormFlag(true)}>Edit</div>
                            </div> : null
                    }
                    <div className="d-flex flex-wrap">
                        {
                            userSpecialties.map((specialty, indx) => {
                                return <DisplayItem key={indx} item={specialties.filter(s => s._id === specialty)[0].name} />
                            })
                        }
                    </div>

                </div>
        }

        {
            showSpecialtyEntryForm ?
                <Modal header={<h3>Speacilty Entry</h3>} onCloseHandler={() => { setShowSpecialtyEntryFormFlag(false) }}>
                    <form ref={formRef} onSubmit={(e) => { handleSpecialtySubmission(e) }}>
                        <div className="form-group">
                            <label data-required="1">Specialty</label>
                            <p className="text-muted small">Search and add multiple specialties </p>
                            <div name="specialties"
                                className="multi-select-container hide-off-focus-outer-container entry-field"
                                data-required="1"
                                placeholder="Specialties">
                                <div className="selected-items mb-2 d-flex flex-wrap"> </div>
                                <div className="position-relative search-outer-container">
                                    <input type="text" className="form-control search-box" placeholder="Search Specialties" />
                                    <div className="search-results-container hide-off-focus-inner-container"></div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-2 text-center">
                            <button className="btn btn-primary w-75" type="submit">Save Specialty</button>
                        </div>
                    </form>
                </Modal> : null
        }

    </div>)
}