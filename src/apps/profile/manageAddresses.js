import React, { useState, useContext, useEffect } from 'react';
import { UserInfo } from "../../contexts/userInfo";
import { Modal } from "../../components/common/modal";
const countries = require('@oi/utilities/lib/lists/countries.json');
import { formjs,insertValues } from "@oi/utilities/lib/js/form";

export const ManageAddresses = () => {
    const [showAddressEntryForm, setAddressEntryFormFlag] = useState(false);
    const [addressInfoToEdit,setAddressInfoToEdit]=useState({});

    let formRef=React.createRef();

    let params=useContext(UserInfo);
    let _formjs=new formjs();
    let _insertValues=new insertValues();

    const handleAddressSubmission=(e)=>{
        e.preventDefault();
        
        let form=e.target;
        let validate=_formjs.validateForm(form);

        let submitButton=$(form).find('button[type="submit"]');

        //add loader to button 
        uiButtons.addLoader(submitButton);

        if(validate===0){

            let address={};

            //aggregate the data 
            $(form).find('.entry-field[name]').each(function () {
                let fd = _formjs.getFieldData(this);
                address = Object.assign(address, fd);
            });

            let data={
                user_addresses:[],
                _id:params.userInfo._id
            };

            //check if address exists
            if('user_addresses' in params.userInfo && params.userInfo.user_addresses.length>0 && Object.keys(addressInfoToEdit).length===0){
                //create mode
                address._id=getRandomId()+(params.userInfo.user_addresses.length+1);
                address.default=false;
                data.user_addresses=params.userInfo.user_addresses.concat([address]);

            }else if('user_addresses' in params.userInfo && params.userInfo.user_addresses.length>0 && Object.keys(addressInfoToEdit).length>0){
                //Edit mode 
                let indx=params.userInfo.user_addresses.findIndex(a=>a._id===addressInfoToEdit._id);
                let addresses=[...params.userInfo.user_addresses];
                addresses[indx]=address;
                data.user_addresses=addresses;

            }else{
                //create mode
                address._id=getRandomId()+'0';
                address.default=true;
                data.user_addresses.push(address);
            }

            let fdata = _formjs.convertJsonToFormdataObject(data);

            $.ajax({
                "url": '/account/api/user/update',
                "processData": false,
                "contentType": false,
                "data": fdata,
                "method": "POST"
            }).then(response => {

                setAddressEntryFormFlag(false);

                //update the context
                params.updateUserInfoContext({
                    user_addresses:data.user_addresses
                });

                popup.onBottomCenter("Address updated");

            }).catch(err => {
                reject(err);
            });

        }else{
            uiButtons.removeLoader(submitButton);
            popup.onBottomCenter("Enter Required field");
        }

    }

    const handleEditAddress=(_id)=>{
        //Get address info 
        let info=params.userInfo.user_addresses.filter(a=>a._id===_id)[0];
        //console.log(_id,info);
        setAddressInfoToEdit(info);
        setAddressEntryFormFlag(true);
    }

    const handleSetDefaultAddress = (_id) => {

        popup.onScreen("Updating ...");

        let indx = params.userInfo.user_addresses.findIndex(a => a._id === _id);

        //mark all address default = false except the with indx abve
        let data = {
            user_addresses: [...params.userInfo.user_addresses],
            _id: params.userInfo._id
        }

        data.user_addresses.forEach((addr, i) => {
            if (i === indx) {
                addr.default = true;
            } else {
                addr.default = false;
            }
        });

        let fdata = _formjs.convertJsonToFormdataObject(data);

        $.ajax({
            "url": '/account/api/user/update',
            "processData": false,
            "contentType": false,
            "data": fdata,
            "method": "POST"
        }).then(response => {

            //update the context
            params.updateUserInfoContext({
                user_addresses: data.user_addresses
            });

            popup.remove();
            popup.onBottomCenter("Address updated");

        }).catch(err => {
            reject(err);
        });

    }

    const handleDeleteAddress=function(_id){

        popup.messageBox({
            message: "Are you sure to remove this Address?",
            buttons: [{
                    "label": "Yes",
                    "class": "btn-danger",
                    "id": "yes-button",
                    "callback": function () {
                        popup.remove(); //remove the confirmation pop up 
                        popup.onScreen("Deleting...");

                        let indx=params.userInfo.user_addresses.findIndex(a=>a._id===_id);

                        let addresses=[...params.userInfo.user_addresses];
                        let address=addresses.splice(indx,1);

                        let data={
                            "user_addresses":addresses,
                            "_id": params.userInfo._id
                        }

                        let fdata = _formjs.convertJsonToFormdataObject(data);
                        
                        //verified and correct 
                        //Add the phone number to user contacts 

                        $.ajax({
                            "url": '/account/api/user/update',
                            "processData": false,
                            "contentType": false,
                            "data": fdata,
                            "method": "POST"
                        }).then(response => {
                            //update the context
                            params.updateUserInfoContext({
                                "user_addresses":data.user_addresses
                            });

                            popup.remove();
                            popup.onBottomCenter("Address deleted");

                        }).catch(err => {
                            reject(err);
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

    useEffect(()=>{
        if(Object.keys(addressInfoToEdit).length>0 && showAddressEntryForm){
            
            let form=formRef.current;

            //insert the values in the form 
            _insertValues.container=form;
            _insertValues.insert(addressInfoToEdit);

        }

    },[addressInfoToEdit,showAddressEntryForm]);

    useEffect(()=>{
        if(!showAddressEntryForm){
            setAddressInfoToEdit({});
        }

    },[showAddressEntryForm]);

    return (
        <UserInfo.Consumer>
            {({ userInfo = {} }) => {
                return (
                    <div>
                        {
                            'user_addresses' in userInfo && userInfo.user_addresses.length>0? 
                            userInfo.user_addresses.sort((a,b)=>{
                                if(a.default) return -1;
                                return 1;
                            }).map(function(addr,indx){
                                    return (
                                    <div className="position-relative border-bottom small pt-1 pb-1" key={indx} _id={addr._id}>
                                        <div>
                                            <div>{addr.street_line1}</div>
                                            <div>{addr.street_line2}</div>
                                            <div>
                                                <span>{addr.city}, {addr.zip_code}</span>
                                            </div>
                                            <div>{addr.state}, {addr.country} {addr.default?<span className="text-success">(default)</span>:""} </div>
                                        </div>
                                        <div className="push-right">
                                            <div className="d-inline-block btn-link pointer" onClick={()=>{handleEditAddress(addr._id)}}>Edit</div>
                                            {
                                                !addr.default?<div className="d-inline-block ml-2 btn-link text-success pointer" onClick={()=>{handleSetDefaultAddress(addr._id)}}>Set default</div>:null
                                            }
                                            <div className="d-inline-block ml-2 btn-link text-danger pointer" onClick={()=>{handleDeleteAddress(addr._id)}}>Delete</div>
                                        </div>
                                    </div>)
                                }) : null
                        }
                        <div className="w-100 pt-2">
                            <div className="small btn-link pointer" onClick={()=>{setAddressEntryFormFlag(true)}}>Add New Address</div>
                        </div>

                        {
                            showAddressEntryForm ?
                                <Modal header={<h3>Address Entry</h3>}
                                    onCloseHandler={() => { setAddressEntryFormFlag(false) }}>
                                    <form ref={formRef} className="pl-2 pr-2" onSubmit={(e)=>{handleAddressSubmission(e)}}>
                                        <div className="form-group">
                                            <label htmlFor="address-street-address-1" data-required="1">Street Address line #1 </label>
                                            <input type="text"
                                                name="street_line1"
                                                id="address-street-address-1"
                                                className="form-control mt-2 entry-field"
                                                data-required="1"
                                                placeholder="Street Address line #1" />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="address-street-address-2">Street Address line #2 <i className="small">(optional)</i></label>
                                            <input type="text"
                                                name="street_line2"
                                                id="address-street-address-2"
                                                className="form-control mt-2 entry-field" 
                                                placeholder="Street Address line #2" />
                                        </div>
                                        <div className="row mt-2">
                                            <div className="col">
                                                <label htmlFor="address-city" data-required="1">City </label>
                                                <input type="text" name="city"
                                                    id="address-city"
                                                    className="form-control entry-field"
                                                    data-required="1"
                                                    placeholder="City" />
                                            </div>
                                            <div className="col">
                                                <label htmlFor="address-zip-code" data-required="1">Zip Code </label>
                                                <input type="text" name="zip_code"
                                                    id="address-zip-code"
                                                    className="form-control entry-field"
                                                    placeholder="Zip/Postal code"
                                                    data-required="1" />
                                            </div>
                                        </div>
                                        <div className="row mt-2">
                                            <div className="col">
                                                <label htmlFor="address-state" data-required="1">State </label>
                                                <input type="text" name="state"
                                                    id="address-state"
                                                    className="form-control entry-field"
                                                    data-required="1"
                                                    placeholder="State" />
                                            </div>
                                            <div className="col">
                                                <label htmlFor="address-country" data-required="1">Country </label>
                                                <select name="country"
                                                    id="address-country"
                                                    className="form-control country-name-option-list entry-field"
                                                    data-required="1" placeholder="country">
                                                    <option value=""></option>
                                                    {
                                                        countries.map((c,indx) => {
                                                            return <option key={indx} value={c._id}>{c.name}</option>
                                                        })
                                                    }
                                                </select>
                                            </div>
                                        </div>
                                        <div className="mt-2 text-center">
                                            <button className="btn btn-primary w-75" type="submit">Save Address</button>
                                        </div>
                                    </form>
                                </Modal>
                                : null
                        }


                    </div>
                )

            }}
        </UserInfo.Consumer>)
}