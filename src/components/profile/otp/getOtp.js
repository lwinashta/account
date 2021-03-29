import { getCookie } from "@oi/utilities/lib/cookie/cookie";

export const getOTP = async () => {
    try {
        //Get user Token 
        let tokenDataAsString = getCookie("userToken");

        //console.log(tokenDataAsString);
        if (tokenDataAsString === null) throw "no_token_found";

        let tokenDataAsJson = JSON.parse(tokenDataAsString);

        let base64EncodedToken = btoa(tokenDataAsJson.token);

        let otpResponse= await fetch('/account/api/user/getotp', {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "Authorization": `token ${base64EncodedToken}`
            }
        });

        return otpResponse.json();//convert the response to json format 

    } catch (error) {
        console.log(error);
        throw error;
    }

}