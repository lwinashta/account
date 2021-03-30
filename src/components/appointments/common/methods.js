
let dbClickCount=0;
let dblClickTimer={};

export const handleFullCalendarEventDblClick = (clickedItem,singleClickCallback,dblClickCallback) => {
    
    dbClickCount++;

    if(dbClickCount===1){
        dblClickTimer=setTimeout(function(){
            dbClickCount=0;
            singleClickCallback(clickedItem);
        },400);

    }else if(dbClickCount===2){

        clearTimeout(dblClickTimer);
        dbClickCount=0;

        dblClickCallback(clickedItem);
        
    }

}

export const handleDatePickerChange = (date,calendarRef,setStateHandler) => {
    let calendarApi = calendarRef.current.getApi();
    calendarApi.gotoDate(date);
    setStateHandler(date);
}

export const getEachCalendarEventObject = (data, bgColor="") => {
    return {
        "id": data._id,
        "title": data.appointment_type,
        "start": data.appointment_datetime,
        "backgroundColor": bgColor.length>0?bgColor:COLORSCHEME[0],
        "extendedProps": {
            "facilityId": data.facilityId
        }
    };
}

export const getUserPractices = (userId) => {

    return $.ajax({
        "url": '/account/api/heathcarefacilityuser/getbyuserid',
        "processData": true,
        "contentType": "application/json; charset=utf-8",
        "data": {
            "user_mongo_id": userId
        },
        "method": "GET"
    });
}