import React, { useContext, useEffect, useState } from 'react';

import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';

import {
    useRouteMatch,
    Link
} from "react-router-dom";

import { DisplayAddress } from "core/components/infoDisplay/address/displayAddress";

import { AppContext } from '../AppContext';

import { getPracticeProviders, getPracticeInfo } from "./handlers";

export const PracticeManagement = () => {

    let { url } = useRouteMatch();
    let { userInfo } = useContext(AppContext);

    const [userPractices, setUserPractices] = useState(null);

    const [loader, setLoader] = useState(true);

    useEffect(() => {
        getPracticeProviders({
            "userMongoId.$_id": userInfo._id,
            "expand": "facility,facility/files"
        }).then(data => {
            console.log(data);

            let _d = data.length > 0 ? data.reduce((acc, ci) => {
                acc = acc.concat(ci.facilityInfo.map(f => Object.assign(f, { providerId: ci._id })));
                return acc;
            }, []) : [];

            console.log(_d);

            setUserPractices(_d);

        }).catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (userPractices !== null) setLoader(false);
    }, [userPractices])

    const handleCreateNewPractice = async () => {
        //OnNew click a new practice is created with empty data BUT linked to user
        let practiceCreationResponse = await fetch('/account/api/practice/medicalfacility/create', {
            method: "POST",
            body: JSON.stringify({
                "createdBy.$_id": userInfo._id,
                "name": "",
                "facilityType": [],
                "description": "",
                "address": {},
                "contactInformation": [],
                "settings": {},
                "verificationState": "new",//new --> pending --> in review --> approved
                "deleted.$boolean": false,
            }),
            headers: {
                "content-type": "application/json",
            }
        });

        let practiceCreationData = await practiceCreationResponse.json();

        console.log(practiceCreationData);

        //Create provider linked to practice
        let providerCreationResponse = await fetch('/account/api/practice/medicalprovider/create', {
            method: "POST",
            body: JSON.stringify({
                "userMongoId.$_id": userInfo._id,
                "facilityId.$_id": practiceCreationData._id,
                "availability": [],
                "settings": {},
                "verificationState": "new",//new --> pending --> in review --> approved
                "deleted.$boolean": false,
                "affiliation.$boolean": false
            }),
            headers: {
                "content-type": "application/json",
            }
        });

        let providerCreationData = await providerCreationResponse.json();

        console.log(providerCreationData);

        //User is going to be routed to edit practice
        window.location.assign(window.location.origin + "/practice-management/practice/" + practiceCreationData._id + "/" + providerCreationData._id);

    }

    return (<Container fluid className="my-3">
        <div className="d-flex flex-row justify-content-between align-items-center">
            <div className="h3">Practices</div>
            <div>
                <Button
                    variant="primary"
                    onClick={handleCreateNewPractice}
                    className="mt-2">Add New Practice</Button>
            </div>
        </div>

        {
            !loader ?
                <div className="mt-2 d-flex flex-column ">
                    {
                        userPractices && userPractices.length > 0 ?
                            userPractices.map((practice, indx) => {
                                return <div key={practice._id} className="my-2  bg-white p-2 rounded">
                                    <Link to={`${url}/practice/${practice._id}/${practice.providerId}`}>
                                        <div className={`p-2 d-flex flex-row align-items-center ${indx < userPractices.length - 1 ? "border-bottom" : ""}`} >
                                            <div className="mr-2"></div>
                                            <div style={{ flexGrow: 2 }}>
                                                <b>{practice.name} <Badge pill bg="primary">{practice.verificationState}</Badge></b>
                                                {
                                                    practice.address && Object.keys(practice.address).length > 0 ?
                                                        <div className="text-muted mt-2"><DisplayAddress address={practice.address} /></div> :
                                                        null
                                                }
                                            </div>
                                            <div className="ml-2">
                                                <i className="fas fa-chevron-right"></i>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            }) :
                            null
                    }

                </div> :
                null

        }


    </Container>)
}