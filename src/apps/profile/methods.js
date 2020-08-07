import React from "react";

export const DisplayItem=({item="",indx=null})=>{
    return ( <div className="small bg-lgrey border text-capitalize rounded pr-2 pl-2 pt-1 pb-1 mt-1 mr-2">{item}</div>);
}

export const DisplayItemAsString=(item,_id)=>{
    return ( `<div _id="${_id}" class="item bg-lgrey text-capitalize border rounded pr-2 pl-2 pt-1 pb-1 mt-1 mr-2">
        <div class="d-inline-block align-middle">${item}</div>
        <div class="d-inline-block btn-link text-danger align-middle remove-item pointer">
            <i class="fas fa-times"></i>
        </div>
    </div>`);
}