import React, { useEffect, useState, useContext } from "react";
import { UserInfo } from "../../contexts/userInfo";
import { Modal} from "@oi/reactcomponents";
import { formjs, multiSelectDropDown} from "@oi/utilities/lib/js/form";
import * as userFunctions from './../reusable/userInfoFunctions';
import { DisplayItem, DisplayItemAsString } from './methods';
const languages=require('@oi/utilities/lib/lists/languages.json')

const _formjs = new formjs();

export const ManageLanguages = () => {

    let contextValues = useContext(UserInfo);

    const [userLanguages, setLanguages] = useState("languages" in contextValues.userInfo ? contextValues.userInfo.languages : []);
    const [showLanguagesEntryForm, setShowLanguagesEntryFormFlag] = useState(false);

    let formRef = React.createRef();

    /** UseEffect Hooks */

    useEffect(() => {
        if (showLanguagesEntryForm) {
            let _multiSelectDropDown = new multiSelectDropDown({
                container: $(formRef.current),
                data: languages,
                initialDataset: languages,
                onItemSearch: function (val) {
                    let rgEx = new RegExp(val, 'i');
                    return languages.filter(ds => rgEx.test(ds.name));
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

            let layout = userLanguages.map((degree, indx) => {
                let degreeInfo = languages.filter(s => s._id === degree)[0];
                return DisplayItemAsString(degreeInfo.name, degreeInfo._id);
            })

            $(formRef.current).find('.selected-items').append(layout)

        }
    }, [showLanguagesEntryForm]);

    /******************** */
    /** Event Handlers */

    const handleLanguagesSubmission = (e) => {
        e.preventDefault();

        let form = e.target;

        let validate = _formjs.validateForm(form);

        if (validate === 0) {
            
            popup.onScreen("Updating...");
            let selectedLanguages = [];

            $(form).find('[name="languages"]').find('.selected-items').find('.item').each(function () {
                selectedLanguages.push($(this).attr('_id'));
            });

            userFunctions.submitUserUpdates({
                "languages": selectedLanguages,
                "_id": contextValues.userInfo._id

            }).then(response => {
                setLanguages(selectedLanguages);
                setShowLanguagesEntryFormFlag(false);

                //Update the context
                contextValues.updateUserInfoContext({
                    languages: selectedLanguages
                });
                
                popup.remove();
                popup.onBottomCenterSuccessMessage("Languages Updated");

            }).catch(err => {
                console.log(err);
                popup.onBottomCenterErrorOccured("Error while updating the info. Try again.");
            })
        } else {
            popup.onBottomCenterRequiredErrorMsg();
        }
    }

    /** Render */
    return (<div className="border-bottom position-relative">
        {
            userLanguages.length === 0 ?
                <div>
                    <div className="small mb-1 btn-link pointer" onClick={() => { setShowLanguagesEntryFormFlag(true) }}>Add Languages</div>
                </div> :
                <div>
                    <div className="push-right">
                        <div className="small btn-link pointer" onClick={() => { setShowLanguagesEntryFormFlag(true) }}>Edit</div>
                    </div>
                    <div className="d-flex flex-wrap">
                        {
                            userLanguages.map((lang, indx) => {
                                let langInfo = languages.filter(d => d._id === lang)[0];
                                return <DisplayItem key={indx} item={langInfo.name} />
                            })
                        }
                    </div>
                    <div className="text-muted small">Languages</div>
                </div>
        }
        {
            showLanguagesEntryForm ?
                <Modal header={<h3>Languages Entry</h3>} onCloseHandler={() => { setShowLanguagesEntryFormFlag(false) }}>
                    <form ref={formRef} onSubmit={(e) => { handleLanguagesSubmission(e) }}>
                        <div className="form-group">
                            <label data-required="1">Languages</label>
                            <div name="languages"
                                className="multi-select-container hide-off-focus-outer-container entry-field"
                                data-required="1"
                                placeholder="Specialties">
                                <div className="selected-items mb-2 d-flex flex-wrap"> </div>
                                <div className="position-relative search-outer-container">
                                    <input type="text" className="form-control search-box" placeholder="Search Languages" />
                                    <div className="search-results-container hide-off-focus-inner-container"></div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-2 text-center">
                            <button className="btn btn-primary w-75" type="submit">Save Languages</button>
                        </div>
                    </form>
                </Modal> : null
        }
    </div>
    )
}