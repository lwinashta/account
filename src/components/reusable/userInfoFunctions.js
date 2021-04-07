//** Submit Updates */
export const submitUserUpdates=(data)=>{
    //console.log(data);
    return $.ajax({
        "url": '/account/api/user/update',
        "data": JSON.stringify(data),
        "processData": false,
        "contentType": "application/json; charset=utf-8",
        "method": "POST"
    });
}

export const uploadUserProfileFiles = (files,userId) => {
        
    //console.log(files);
    let fileData = new FormData();

    Object.keys(files).forEach(key => {
        fileData.append(key, files[key]);
    });

    fileData.append("linked_mongo_id", userId);
    fileData.append("linked_db_name", "accounts");
    fileData.append("linked_collection_name", "users");

    return $.ajax({
        "url": '/file/uploadfiles',
        "processData": false,
        "contentType": false,
        "data": fileData,
        "method": "POST"
    })
}

export const deleteUserProfileFiles = (fileIds) => {
    
    let promises=[];

    fileIds.forEach(_fId=>{

        let _d={
            "linked_db_name":"accounts",
            "linked_collection_name":"users",
            "_id":_fId
        }

        promises.push($.ajax({
            "url": '/file/deletefile',
            "processData": false,
            "contentType": "application/json; charset=utf-8",
            "data": JSON.stringify(_d),
            "method": "POST"
        }));

    });

    return Promise.all(promises);
 
}