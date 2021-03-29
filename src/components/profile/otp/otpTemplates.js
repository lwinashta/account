export const EmailTemplate=(otp)=>{
    return `<div style="text-align:center">
        <h3 style="color:coral">Email Verification</h3>
        <p style="font-weight:bold">Please verify your email id by entering the One Time Password (OTP) stated in this email. 
            The OTP will expire within 30 mins. Please do not forward or reply to this email.</p>
        <div style="padding: 10px;background-color: dodgerblue;color: white;display: inline-block;border-radius: 5px;font-weight:bold">${otp}</div>
    </div>`;
};

export const SMSTemplate=(otp)=>{
    return `Owninvention verification code: ${otp}. 
    Please enter this code to verify your phoner number. Code expires in 30 minutes.`
}