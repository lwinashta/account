export const checkIfAllQualificationEntered=(data)=>{
    let check=0;
    if((('specialties' in data) && data.specialties.length===0) 
        || !('specialties' in data)) check ++;
    
    if(!('medicalRegistration' in data)) check ++;

    if(!('medicalDegrees' in data) || 
        (('medicalDegrees' in data) && data.medicalDegrees.length===0)) check ++;

    return check>0?false:true;
} 

export const checkIfAllowedEdit=(data)=>{
    if(!("qualificationVerificationState" in data) 
        || (("qualificationVerificationState" in data) 
            && data.qualificationVerificationState==="user_edit_mode")){
                return true;
            }
            
    return false
}