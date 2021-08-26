import React from 'react';
import { ProviderContext } from "../../../contexts/provider";

export const DisplayProviderProfilePic=()=>{
    return (<ProviderContext.Consumer>
        {({ provider={}}) => {
            return <div>
                <div className="mx-auto med-img">
                    <img className="rounded-circle border" src={"/file/public/profilepic/" + provider._id} />
                </div>
            </div>
        }}
    </ProviderContext.Consumer>)

}