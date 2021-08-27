import React, { useState, useEffect, useContext } from 'react';

import { Name } from "./name/name";
import { ProfilePic } from "./profilePic/profilePic";
import { Gender } from './gender/gender';
import { BirthDate } from './birthDate/birthDate';

export const BasicInfo = () => {

    return (
        <div className="border rounded bg-white my-3">
            <div className="h3 my-2 px-3 py-2">Basic Info</div>

            <div className="px-3 py-2 border-top field-container">
                <Name />
            </div>

            <div className="px-3 py-2 border-top field-container">
                <ProfilePic />
            </div>

            <div className="px-3 py-2 border-top field-container">
                <Gender />
            </div>

            <div className="px-3 py-2 border-top field-container">
                <BirthDate />
            </div>

        </div>);
}