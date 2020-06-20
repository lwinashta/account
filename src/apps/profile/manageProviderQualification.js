import React, { useEffect, useState, useContext } from "react";
import { UserInfo } from "../../contexts/userInfo";
import { Modal } from "@oi/reactcomponents";
import { formjs,multiSelectDropDown,fileUploadField } from "@oi/utilities/lib/js/form";

const degrees=require("@oi/utilities/lib/lists/medical-degrees.json");
const councils=require("@oi/utilities/lib/lists/medical-councils.json");

const _formjs=new formjs();

const DisplayItem=({item="",indx=null})=>{
    return ( <div className="small bg-lgrey border text-capitalize rounded pr-2 pl-2 pt-1 pb-1 mt-1 mr-2">{item}</div>);
}

const DisplayItemAsString=(item,_id)=>{
    return ( `<div _id="${_id}" class="item bg-lgrey text-capitalize border rounded pr-2 pl-2 pt-1 pb-1 mt-1 mr-2">
        <div class="d-inline-block align-middle">${item}</div>
        <div class="d-inline-block btn-link text-danger align-middle">
            <i class="fas fa-times"></i>
        </div>
    </div>`);
}

export const ManageProviderQualification = () => {
    
    let params=useContext(UserInfo);
    
    const [userSpecialties,setSpecialties]=useState([]);
    const [userMedicalDegrees,setMedicalDegrees]=useState("medical_degrees" in params.userInfo?params.userInfo.medical_degrees:[]);
    const [userMedicalRegNumber,setMedicalRegNumber]=useState("medical_registration_number" in params.userInfo?params.userInfo.medical_registration_number:"");
    const [userMedicalCouncils,setMedicalCouncil]=useState("medical_councils" in params.userInfo?params.userInfo.medical_councils:[]);
    
    const [showSpecialtyEntryForm,setShowSpecialtyEntryFormFlag]=useState(false);
    const [showMedicalDegreeEntryForm,setShowMedicalDegreeEntryFormFlag]=useState(false);
    const [showMedicalCouncilEntryForm,setShowMedicalCouncilEntryFormFlag]=useState(false);
    const [showMedicalRegistraionEntryForm,setShowMedicalRegistrationEntryFormFlag]=useState(false);
    const [medicalRegistrationFile,setMedicalRegistrationFiles]=useState([]);
    const [specialties, setSpecialtiesList] = useState([]);

    let formRef=React.createRef();

    /** UseEffect Hooks */
    useEffect(()=>{
        $.getJSON('/healthcare/api/specialties/getall').then(response=>{
            //console.log(response)
            setSpecialtiesList(response);

            //set all states 
            setSpecialties("specialties" in params.userInfo?params.userInfo.specialties:[]);

        });
    },[]);

    useEffect(()=>{
        if(showSpecialtyEntryForm){
            let _multiSelectDropDown=new multiSelectDropDown({
                container:$(formRef.current),
                data:specialties,
                initialDataset:specialties,
                onItemSearch:function(val){
                    let rgEx = new RegExp(val, 'i');
                    return specialties.filter(ds => rgEx.test(ds.name));
                },
                displaySearchResults:function(items){
                    console.log(items);
                    return items.map((item,indx)=>{
                        return `<div class="p-2 border-bottom pointer text-capitalize item" _id="${item._id}">${item.name}</div>`
                    });
                },
                onItemSelect:function(item){
                    return DisplayItemAsString(item.name,item._id);
                }
            });
            _multiSelectDropDown.bind();

            let layout=userSpecialties.map((specialty,indx)=>{
                let specialtyinfo=specialties.filter(s=>s._id===specialty)[0];
                return DisplayItemAsString(specialtyinfo.name,specialtyinfo._id);
            })

            $(formRef.current).find('.selected-items').append(layout)

        }
    },[showSpecialtyEntryForm]);

    useEffect(()=>{
        if(showMedicalDegreeEntryForm){
            let _multiSelectDropDown=new multiSelectDropDown({
                container:$(formRef.current),
                data:degrees,
                initialDataset:degrees,
                onItemSearch:function(val){
                    let rgEx = new RegExp(val, 'i');
                    return degrees.filter(ds => rgEx.test(ds.name) || rgEx.test(ds.abbr) );
                },
                displaySearchResults:function(items){
                    return items.map((item,indx)=>{
                        return `<div class="p-2 border-bottom pointer text-capitalize item" _id="${item._id}">${item.name} (${item.abbr})</div>`
                    });
                },
                onItemSelect:function(item){
                    return DisplayItemAsString(`${item.name} (${item.abbr})`,item._id);
                }
            });
            _multiSelectDropDown.bind();

            let layout=userMedicalDegrees.map((degree,indx)=>{
                let degreeInfo=degrees.filter(s=>s._id===degree)[0];
                return DisplayItemAsString(degreeInfo.name,degreeInfo._id);
            })

            $(formRef.current).find('.selected-items').append(layout)

        }
    },[showMedicalDegreeEntryForm]);

    useEffect(()=>{
        if(showMedicalCouncilEntryForm){
            let _multiSelectDropDown=new multiSelectDropDown({
                container:$(formRef.current),
                data:councils,
                initialDataset:councils,
                onItemSearch:function(val){
                    let rgEx = new RegExp(val, 'i');
                    return degrees.filter(ds => rgEx.test(ds.name) );
                },
                displaySearchResults:function(items){
                    return items.map((item,indx)=>{
                        return `<div class="p-2 border-bottom pointer text-capitalize item" _id="${item._id}">${item.name}</div>`
                    });
                },
                onItemSelect:function(item){
                    return DisplayItemAsString(`${item.name}`,item._id);
                }
            });
            _multiSelectDropDown.bind();

            let layout=userMedicalCouncils.map((council,indx)=>{
                let councilInfo=councils.filter(s=>s._id===council)[0];
                return DisplayItemAsString(councilInfo.name,councilInfo._id);
            })

            $(formRef.current).find('.selected-items').append(layout)

        }
    },[showMedicalCouncilEntryForm]);

    useEffect(()=>{
        if(showMedicalRegistraionEntryForm){
            let _manageFiles=new fileUploadField({
                container:$(formRef.current).find('.droppable-file-container'),
                multiple:true,
                name:$(formRef.current).find('.droppable-file-container').attr('name'),
                onFileSelectionCallback:function(file,allUploaded){
                    setMedicalRegistrationFiles(allUploaded);
                }
            });
            _manageFiles.bind();//bind file drg and drop
        }
    },[showMedicalRegistraionEntryForm]);

    //** Submit Updates */
    const submitUserUpdates=(data)=>{
        return $.ajax({
            "url": '/account/api/user/update',
            "data": JSON.stringify(data),
            "processData": false,
            "contentType": "application/json; charset=utf-8",
            "method": "POST"
        });
    }

    /** Event Handlers */

    const handleSpecialtySubmission=(e)=>{
        e.preventDefault();

        let form=e.target;

        let validate=_formjs.validateForm(form);

        if(validate===0){
            popup.onScreen("Updating...");
            let selectedSpecialties=[];

            $(form).find('[name="specialties"]').find('.selected-items').find('.item').each(function(){
                selectedSpecialties.push($(this).attr('_id'));
            });

            submitUserUpdates({
                "specialties":selectedSpecialties,
                "_id":params.userInfo._id

            }).then(response=>{
                setSpecialties(selectedSpecialties);
                setShowSpecialtyEntryFormFlag(false);
                popup.remove();
                popup.onBottomCenter("Specialty Updated");

            }).catch(err=>{
                console.log(err);
                popup.onBottomCenter("Error while updating the info. Try again.");
            })
        }else{
            popup.onBottomCenter("Please enter required fields");
        }
    }

    const handleMedicalDegreeSubmission=(e)=>{
        e.preventDefault();

        let form=e.target;

        let validate=_formjs.validateForm(form);

        if(validate===0){
            popup.onScreen("Updating...");
            let selectedMedicalDegrees=[];

            $(form).find('[name="medical_degrees"]').find('.selected-items').find('.item').each(function(){
                selectedMedicalDegrees.push($(this).attr('_id'));
            });

            submitUserUpdates({
                "medical_degrees":selectedMedicalDegrees,
                "_id":params.userInfo._id

            }).then(response=>{
                setMedicalDegrees(selectedMedicalDegrees);
                setShowMedicalDegreeEntryFormFlag(false);
                popup.remove();
                popup.onBottomCenter("Medical Degree Updated");

            }).catch(err=>{
                console.log(err);
                popup.onBottomCenter("Error while updating the info. Try again.");
            })
        }else{
            popup.onBottomCenter("Please enter required fields");
        }
    }

    const handleMedicalCouncilSubmission=(e)=>{
        e.preventDefault();

        let form=e.target;

        let validate=_formjs.validateForm(form);

        if(validate===0){
            popup.onScreen("Updating...");
            let selectedMedicalCouncils=[];

            $(form).find('[name="medical_councils"]').find('.selected-items').find('.item').each(function(){
                selectedMedicalCouncils.push($(this).attr('_id'));
            });

            submitUserUpdates({
                "medical_councils":selectedMedicalCouncils,
                "_id":params.userInfo._id

            }).then(response=>{
                setMedicalCouncil(selectedMedicalCouncils);
                setShowMedicalCouncilEntryFormFlag(false);
                popup.remove();
                popup.onBottomCenter("Medical Council Updated");

            }).catch(err=>{
                console.log(err);
                popup.onBottomCenter("Error while updating the info. Try again.");
            })
        }else{
            popup.onBottomCenter("Please enter required fields");
        }
    }

    /** Render */
    return (<div>
        <div className="border-bottom pb-2 position-relative">
            <div className="font-weight-bold">Specialty</div>
            {
                userSpecialties.length === 0 ? 
                <div>
                    <div className="small mb-1 mt-1 btn-link pointer" onClick={()=>setShowSpecialtyEntryFormFlag(true)}>Add Specialties</div>
                </div> :
                <div>
                    <div className="push-right">
                        <div className="small btn-link pointer" onClick={()=>setShowSpecialtyEntryFormFlag(true)}>Edit</div>
                    </div>
                    <div className="d-flex flex-wrap">
                        {
                            userSpecialties.map((specialty,indx)=>{
                                return <DisplayItem key={indx} item={specialties.filter(s=>s._id===specialty)[0].name} />
                            })
                        }
                    </div>
                    
                </div>
            }
        </div>

        <div className="border-bottom pt-2 pb-2 position-relative">
            <div className="font-weight-bold">Medical Degrees</div>
            {
                userMedicalDegrees.length === 0 ? 
                <div>
                    <div className="small mb-1 mt-1 btn-link pointer" onClick={()=>{setShowMedicalDegreeEntryFormFlag(true)}}>Add Medical Degrees</div>
                </div> :
                <div>
                    <div className="push-right">
                        <div className="small btn-link pointer" onClick={()=>{setShowMedicalDegreeEntryFormFlag(true)}}>Edit</div>
                    </div>
                    <div className="d-flex flex-wrap">
                    {
                        userMedicalDegrees.map((degree,indx)=>{
                            let degreeInfo=degrees.filter(d=>d._id===degree)[0];
                            return <DisplayItem key={indx} item={degreeInfo.name+" ("+degreeInfo.abbr+") "} />
                        })
                    }
                    </div>
                </div>
            }
        </div>

        <div className="border-bottom pt-2 pb-2">
            <div className="font-weight-bold">Medical Registration/ License Number</div>
            {
                userMedicalRegNumber.length === 0 ? 
                <div className="small">
                    <div className="mt-1 btn-link pointer" onClick={()=>{setShowMedicalRegistrationEntryFormFlag(true)}}>Add Medical Registration/ License Number</div>
                    <div className="text-muted">You will also need your medical registration certificate as an attachment to verify your qualitifcation.</div>
                </div> :
                <div>
                    <div className="push-right">
                        <div className="small btn-link pointer" onClick={()=>{setShowMedicalRegistrationEntryFormFlag(true)}}>Edit</div>
                    </div>
                    <div className="small text-muted">
                        {userMedicalRegNumber}
                    </div>
                </div>
            }
            
        </div>
        
        <div className="border-bottom pt-2 pb-2 position-relative">
            <div className="font-weight-bold">Medical Councils</div>
            {
                userMedicalCouncils.length === 0 ? 
                <div>
                    <div className="small mb-1 mt-1 btn-link pointer" onClick={()=>{setShowMedicalCouncilEntryFormFlag(true)}}>Add Medical Council</div>
                </div> :
                <div>
                    <div className="push-right">
                        <div className="small pointer btn-link" onClick={()=>{setShowMedicalCouncilEntryFormFlag(true)}}>Edit</div>
                    </div>
                    <div className="d-flex flex-wrap">
                    {
                        userMedicalCouncils.map((council,indx)=>{
                            let councilInfo=councils.filter(d=>d._id===council)[0];
                            return <DisplayItem key={indx} item={councilInfo.name} />
                        })
                    }
                    </div>
                </div>
            }
        </div>
        {
            showSpecialtyEntryForm?
            <Modal header={<h3>Speacilty Entry</h3>} onCloseHandler={()=>{setShowSpecialtyEntryFormFlag(false)}}>
                <form ref={formRef} onSubmit={(e)=>{handleSpecialtySubmission(e)}}>
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
            </Modal>:null
        }
        {
            showMedicalDegreeEntryForm?
            <Modal header={<h3>Medical Degree Entry</h3>} onCloseHandler={()=>{setShowMedicalDegreeEntryFormFlag(false)}}>
                <form ref={formRef} onSubmit={(e)=>{handleMedicalDegreeSubmission(e)}}>
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
            </Modal>:null
        }
        {
            showMedicalRegistraionEntryForm?
            <Modal header={<h3>Medical Registration Entry</h3>} onCloseHandler={()=>{setShowMedicalRegistrationEntryFormFlag(false)}}>
                <form ref={formRef} onSubmit={(e)=>{handleMedicalRegistrationSubmission(e)}} >
                    <div className="form-group">
                        <label data-required="1">Registration/License Number </label>
                        <input type="text" name="medical_registration" 
                            class="form-control entry-field" data-required="1"
                            placeholder="Medical Registration Number" />
                    </div>
                    <div className="form-group">

                            <label htmlFor="medical-registration-file" data-required="1">Attach Insurance Card </label>

                            <div id="medical-registration-file-container"
                                name="medical_registration_files"
                                className="mt-2 p-2 position-relative droppable-file-container entry-field"
                                data-required="1"
                                placeholder="Medical Registration">

                                <div className="droppable-file-action-container">

                                    <div className="small text-muted d-inline-block">Drag and drop or upload the file</div>

                                    <div className="position-relative ml-2 upload-file-container d-inline-block">
                                        <input type="file" id="medical-registration-file" className="form-control" multiple="multiple" />
                                        <div className="btn-info p-1 rounded text-center input-overlay small">Upload File</div>
                                    </div>

                                </div>

                                <div className="droppable-file-preview-container"></div>

                            </div>

                        </div>
                        
                </form>
            </Modal>:null
        }
        {
            showMedicalCouncilEntryForm?
            <Modal header={<h3>Medical Council Entry</h3>} onCloseHandler={()=>{setShowMedicalCouncilEntryFormFlag(false)}}>
                <form ref={formRef} onSubmit={(e)=>{handleMedicalCouncilSubmission(e)}}>
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
            </Modal>:null
        }
        

    </div>)
}