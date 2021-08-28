import React, { useContext, useEffect, useState } from 'react';

import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

import Table from 'react-bootstrap/Table';

import {
    useRouteMatch,
    Link
} from "react-router-dom";

import { AppContext } from '../AppContext';

import { getPracticeInfo } from "./handlers";

export const PracticeManagement=()=>{

    let { url } = useRouteMatch();
    let {userInfo} = useContext(AppContext);

    const [userPractices, setUserPractices]=useState([]);

    useEffect(()=>{
        getPracticeInfo({
            "userMongoId.$_id":userInfo._id
        }).then(data=>setUserPractices(data))
        .catch(err=>console.error(err));
    });

    const handleCreateNewPractice=async ()=>{
        //OnNew click a new practice is created with empty data BUT linked to user
        let response=await fetch('/account/api/practice/medicalfacility/create',{
            method: "POST",
            body: JSON.stringify({
                "userMongoId.$_id": userInfo._id,
                "name":"",
                "facilityType":null,
                "description":"",
                "address":null,
                "contactInformation":null,
                "availability":null,
                "setting":null,
                "verificationState":"new",//new --> pending --> in review --> approved
                "deleted.$boolean":false,
                "affiliation.$boolean":false
            }),
            headers: {
                "content-type": "application/json",
            }
        });

        let data=await response.json();

        console.log(data)

        //User is going to be routed to edit practice
        window.location.assign(window.location.origin+"/practice-management/practice/"+data._id);

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

        <Table bordered className="mt-3" className="bg-white">
            <thead>
                <tr>
                    <td>Verification State</td>
                    <td>Practice Name</td>
                    <td>Practice Address</td>
                    <td></td>
                </tr>
            </thead>
            <tbody>
                {
                    userPractices.map(u=>{
                        return <tr>
                            <td>{u.verificationState}</td>
                            <td>{u.name}</td>
                            <td>234 Josephine Drive, NJ, 00992</td>
                            <td>
                                <Link to={`${url}/practice/` + u._id}>
                                    <Button variant="info">View Details</Button>
                                </Link>
                            </td>
                        </tr>
                    })
                }
            </tbody>
        </Table>
        
    </Container>)
}