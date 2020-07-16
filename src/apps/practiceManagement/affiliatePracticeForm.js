import React, { useState, useEffect,useContext } from "react";
import { UserInfo } from "../../contexts/userInfo";
import { DisplayPracticeAddress } from "./displayComponents";
import { ShowAvailability } from "./showAvailability";
import { AvailabilityEntry } from "./availabilityEntry";
import { DisplayFacilityInfo} from "./displayFacilityInfo";
import { saveNewPracticeUser } from "./methods";
import { Modal } from "@oi/reactcomponents";

export const AffliatePracticeForm = ({ afterSubmission = {}, handleAddNewPracticeEntry = {} }) => {

    let params=useContext(UserInfo);

    const [searchPracticeLoader, setSearchPracticeLoader] = useState(false);
    const [initState, setInitStateFlag] = useState(true);
    const [searchPracticeResults, setPracticeResults] = useState([]);

    const [showEntryForm, setEntryFormFlag] = useState(false);

    const [availability, setAvailability] = useState([]);
    const [showAvialabilityEntryForm, setShowAvialabilityEntryFormFlag] = useState(false);
    const [editAvailabilityId, setEditAvailabilityId] = useState("");

    const [selectedSearchedPracticeInfo, setSelectedSearchedPracticeInfo] = useState("");

    useEffect(() => {
        if (!showAvialabilityEntryForm) {
            setEditAvailabilityId("");
        }
    }, [showAvialabilityEntryForm]);

    const searchPractice = (searchTxt) => {
        let query = {
            "$or": [
                { medical_facility_name: { $regex: searchTxt, $options: "i" } },
                { medical_facility_street_address_1: { $regex: searchTxt, $options: "i" } },
                { medical_facility_city: { $regex: searchTxt, $options: "i" } },
                { medical_facility_state: { $regex: searchTxt, $options: "i" } },
                { medical_facility_zip_code: { $regex: searchTxt, $options: "i" } }
            ]
        }
        return $.getJSON('/account/api/heathcarefacility/get', query);
    }

    const handleOnSearchItemSelection = (_id) => {
        setSelectedSearchedPracticeInfo(searchPracticeResults.filter(f => f._id === _id)[0]);
        setEntryFormFlag(true);
    }

    const checkIfUserIsAffiliated=(info)=>{
        return params.userPractices.findIndex(f=>f.facilityInfo[0]._id===info._id);
    }   

    const handleSearchOnSubmission = (e) => {
        setSearchPracticeLoader(true);

        e.preventDefault();
        let form = e.target;

        searchPractice($(form).find('input[type="text"]').val()).then(response => {
            console.log(response);

            let notAffiliatedPractices=response.reduce((acc,ci)=>{
                if(checkIfUserIsAffiliated(ci)===-1){
                    acc.push(ci);
                }
                return acc;
            },[]);

            setPracticeResults(notAffiliatedPractices);
            setSearchPracticeLoader(false);
            setInitStateFlag(false);
        });
    }

    const handleAvailabilityEntrySubmission = (values) => {
        let userAvailability = [...availability];

        if (editAvailabilityId.length > 0) {
            let indx = userAvailability.findIndex(a => a._id === editAvailabilityId);
            userAvailability[indx] = values;
        } else {
            userAvailability.push(values);
        }

        setAvailability(userAvailability);
        setShowAvialabilityEntryFormFlag(false);

    }

    const handleEditAvailability = (_id) => {
        setEditAvailabilityId(_id);
        setShowAvialabilityEntryFormFlag(true);
    }

    const handlePracticeSubmission=(e)=>{
        e.preventDefault();
        let form=e.target;

        popup.onScreen("Saving Information...");

        let validate = 0;

        if (availability.length === 0) {
            $(form).find('#availability-container').append('<div class="required-err">Please enter availability</div>');
            validate++;
        }

        if (validate === 0) {

            //Save New Practice User
            saveNewPracticeUser(params.userInfo._id, selectedSearchedPracticeInfo._id, availability, "affiliated").then(facilityUserResponse=>{
                let facilityUserId = facilityUserResponse.insertedId;

                return $.getJSON('account/api/heathcarefacilityuser/get', {
                    "_id": facilityUserId
                });

            }).then(response=>{
                afterSubmission(response);//Triggers the aftersubmission callback from parent componenet
                popup.remove();

            }).catch(err=>{
                popup.remove();
                console.error(err);
                popup.onBottomCenterErrorOccured();
            });

        } else {
            popup.remove();
            popup.onBottomCenterRequiredErrorMsg();
        }
    }

    return (
        <div>

            {
                showEntryForm ?
                    <form className="p-2" onSubmit={(e)=>{handlePracticeSubmission(e)}}>
                        <DisplayFacilityInfo facilityInfo={selectedSearchedPracticeInfo}/>   
                        <hr />
                        <div>
                            <div className="form-group" id="availability-container">
                                <div>
                                    <label data-required="1" className="h5 font-weight-bold text-capitalize">Your Availability At Above Location </label>
                                    <div className="text-muted small">
                                        The availability information will be visible to all users or patients
                                        viewing your profile. System will determine the next available
                                        appointments per the availability provided here.
                                    <br />
                                    </div>
                                </div>

                                <div className="mt-2">
                                    <div className="small">
                                        {
                                            availability.length > 0 ? <div>
                                                {availability.map((av, indx) => {
                                                    return <div key={av._id} className="border-bottom p-2 position-relative">
                                                        <ShowAvailability
                                                            availability={av}
                                                            showEachForEntry={true} />
                                                        <div className="push-right d-flex">
                                                            <div className="btn-link pointer" onClick={() => { handleEditAvailability(av._id) }}>Edit</div>
                                                            <div className="btn-link ml-2 text-danger pointer">Delete</div>
                                                        </div>
                                                    </div>
                                                })}
                                            </div> : null
                                        }
                                    </div>

                                    <div className="mt-2">
                                        <div className="small btn-link pointer" onClick={() => { setShowAvialabilityEntryFormFlag(true) }}>Add Availability</div>
                                    </div>

                                </div>

                            </div>
                        </div>
                        <div className="mt-3 text-center pt-2">
                            <button className="btn btn-primary w-75" type="submit">Save Information</button>
                        </div>
                    </form> :
                    <div>
                        <div className="text-center">
                            <form onSubmit={(e) => {
                                handleSearchOnSubmission(e)
                            }}>
                                <div className="form-group mt-3">
                                    <input className="form-control w-50" type="text" placeholder="Search Practice"></input>
                                </div>
                            </form>
                        </div>

                        {
                            searchPracticeLoader ?
                                <div className="mt-2 p-2 text-center">
                                    <img src="/efs/core/images/core/loading.gif" style={{ width: "40px" }}></img>
                                </div> :
                                <div>
                                    { searchPracticeResults.length > 0 ?
                                        <div>
                                            {
                                                searchPracticeResults.map(f => {
                                                    return <div key={f._id}
                                                        className="text-primary-on-hover border-bottom pt-2 pb-2 pointer"
                                                        onClick={() => { handleOnSearchItemSelection(f._id) }}>
                                                        <div>{f.medical_facility_name}</div>
                                                        <div className="small text-muted">
                                                            <DisplayPracticeAddress address={f} />
                                                        </div>
                                                    </div>
                                                })
                                            }
                                        </div> :
                                        <div className="mt-2 p-2 text-muted">
                                            {
                                                initState ?
                                                    <div>
                                                        <div className="small">
                                                            Search practice by typing practice name or city or state or zipcode. Hit Enter to search.
                                                        </div>
                                                    </div> :
                                                    <div>
                                                        <h5>Sorry, No results found </h5>
                                                        <div className="small" onClick={() => { handleAddNewPracticeEntry() }}>
                                                            <div className="pointer btn-link">Click to Add New Practice</div>
                                                        </div>
                                                    </div>
                                            }

                                        </div>
                                    }
                                </div>
                        }
                    </div>
            }

            {
                showAvialabilityEntryForm ?
                    <Modal header={<h3>Availability Entry</h3>}
                        onCloseHandler={() => { setShowAvialabilityEntryFormFlag(false) }}>
                        <AvailabilityEntry
                            _editAvailabilityId={editAvailabilityId}
                            _editAvailabilityInfo={editAvailabilityId.length > 0 ? availability.filter(v => v._id === editAvailabilityId)[0] : {}}
                            _indx={availability.length}
                            afterSubmission={handleAvailabilityEntrySubmission} />
                    </Modal> : null
            }
        </div>
    )
}