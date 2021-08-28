export const getPracticeInfo = async(query) => {

    try {
        let uri = new URL(window.location.origin + "/account/api/practice/medicalfacility/get");

        Object.keys(query).forEach(key=>{
            uri.searchParams.set(key, query[key]);
        })
        
        uri.searchParams.set("deleted.$boolean", false);

        let response = await fetch(uri);

        return response.json();

    } catch (error) {
        throw new Error("ERROR_FETCHING_PRACTICEINFO");
    }

}