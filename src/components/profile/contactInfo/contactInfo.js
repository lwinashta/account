import React from 'react';

import { Email } from "./email/email";
import { PhoneNumber } from "./phoneNumber/phoneNumber";


export const ContactInfo = () => {

    return (
        <div className="border rounded bg-white my-2">
            <div className="h3 my-2 px-3 py-2">Contact Info</div>

            <div className="px-3 py-2 border-top field-container">
                <Email />
            </div>

            <div className="px-3 py-2 border-top field-container">
                <PhoneNumber />
            </div>

        </div>);
}