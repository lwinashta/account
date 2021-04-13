
export class AddressVerification{

    constructor(values){
        this.enteredAddress=values.enteredAddress;
        this.googleVerifiedAddress=null;
    }

    contructAddress() {
        let enteredAddress=this.enteredAddress;
        return `${enteredAddress.addressStreet1},
            ${enteredAddress.addressStreet2 !== null ? enteredAddress.addressStreet2 + "," : ""}
            ${enteredAddress.city},
            ${enteredAddress.state}, 
            ${enteredAddress.zipCode}`;
    }

    getGoogleAddressComponent(key){
        return this.googleVerifiedAddress.address_components.find(addr => addr.types.indexOf(key) > -1);
    }

    async getGoogleAddress() {
        try {
            let addr = this.contructAddress(this.enteredAddress);
            let response= await fetch('/google/maps/api/getaddresscordinates?address=' + addr);
            let data=await response.json();
            
            if (data.json.results.length === 0) {
                throw new Error("invalid_address");
            }
            console.log(data.json.results[0]);
            return data.json.results[0];//Get first result 

        } catch (error) {
            throw error;
        }
    }


    //Matches the locality and if the locality matches 50%. We considered it to match
    isAddressLocalityMatch(){

        let enteredAddress=this.enteredAddress;
        //contruct entred address locality 
        let enteredAddrLocatlity=`${enteredAddress.addressStreet1}
            ${enteredAddress.addressStreet2 !== null ? ", "+enteredAddress.addressStreet2 : ""}`;
        
        enteredAddrLocatlity=enteredAddrLocatlity
            .replace(/\n/g,"")
            .split(', ')
            .map(item=>item.replace(/\s*$/,""))
            .join(", ");

        //contruct google address locality 
        let streetName=this.getGoogleAddressComponent("street_number");
        let route=this.getGoogleAddressComponent("route");
        let subLocality1=this.getGoogleAddressComponent("sublocality_level_2");
        let subLocality2=this.getGoogleAddressComponent("sublocality_level_1");

        let googleAddressLocality=`${streetName!==undefined?streetName.long_name:""}
            ${route!==undefined?", "+route.long_name:""}
            ${subLocality1!==undefined?", "+subLocality1.long_name:""}
            ${subLocality2!==undefined?", "+subLocality2.long_name:""}`;

        googleAddressLocality=googleAddressLocality
            .replace(/\n/g,"")
            .split(', ')
            .map(item=>item.replace(/\s*$/,""))
            .join(", ");

        let totalItmesToMatch=enteredAddrLocatlity.split(/\s/g).length;
        let matches=0;

        googleAddressLocality.split(', ').forEach(item=>{
            let reg=new RegExp(item.replace(/\s/g,"|"),'ig');
            //console.log(reg);

            let checkMatch=enteredAddrLocatlity.match(reg);
            //console.log(checkMatch);

            if(checkMatch!==null){
                matches+=checkMatch.length;
            }
        });
        //console.log(matches,totalItmesToMatch);
        if(matches/totalItmesToMatch>0.5) return true

        return false;

    }

    matchAddressComponent(enteredAddressProp, googleComponent,exactMatch=false){
        let _d={
            text:null,
            isMatch:true
        };
    
        let componentValue=this.getGoogleAddressComponent(googleComponent);
    
        if(componentValue!==undefined){

            let enteredAddrComponent=this.enteredAddress[enteredAddressProp];
            //console.log(enteredAddrComponent);
            if((('long_name' in componentValue) 
                && componentValue.long_name.toLowerCase()===enteredAddrComponent.toLowerCase()) || 
                (('short_name' in componentValue) 
                && componentValue.short_name.toLowerCase()===enteredAddrComponent.toLowerCase()) ){
                _d.isMatch=true;
                _d.text= enteredAddrComponent;    
            }else{
                _d.isMatch=false;  
                _d.text=('long_name' in componentValue)? componentValue.long_name:
                    ('short_name' in componentValue)?componentValue.short_name:
                null;
            }
    
        }else if(componentValue.length === 0 && exactMatch){
            throw new Error("Address invalid");
        
        }else if(componentValue.length === 0 && !exactMatch){
            _d.text=this.enteredAddress[enteredAddressProp];
        }

        return _d;
    }

    async init(){

        try {
            //set googel address 
            //google address is 
            this.googleVerifiedAddress = await this.getGoogleAddress();

            let localityMatch=this.isAddressLocalityMatch();

            let streetName=this.getGoogleAddressComponent("street_number");
            let route=this.getGoogleAddressComponent("route");
            let subLocality1=this.getGoogleAddressComponent("sublocality_level_2");
            let subLocality2=this.getGoogleAddressComponent("sublocality_level_1");

            return {
                addressStreet1:localityMatch?{
                    text:this.enteredAddress.addressStreet1,
                    isMatch:true
                }:{
                    text:streetName.long_name+" "+route.long_name,
                    isMatch:false
                },
                addressStreet2:this.enteredAddress.addressStreet2!==null?
                    localityMatch?{
                        text:this.enteredAddress.addressStreet2,
                        isMatch:true
                    }:{
                        text:subLocality1.long_name+", "+subLocality2.long_name ,
                        isMatch:false
                    }:
                    null,
                city:this.matchAddressComponent("city","locality",true),
                state:this.matchAddressComponent("state","administrative_area_level_1",true),
                zipCode:this.matchAddressComponent("zipCode","postal_code",true),
                country:Object.assign(this.matchAddressComponent("country","country",true),{
                    _id:this.getGoogleAddressComponent("country").short_name
                }),
                cordinates:this.googleVerifiedAddress.geometry.location
            };

        } catch (error) {
            throw error;
        }
        
    }

}