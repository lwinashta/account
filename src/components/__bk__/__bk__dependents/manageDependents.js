import React, { useEffect, useState, useContext } from 'react';
import { formjs, insertValues } from "@oi/utilities/__bk__/form";
import { UserInfo } from "../../contexts/userInfo";
import { Modal } from "@oi/reactcomponents";
const relations = require('@oi/utilities/lists/relationships.json');
import moment from 'moment';

let _formjs = new formjs();
let _insertValues=new insertValues();

export const Dependents = () => {

    let params = useContext(UserInfo);
    
    const formRef = React.createRef();

    const [loader, setLoader] = useState(true);
    const [userDependents, setUserDependents] = useState([]);
    const [showDependentEntryForm, setDependentEntryFormFlag] = useState(false);
    const [editDependentId,setEditDependentId]=useState("");

    const getUserDependents = () => {
        return $.getJSON('/account/api/user/getdependents', {
            'user_mongo_id.$_id': params.userInfo._id,
            'deleted.$boolean': false
        });
    }

    useEffect(() => {
        //Get user dependents
        Promise.all([getUserDependents()]).then(values => {
            setUserDependents(values[0]);
            setLoader(false);
        });
    }, []);

    useEffect(() => {
        //Get user dependents
        if(showDependentEntryForm && editDependentId.length>0){
            let dependentInfo=userDependents.filter(d=>d._id===editDependentId)[0];
            _insertValues.container=$(formRef.current);
            _insertValues.insert(dependentInfo);
        }

        if(!showDependentEntryForm){
            setEditDependentId(""); 
        }

    }, [showDependentEntryForm,editDependentId]);

    const checkIfDuplicate = function (firstName, lastName, relation) {
        if (userDependents.findIndex(d => d.first_name === firstName && d.last_name === lastName && d.relation === relation) > -1 && mode === "create") {
            return true;
        }
        return false;
    }

    const addNewDependentState=(data)=>{
        setUserDependents(userDependents.concat([data]))
    }

    const updateUserDependentState=(data)=>{
        let dependents=[...userDependents];
        let indx=dependents.findIndex(d=>d._id==data._id);

        dependents[indx]=data;

        setUserDependents(dependents);
    }

    const handleEntrySubmission = function (e) {

        //get the related form 
        e.preventDefault();
        popup.onScreen('Saving...');

        let fd = {};

        let form = e.target;

        //check required field 
        let validation = _formjs.validateForm(form);

        if (validation === 0) {

            let mode=editDependentId.length>0?"update":"create";

            $(form).find('input.entry-field,select.entry-field').each(function () {
                fd = Object.assign(fd, _formjs.getFieldData(this));
            });

            if (checkIfDuplicate(fd.first_name, fd.last_name, fd.relation)) {
                //the dependent exists 
                $(form).find('.duplicate-erro-msg').remove();
                $(form).prepend(`<div class="p-2 mb-2 small rounded text-white bg-danger duplicate-erro-msg text-center">Dependent already exists.</div>`);

            } else {
                let uri = "";

                //-- Check if dependentInfo exists --
                if (mode==="update") {
                    //Update Mode
                    uri = "updatedependent";
                    fd._id = editDependentId;

                } else {
                    //Create Mode
                    fd["user_mongo_id.$_id"] = params.userInfo._id;
                    fd["deleted.$boolean"] = false;
                    uri = "createdependent";
                }

                let data = _formjs.convertJsonToFormdataObject(fd);

                $.ajax({
                    "url": '/account/api/user/' + uri,
                    "processData": false,
                    "contentType": false,
                    "data": data,
                    "method": "POST"
                }).then(response => {
                    //console.log(response);
                    if (mode === "create") {
                        addNewDependentState(response.ops[0]);
                    }else{
                        updateUserDependentState(fd);
                    }
                    popup.remove();
                    popup.onBottomCenterSuccessMessage("Dependent updated");
                    setDependentEntryFormFlag(false);
                    
                }).catch(err=>{
                    popup.onBottomCenterErrorOccured("Error in saving info. Please try again");
                });
            }

        } else {
            popup.remove();
            popup.onBottomCenterRequiredErrorMsg();
        }

    };

    const handleEditDependent=(_id)=>{
        setEditDependentId(_id);
        setDependentEntryFormFlag(true);
    }

    const handleDeleteInsurance = (_id) => {

        popup.messageBox({
            message: `<p>Are you sure to delete the Dependent?</p>`,
            buttons: [{
                "label": "Yes",
                "class": "btn-danger",
                "id": "yes-button",
                "callback": function () {
                    popup.onScreen("Deleting...");

                    $.ajax({
                        "url": '/account/api/user/updatedependent',
                        "data": JSON.stringify({
                            "_id":_id,
                            "deleted.$boolean":true
                        }),
                        "processData": false,
                        "contentType": "application/json; charset=utf-8",
                        "method": "POST"
                    }).then(response=>{
                        popup.remove();
                        popup.onBottomCenterSuccessMessage("Dependent Deleted");

                        let dependents=[...userDependents];
                        let indx=dependents.findIndex(dependent=>dependent._id===_id);
                        
                        let removedDependent=dependents.splice(indx,1);

                        setUserDependents(dependents);
                        
                    }).catch(err=>{
                        console.log(err);
                        popup.onBottomCenterErrorOccured("Error while deleting. try again.");
                    });

                }
            },
            {
                "label": "No",
                "class": "btn-link",
                "id": "no-button",
                "callback": function () {
                    popup.remove(); //remove the confirmation pop up 
                }
            }
            ]
        });

    }

    return (
        <div>
            {
                loader ?
                    <div className="mt-2 p-2 text-center">
                        <img src="/efs/core/images/core/loading.gif" style={{ width: "40px" }}></img>
                    </div> :
                    <div>
                        {
                            userDependents.length > 0 ?
                                userDependents.map((dependent) => {
                                    return <div key={dependent._id} className="border-bottom pt-1 pb-1 position-relative">
                                        <div>{dependent.first_name} {dependent.last_name} <span className="text-success">({dependent.relation})</span></div>
                                        <div className="text-muted small d-flex">
                                            <div>{moment(dependent.date_of_birth).format('DD MMM YYYY')}</div>
                                        </div>
                                        <div className="push-right d-flex small">
                                            <div className="btn-link pointer" onClick={()=>{handleEditDependent(dependent._id)}}>Edit</div>
                                            <div className="btn-link ml-2 text-danger pointer" onClick={()=>{handleDeleteInsurance(dependent._id)}}>Delete</div>
                                        </div>
                                    </div>
                                }) :
                                <div className="p-1 small text-muted">
                                    No dependent information found. Click on add new insurance button below to add dependent to your profile.
                                    Adding dependent to you account helps booking appintments fr yoru dependent or keep track of thier health information.
                                </div>
                        }
                        <div className="pt-2">
                            <div className="small btn-link pointer" onClick={() => { setDependentEntryFormFlag(true) }}>Add New Dependent</div>
                        </div>
                    </div>
            }
            {
                showDependentEntryForm ?
                    <Modal header={<h3>Dependent Entry</h3>}
                        onCloseHandler={() => { setDependentEntryFormFlag(false) }}>
                        <form ref={formRef} onSubmit={(e) => { handleEntrySubmission(e) }} >
                            <div className="form-group">
                                <label data-required="1">First Name</label>
                                <input className="form-control entry-field" type="text" name="first_name" placeholder="First Name" data-required="1" />
                            </div>
                            <div className="form-group">
                                <label data-required="1">Last Name</label>
                                <input className="form-control entry-field" type="text" name="last_name" placeholder="Last Name" data-required="1" />
                            </div>
                            <div className="form-group">
                                <label data-required="1">Date of Birth</label>
                                <input className="form-control entry-field" type="date" name="date_of_birth" placeholder="Date of Birth" data-required="1" />
                            </div>
                            <div className="form-group">
                                <label>Email <i className="small text-muted">(optional)</i></label>
                                <input className="form-control entry-field" type="email" name="email" placeholder="Email" />
                            </div>
                            <div className="form-group">
                                <label data-required="1">Gender</label>
                                <select className="form-control entry-field" name="gender" data-required="1" placeholder="Gender">
                                    <option value=""></option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label data-required="1">Are you parent or legal guardian of this patient</label>
                                <select data-required="1" className="form-control entry-field" name="legal_guardian" placeholder="Legal Guardian">
                                    <option value=""></option>
                                    <option value="yes">Yes</option>
                                    <option value="no">No</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label data-required="1">Relationship with patient</label>
                                <select data-required="1" className="form-control entry-field" name="relation" placeholder="Relation">
                                    <option value=""></option>
                                    {
                                        relations.map((r, indx) => {
                                            return <option key={indx} value={r}>{r}</option>
                                        })
                                    }
                                </select>
                            </div>
                            <div className="text-center">
                                <button className="btn btn-primary w-75">Save</button>
                            </div>
                        </form>

                    </Modal> : null
            }
        </div>
    );

}