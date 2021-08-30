
export const validateAddress = async (values) => {

    try {
        //convert the address into single line 
        let setAddress = `${values.streetAddress1},
            ${values.streetAddress2.length > 0 ? values.streetAddress2 + "," : ""}
            ${values.city},
            ${values.state}, 
            ${values.zipCode}`;

        let googleValidatedAddressesResponse = await fetch('/google/maps/api/getaddresscordinates?address=' + setAddress);

        let googleValidatedAddresses = await googleValidatedAddressesResponse.json();

        console.log(googleValidatedAddresses);

        if(googleValidatedAddresses.json.status==="ZERO_RESULTS") throw new Error("INVALID_ADDRESS");

        let firstValidatedAddress = googleValidatedAddresses.json.results[0];

        let components = firstValidatedAddress.address_components;

        //1. 5 compoenents must match 
        //a. 60% of street, route, "sublocality_level_2" and "sublocality_level_1" match with streetAddress1 + streetAddress2
        //b. "locality" = City
        //c. "administrative_area_level_1": State
        //d. "postal_code" = Zip code
        //e. "country" = country

        let addr = {
            streetAddress: {},
            city: {},
            state: {},
            zipCode: {},
            country: {}
        }

        let streetMatch = matchStreet(values, components);

        if(streetMatch.ok){ 
            addr.streetAddress1={
                value:values.streetAddress1,
                ok:true
            };
            addr.streetAddress2={
                value:values.streetAddress2,
                ok:true
            };
        }else{
            addr.streetAddress1=streetMatch;
        }

        addr.city = exactMatchAddressComponents("locality", values.city, components)
        addr.state = exactMatchAddressComponents("administrative_area_level_1", values.state, components)
        addr.zipCode = exactMatchAddressComponents("postal_code", values.zipCode, components)
        addr.country = exactMatchAddressComponents("country", values.country._id, components)

        return {
            address:addr,
            cordinates:firstValidatedAddress.geometry.location
        };

    } catch (error) {
        throw new Error(error);
    }

}


const getAddressComponents = (components, key) => {
    let v = components.find(c => c.types.indexOf(key) > -1);
    if (v) return v;
    return null;
}

const splitAddressComponentValueForMatch = (value) => {

    if (value) {
        let names = [];

        if (value.long_name) names = names.concat(value.long_name.split(" "));

        if (value.short_name && value.long_name !== value.short_name) {
            value.short_name.split(" ").forEach(element => {
                if (names.indexOf(element) === -1) names.push(element);
            });
        }

        return names.join("|");

    }

    return "";

}

const matchStreet = (values, components) => {

    let street = getAddressComponents(components, "street_number");
    let route = getAddressComponents(components, "route");
    let subLocality1 = getAddressComponents(components, "sublocality_level_1");

    //Create Regex combining all 
    let matchRegEx = [];
    matchRegEx.push(splitAddressComponentValueForMatch(street));
    matchRegEx.push(splitAddressComponentValueForMatch(route));
    matchRegEx.push(splitAddressComponentValueForMatch(subLocality1));

    let streetAddress = (`${values.streetAddress1} ${values.streetAddress2.length > 0 ? values.streetAddress2 : ""}`).replace(/\,/g, " ");

    let regExText = matchRegEx.filter(r => r.length > 0).join("|");

    let matches = streetAddress.match(new RegExp(regExText, 'gi'));

    //console.log(regExText,"-----",streetAddress,"---", matches, "----", streetAddress.split(" ").length);

    if (((streetAddress.split(" ").length / matches.length) * 100) > 60) return {
        value: streetAddress,
        ok: true,
    };

    return {
        ok: false,
        value: `${street.long_name}, ${route.long_name}${subLocality1 ? ", " + subLocality1.long_name : ""}`
    };

}

const exactMatchAddressComponents = (key, value, components) => {
    let v = getAddressComponents(components, key);
    if (v && (v.long_name === value || v.short_name === value)) {
        return {
            value: value,
            ok: true
        }
    } else {
        return {
            value: key!=="country"?v.long_name:v.short_name,
            ok: false
        }
    }
}