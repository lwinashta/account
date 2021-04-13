import React, { useContext } from 'react';
import { OnScreenMessage } from "core/components/popups/web/popups";

export const ValidateAddress = ({
    validatedAddress = null,
    onSubmission = function () { }
}) => { 

    return (<OnScreenMessage >
        <div className="font-weight-bold">Address Verification</div>
        <div className="text-muted">Please verify your address.
            If you choose not to use the recommended address, there is possibility that the practice will not appear for nearby pratients.</div>
        <div className="mt-2" style={{ textAlign: 'left' }}>
            <div>
                {("addressStreet1" in validatedAddress)
                    && validatedAddress.addressStreet1 !== null
                    && validatedAddress.addressStreet1.text !== null ?
                    <span style={validatedAddress.addressStreet1.isMatch ? null : {  color: "red",fontWeight:"bold" }}>{validatedAddress.addressStreet1.text}, </span> : null}
                {("addressStreet2" in validatedAddress)
                    && validatedAddress.addressStreet2 !== null
                    && validatedAddress.addressStreet2.text !== null ?
                    <span style={validatedAddress.addressStreet2.isMatch ? null : { color: "red",fontWeight:"bold" }}>{validatedAddress.addressStreet2.text}, </span> : null}
            </div>

            <div>
                {("city" in validatedAddress)
                    && validatedAddress.city !== null
                    && validatedAddress.city.text !== null ?
                    <span style={validatedAddress.city.isMatch ? null : {  color: "red",fontWeight:"bold" }}>{validatedAddress.city.text}, </span> : null}
                {("state" in validatedAddress)
                    && validatedAddress.state !== null
                    && validatedAddress.state.text !== null ?
                    <span style={validatedAddress.state.isMatch ? null : {  color: "red",fontWeight:"bold" }}>{validatedAddress.state.text}, </span> : null}
                {("zipCode" in validatedAddress)
                    && validatedAddress.zipCode !== null
                    && validatedAddress.zipCode.text !== null ?
                    <span style={validatedAddress.zipCode.isMatch ? null : {  color: "red",fontWeight:"bold" }}>{validatedAddress.zipCode.text}, </span> : null}
            </div>
            <div>
                {("country" in validatedAddress)
                    && validatedAddress.country !== null
                    && validatedAddress.country.text !== null ?
                    <span style={validatedAddress.country.isMatch ? null : {  color: "red",fontWeight:"bold" }}>{validatedAddress.country.text}</span> : null}
            </div>
        </div>

        <div className="mt-2 d-flex flex-row justify-content-end">
            <div className="btn btn-primary pointer" onClick={()=>{onSubmission(validatedAddress,true)}}>Use Recommended Address</div>
            <div className="ml-2 btn btn-link pointer" onClick={()=>{onSubmission(validatedAddress,false)}}>Use entered address</div>
        </div>
    </OnScreenMessage>)

}
