import React, { useContext } from 'react';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { AppContext } from "../AppContext";

import { BasicInfo } from "./basicInfo/basicInfo";
import { ContactInfo } from "./contactInfo/contactInfo";
import { Addresses } from "./addresses/addresses";
import {Insurances} from "./insurance/insurances"

export const Profile = () => {

    let AppLevelContext = useContext(AppContext);

    return (
        <div className="container-fluid mt-2">
            {
                Object.keys(AppLevelContext.userInfo).length > 0 ?
                    <Row>

                        <Col>
                            <BasicInfo />

                            <ContactInfo />

                            <Addresses />
                        </Col>

                        <Col>
                            <Insurances />
                        </Col>
                    </Row> :
                    null
            }
        </div>
    );
}