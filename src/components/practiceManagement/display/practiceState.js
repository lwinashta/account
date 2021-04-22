import React, { useEffect, useState } from 'react';
const moment=require('moment');

export const PracticeStateInfo = ({ facilityInfo }) => {
    return (<>
        {
            facilityInfo.verificationState === "in_edit_mode" ?
                <div className="ml-2 badge px-4 py-2 badge-pill badge-secondary">In Edit Mode</div> :
                facilityInfo.verificationState === "in_review" ?
                    <div className="ml-2 badge px-4 py-2 badge-pill badge-warning">In Review</div> :
                    facilityInfo.verificationState === "approved" ?
                        <div className="ml-2 badge px-4 py-2 badge-pill badge-primary">Approved</div> :
                        null
        }
    </>)
}

export const PracticeStateDescription = ({facilityInfo}) => {
    
    const[transitionDate,setTransitionDate]=useState("");

    useEffect(()=>{
        setTransitionDate(getVerificationStateTransition(facilityInfo).transitionDate);
    },[]);

    return (<>
        {
            facilityInfo.verificationStateTransitions.length > 0 && facilityInfo.verificationState === "in_edit_mode" ?
            <div className="py-2 border-bottom" >
                In edit mode since <b>{moment(transitionDate).format("DD MMM, YYYY hh:mm a")}</b> ({moment(transitionDate).fromNow()}).
                Please note in order for your practice to be visible to patients or others, the practice need to be reviewed and approved by our compliance team.
                Once you are ready for your practice to be reviewed, please click on <b>"Send for review"</b> button. 
                It generally takes 3 business days for our compliance team to review and validate your practice. 
            </div> :
            facilityInfo.verificationStateTransitions.length > 0 && facilityInfo.verificationState === "in_review" ?
                <div className="py-2 border-bottom" >
                    Submitted for review on <b>{moment(transitionDate).format("DD MMM, YYYY hh:mm a")}</b> ({moment(transitionDate).fromNow()}).
                    Our compliance is reviewing the practice details. 
                    It normally takes 3 business days from day of submission to verify your request. 
                    We will notify you once practice information has ben verified & approved. 
                    Please contact us if the request needs to expedited.
                </div> :
            facilityInfo.verificationStateTransitions.length > 0 && facilityInfo.verificationState === "approved" ?
                <div className="py-2 border-bottom" >
                    This practice was last approved on {moment(transitionDate).format("DD MMM, YYYY hh:mm a")}.
                    <b>Please Note:</b> You can add additional images, update your availability, and practice settings. But, any change to name or address of the faciltiy requires re-approval.
                </div> :
            null
        }
    </>)
}

export const getVerificationStateTransition=(facilityInfo)=>{
    let transitions=facilityInfo.verificationStateTransitions.filter(t=>t.toState===facilityInfo.verificationState)
    .sort((a,b)=>{
        let am=moment(a.transitionDate);
        let bm=moment(b.transitionDate);
        return am.diff(bm)? -1:1;
    });

    return transitions[0];
}