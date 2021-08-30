export const getPracticeInfo = async(query) => {

    try {
        let uri = new URL(window.location.origin + "/account/api/practice/medicalfacility/get");
        console.log(query);

        Object.keys(query).forEach(key=>{
            uri.searchParams.set(key, query[key]);
        })
        
        uri.searchParams.set("deleted.$boolean", false);

        let response = await fetch(uri);

        return await response.json();

    } catch (error) {
        throw new Error("ERROR_FETCHING_PRACTICEINFO");
    }

}

export const getPracticeProviders = async(query) => {

    try {
        let uri = new URL(window.location.origin + "/account/api/practice/medicalprovider/get");

        Object.keys(query).forEach(key=>{
            uri.searchParams.set(key, query[key]);
        })
        
        uri.searchParams.set("deleted.$boolean", false);

        let response = await fetch(uri);

        return await response.json();

    } catch (error) {
        throw new Error("ERROR_FETCHING_PRACTICE_PROVIDER");
    }

}