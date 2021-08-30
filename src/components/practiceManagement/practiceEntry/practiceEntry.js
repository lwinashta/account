import React, { useEffect, useState } from 'react';

import Container from 'react-bootstrap/Container';
import Spinner from 'react-bootstrap/Spinner';

import { PracticeContext } from './practiceContext';

import { PracticeGeneralInformation } from './practiceGeneralInformation/practiceGeneralInformation';
import { PracticeContactInformation } from './practiceContactInformation/practiceContactInformation';
import { PracticeAddress } from './practiceAddress/practiceAddress';
import { PracticeAvailability } from "./practiceAvailability/practiceAvailability";
import { PracticePictures } from './practicePictures/practicePictures'

import {
    Link,
    useRouteMatch,
    useParams,
    Switch,
    Route,
    Redirect
} from "react-router-dom";

import { getPracticeInfo, getPracticeProviders } from '../handlers';

export const PracticeEntry = () => {

    let { practiceId, providerId } = useParams();
    let { path, url } = useRouteMatch();

    const [loader, setLoader] = useState(true);
    const [practiceInfo, setPracticeInfo] = useState(null);
    const [practiceProviderInfo, setPracticeProviderInfo] = useState(null);

    useEffect(() => {

        Promise.all([
            getPracticeInfo({
                "_id.$_id":practiceId,
                "expand":"files"
            }),
            getPracticeProviders({
                "_id.$_id":providerId
            })
        ]).then(data=>{
            console.log(data);
            setPracticeInfo(data[0][0]);
            setPracticeProviderInfo(data[1][0]);

        }).catch(err => console.log(err));

    }, []);

    useEffect(()=>{
        if(practiceInfo!==null) {setLoader(false)};
    },[practiceInfo]);

    const resetPracticeInfo=async()=>{
        let updatedPracticeInfo=await getPracticeInfo({
            "_id.$_id":practiceId,
            "expand":"files"
        });
        setPracticeInfo(updatedPracticeInfo[0]);
    }

    const resetPracticeProviderInfo=async()=>{
        let updatedPracticeProviderInfo=await getPracticeProviders({
            "_id.$_id":providerId
        });
        setPracticeProviderInfo(updatedPracticeProviderInfo[0]);
    }

    return (<Container>
        <div className="bg-white border rounded bg-white my-3">

            <div className="d-flex flex-row my-2 px-3 py-2 align-contents-center">
                <div> 
                    <Link to="/practice-management"> <i className="fas fa-long-arrow-alt-left"></i> Back to My Practices </Link>
                </div>
                <div className="h3 ml-4">Practice Entry</div>
            </div>

            {
                loader ?
                    <div className="text-center my-4">
                        <Spinner variant="primary" animation="border"/>
                    </div> :
                    <PracticeContext.Provider value={{
                        practiceInfo: practiceInfo,
                        practiceProviderInfo:practiceProviderInfo,
                        resetPracticeInfo:resetPracticeInfo,
                        resetPracticeProviderInfo:resetPracticeProviderInfo
                    }}>
                        <div className="py-2 border-top field-container">
                            <PracticeGeneralInformation />
                        </div>

                        <div className="py-2 border-top field-container">
                            <PracticeContactInformation />
                        </div>

                        <div className="py-2 border-top field-container">
                            <PracticeAddress />
                        </div>

                        <div className="py-2 border-top field-container">
                            <PracticeAvailability />
                        </div>

                        <div className="py-2 border-top field-container">
                            <PracticePictures />
                        </div>

                        <div className="py-2 border-top field-container">
                            {/* <PracticeSettings /> */}
                        </div>
                    </PracticeContext.Provider>
            }



        </div>
    </Container>)
}