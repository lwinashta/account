import React, { useState } from "react";
import "./displayPractice.css";

export const DisplayVerification=({practiceVerified=false,practiceAffiliationVerified=false})=>{
    return (<div>
        {
            practiceVerified && practiceAffiliationVerified?
            <div className="practice-state" state="completed"> 
                <span className="practice-state-title">Verification Complete</span>
            </div>:
            <div className="practice-state" state="pending">
                <span className="practice-state-title">Pending Verification</span>
            </div>
        }
    </div>)
}