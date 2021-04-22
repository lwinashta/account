export const getFacilityProviderDataFromServer=async(query)=>{
    try {
        let url = new URL('/account/api/practice/medicalprovider/get',window.location.origin);
        url.searchParams.append("query",JSON.stringify(query));
        url.searchParams.append("expand","facility,facility/files");

        return fetch(url.href);

    } catch (error) {
        console.log(error);
    }
}

export const handleVerificationStateChange = (state,facilityInfo) => {

    let data = {
        _id: facilityInfo._id,
        verificationState: state,
        $push: {
            "verificationStateTransitions.$object": {
                "fromState": facilityInfo.verificationState,
                "toState": state,
                "transitionDate.$date": new Date()
            }
        }
    }

    return fetch('/account/api/practice/medicalfacility/update', {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "content-type": "application/json"
        }
    });
}