import React, { useEffect, useContext, useState } from "react";
import { UserInfo } from "../../contexts/userInfo";
import { Modal,FilePreview } from "@oi/reactcomponents";
import { formjs,insertValues,fileUploadField } from "@oi/utilities/lib/js/form";
const relations = require('@oi/utilities/lib/lists/relationships.json');

const _manageFiles=new fileUploadField();
const _formjs=new formjs();
const _insertValues=new insertValues();

export const Insurance = () => {

    let params = useContext(UserInfo);
    let insuranceFormRef=React.createRef();
    
    const [userInsurances, setUserInsurances] = useState([]);
    const [insuraceFiles,setInsuranceFiles]=useState({});
    const [deletedInsuranceFiles,setDeletedInsuranceFiles]=useState([]);

    const [showInsuranceEntryForm, setInsuranceEntryFormFlag] = useState(false);
    const [insuranceEntryFormFieldsBinded,setInsuranceEntryFormFieldBindFlag]=useState(false);

    const [insuranceProviders, setInsuranceProviders] = useState([]);
    const [loader, setLoader] = useState(true);
    const [policyHolder, setPolicyHolder] = useState("");

    const [editInsuranceInfoId,setEditInsuranceId]=useState("");

    const [showPreviewFilesModal,setShowPreviewFilesModalFlag]=useState(false);
    const [previewFilesArray,setPreviewFilesArray]=useState([]);

    // const getInsuranceProviders = function () {
    //     return $.post('/pokitdot/tradingpartners');
    // }

    const getInsuranceProviders = function () {
        return $.getJSON('/src/insuranceProviders.json');
    }

    const getUserInsurances = (query) => {
        return $.getJSON('/account/api/user/getinsurances', query);
    }

    //Triggered in Mount
    useEffect(() => {
        Promise.all([getUserInsurances({
            'user_mongo_id.$_id': params.userInfo._id,
            'deleted.$boolean': false
        }), getInsuranceProviders()]).then(values => {
            //console.log(values);
            setUserInsurances(values[0]);
            //setInsuranceProviders(values[1].data);
            setInsuranceProviders(values[1]);
            setLoader(false);
        });

    }, []);

    //Triggered when form is open and closed
    useEffect(()=>{
        if(showInsuranceEntryForm && !insuranceEntryFormFieldsBinded){
            _manageFiles.container=$(insuranceFormRef.current).find('.droppable-file-container');
            _manageFiles.multiple=true;
            _manageFiles.name=$(insuranceFormRef.current).find('.droppable-file-container').attr('name');
            _manageFiles.onFileSelectionCallback=function(file,allUploaded){
                setInsuranceFiles(allUploaded);
            };
            _manageFiles.bind();//bind file drg and drop
            setInsuranceEntryFormFieldBindFlag(true);  
        }

        if(showInsuranceEntryForm && editInsuranceInfoId.length>0 && insuranceEntryFormFieldsBinded){
            
            //get insurance information 
            let insuranceInfo=userInsurances.filter(insurance=>insurance._id===editInsuranceInfoId)[0];
            
            //load the data in the form 
            _insertValues.container=$(insuranceFormRef.current);
            _insertValues.insert(insuranceInfo);

            //insert files
            _manageFiles.fileData=insuranceInfo.files;
            _manageFiles.insertFiles();
            _manageFiles.onFileDeletionCallback=function(deletedFile){
                let insurances=[...userInsurances];

                //find the file 
                insurances.forEach(insurance=>{
                    insurance.files.forEach((f,indx)=>{
                        if(f._id===deletedFile._id){
                            let removedFile=insurance.files.splice(indx,1);
                        }
                    })
                });

                setUserInsurances(insurances);
            };
        }

        //clean up 
        if(!showInsuranceEntryForm){
            setEditInsuranceId("");
            setInsuranceFiles({});
            setDeletedInsuranceFiles([]);
            setInsuranceEntryFormFieldBindFlag(false);
        }
    },[showInsuranceEntryForm,editInsuranceInfoId,insuranceEntryFormFieldsBinded]);

    //Triggered when user clicks on file preview 
    useEffect(()=>{
        if(!showPreviewFilesModal){
            setPreviewFilesArray([]);
        }
    },[showPreviewFilesModal])

    const addNewUserInsuranceState=(data,files)=>{
        if(files.length>0){
            data.files=files;
        }
        setUserInsurances(userInsurances.concat([data]));
    }

    const updateUserInsuranceState=(data,files)=>{
        let insurances=[...userInsurances];
        let indx=insurances.findIndex(insurance=>insurance._id===data._id);

        data.files=insurances[indx].files.concat(files);
        
        insurances[indx]=data;

        setUserInsurances(insurances);
    }

    //Insert new or update insurance information
    const submitInsuranceFields=(data)=>{

        let uri=editInsuranceInfoId.length>0?'/account/api/user/updateinsurance':'/account/api/user/createinsurance';
        let mode=editInsuranceInfoId.length>0?'update':'create';

        let fdata=_formjs.convertJsonToFormdataObject(data);

        return new Promise((resolve,reject)=>{
            $.ajax({
                "url": uri,
                "processData": false,
                "contentType": false,
                "data": fdata,
                "method": "POST"
            }).then(response=>{
                //console.log(mode,response);
                if(mode==="create"){
                    resolve(response.ops[0]);
                }else if(mode==="update"){
                    resolve(data);
                }
            }).catch(err=>{
                reject(err);
            });
        }); 
    }

    const addInsuranceFiles=(files,insuranceInfo)=>{
        //console.log(files);
        let fileData=new FormData();

        Object.keys(files).forEach(key=>{
            fileData.append(key,files[key]);
        });

        fileData.append("linked_mongo_id",insuranceInfo._id);
        fileData.append("linked_db_name","accounts");
        fileData.append("linked_collection_name","userInsurances");

        return $.ajax({
            "url": '/g/uploadfiles',
            "processData": false,
            "contentType": false,
            "data": fileData,
            "method": "POST"
        });
    }

    const handleEntrySubmission=(e)=>{
        
        popup.onScreen("Saving Information ...");

        e.preventDefault();
        let form=e.target;

        let validate=_formjs.validateForm(form);

        if(validate===0){
            //aggregate the data
            let data={}; 

            $(form).find('.entry-field[name]').each(function () {
                let fd = _formjs.getFieldData(this);
                data = Object.assign(data, fd);
            });

            editInsuranceInfoId.length===0?data['deleted.$boolean']=false:null;
            editInsuranceInfoId.length>0?data._id=editInsuranceInfoId:null;
            editInsuranceInfoId.length===0?data['user_mongo_id.$_id']=params.userInfo._id:null;

            let insuranceFields={};

            //console.log(insuraceFiles);
            submitInsuranceFields(data).then(insuranceInfo=>{
                //console.log(insuranceInfo);
                insuranceFields=insuranceInfo;

                //** insert files **
                if(Object.keys(insuraceFiles).length>0){
                    return addInsuranceFiles(insuraceFiles,insuranceInfo);//insert new files
                }

            }).then((uploadedFiles=[])=>{
                //console.log(uploadedFiles);
                if(editInsuranceInfoId.length>0){
                    updateUserInsuranceState(insuranceFields,uploadedFiles);
                }else{
                    addNewUserInsuranceState(insuranceFields,uploadedFiles);
                }

                //close the form 
                setInsuranceEntryFormFlag(false);

                popup.remove();
                popup.onBottomCenter(`<div>
                    <span class="material-icons text-success align-middle">check_circle</span> 
                    <span class="ml-2 align-middle">Insurance saved</span>
                </div>`);
            });

        }else{
            popup.remove();
            popup.onBottomCenter("Please enter required fields");
        }

    }

    const handleInsuranceEdit=(_id)=>{
        setEditInsuranceId(_id);
        setInsuranceEntryFormFlag(true);
    }

    const handlePreviewInsuranceFile=(files)=>{
        setShowPreviewFilesModalFlag(true);
        setPreviewFilesArray(files);
    }

    const handleDeleteInsurance = (_id) => {

        popup.messageBox({
            message: `<p>Are you sure to delete the Insurance?</p>`,
            buttons: [{
                "label": "Yes",
                "class": "btn-danger",
                "id": "yes-button",
                "callback": function () {
                    popup.onScreen("Deleting...");
                    let getInsuranceInfo = userInsurances.filter(insurance => insurance._id === _id)[0];
                    let getInsuranceFiles = getInsuranceInfo.files;

                    let setPromises = [];

                    //Delete insurance Files first 
                    getInsuranceFiles.forEach(file => {
                        setPromises.push($.ajax({
                            "url": '/g/deletefile',
                            "data": JSON.stringify(file),
                            "processData": false,
                            "contentType": "application/json; charset=utf-8",
                            "method": "POST"
                        }));
                    });

                    setPromises.push($.ajax({
                        "url": '/account/api/user/updateinsurance',
                        "data": JSON.stringify({
                            "_id":getInsuranceInfo._id,
                            "deleted.$boolean":true
                        }),
                        "processData": false,
                        "contentType": "application/json; charset=utf-8",
                        "method": "POST"
                    }));

                    Promise.all(setPromises).then(values => {
                        popup.remove();
                        popup.onBottomCenter("Insurance Deleted");

                        let insurances=[...userInsurances];
                        let indx=insurances.findIndex(insurance=>insurance._id===_id);
                        
                        let removedInsurance=insurances.splice(indx,1);

                        setUserInsurances(insurances);
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

    return (<div>
        {
            loader ?
                <div className="mt-2 p-2 text-center">
                    <img src="/efs/core/images/core/loading.gif" style={{ width: "40px" }}></img>
                </div> :
                <div>
                    {
                        userInsurances.length > 0 ?
                            userInsurances.map((insurance) => {
                                return <div key={insurance._id} className="border-bottom pt-1 pb-1 position-relative">
                                        <div>{insurance.insurance_provider} <span className="text-success">({insurance.insurance_priority})</span></div>
                                        <div className="text-muted small d-flex">
                                            <div>{insurance.insurance_member_id}</div>
                                            {
                                                insurance.files.length>0?<div className="btn-link pointer ml-2">
                                                    <div onClick={()=>{handlePreviewInsuranceFile(insurance.files)}}>{insurance.files.length} attachments</div>
                                                </div>:null
                                            }
                                        </div>
                                        <div className="push-right d-flex small">
                                            <div className="btn-link pointer" onClick={()=>{handleInsuranceEdit(insurance._id)}}>Edit</div>
                                            <div className="btn-link ml-2 text-danger pointer" onClick={()=>{handleDeleteInsurance(insurance._id)}}>Delete</div>
                                        </div>
                                    </div>
                            }) :
                            <div className="p-1 small text-muted">
                                No insurance information found. Click on add new insurance button below to add insurance to your profile.
                                Adding insurance helps booking your appointments faster.
                </div>
                    }
                    <div className="pt-2">
                        <div className="small btn-link pointer" onClick={() => { setInsuranceEntryFormFlag(true) }}>Add New Insurance</div>
                    </div>
                </div>
        }

        {
            showInsuranceEntryForm ?
                <Modal header={<h3>Insurance Entry</h3>}
                    onCloseHandler={() => { setInsuranceEntryFormFlag(false) }}>
                    <form ref={insuranceFormRef} onSubmit={(e)=>{handleEntrySubmission(e)}} encType="multipart/form-data">
                        <div className="form-group">
                            <label data-required="1">Insurance Provider</label>
                            <input name="insurance_provider" list="insurance-providers-datalist"
                                className="form-control entry-field"></input>
                            <datalist id="insurance-providers-datalist" placeholder="Insurance Provider">
                                {
                                    insuranceProviders.map(insurance => {
                                        return <option key={insurance.id} id={insurance.id} value={insurance.name} />
                                    })
                                }
                            </datalist>
                        </div>
                        <div className="form-group">
                            <label data-required="1">Insurance Member ID</label>
                            <input name="insurance_member_id"
                                className="form-control entry-field"
                                placeholder="Member ID" type="text" data-required="1" />
                        </div>
                        <div className="form-group">
                            <label data-required="1">Insurance Prority</label>
                            <select name="insurance_priority" className="form-control entry-field"
                                placeholder="Insurance Priority" data-required="1">
                                <option value=""></option>
                                <option value="primary">Primary</option>
                                <option value="secondary">Secondary</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label data-required="1">Policy Holder</label>
                            <select name="insurance_policy_holder" className="form-control entry-field"
                                placeholder="Insurance Policy Holder"
                                onChange={(e) => { setPolicyHolder(e.target.value) }}
                                data-required="1">
                                <option value=""></option>
                                <option value="self">Self</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        {
                            policyHolder.length > 0 && policyHolder === "other" ?
                                <div className="border rounded p-2 mb-2">
                                    <div className="mt-2 mb-2 text-muted"> Please enter following information since your not the policy holder </div>
                                    <div className="form-group">
                                        <label data-required="1">Relationship to Policy Holder</label>
                                        <select name="relation_with_policy_holder" className="form-control entry-field"
                                            placeholder="Realtionship with the Policy Holder"
                                            data-required="1">
                                            <option value=""></option>
                                            {
                                                relations.map((r, indx) => {
                                                    return <option key={indx} value={r}>{r}</option>
                                                })
                                            }
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label data-required="1">Name of the Policy Holder</label>
                                        <input name="policy_holder_name"
                                            className="form-control entry-field"
                                            placeholder="Policy Holder Name" type="text" data-required="1" />
                                    </div>
                                </div>
                                : null
                        }

                        <div className="form-group">

                            <label htmlFor="insurance-file" data-required="1">Attach Insurance Card </label>

                            <div id="insurance-file-container"
                                name="insurance_files"
                                className="mt-2 p-2 position-relative droppable-file-container entry-field"
                                data-required="1"
                                placeholder="Insurance Card">

                                <div className="droppable-file-action-container">

                                    <div className="small text-muted d-inline-block">Drag and drop or upload the file</div>

                                    <div className="position-relative ml-2 upload-file-container d-inline-block">
                                        <input type="file" id="insurance-file" className="form-control" multiple="multiple" />
                                        <div className="btn-info p-1 rounded text-center input-overlay small">Upload File</div>
                                    </div>

                                </div>

                                <div className="droppable-file-preview-container"></div>

                            </div>

                        </div>
                        
                        <div className="mt-2 text-center">
                            <button className="btn btn-info w-75" type="submit">Save Insurance</button>
                        </div>
                    
                    </form>
                </Modal> : null
        }
        {
            showPreviewFilesModal?
            <FilePreview files={previewFilesArray} onCloseHandler={()=>{setShowPreviewFilesModalFlag(false)}}></FilePreview>:null
        }
    </div>)
}