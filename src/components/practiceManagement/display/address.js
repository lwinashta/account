import React from 'react';
import {constructAddress} from '@oi/utilities/lib/ui/utils';

export const DisplayAddress=({
    facilityInfo={}
})=>{
    return (<div>
        {constructAddress(facilityInfo)}
    </div>)
}