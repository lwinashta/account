import {
    runtime
} from "./base.js";

/** UPLOAD PROFILE IMAGE */

const uploadProfileImg = () => {
    let uploadImgForm = document.getElementById('update-profile-img-form');
    if ($(uploadImgForm).length > 0) {
        uploadImgForm.onsubmit = function (e) {
            e.preventDefault();
            let d = new FormData(uploadImgForm);
            $.ajax({
                "url": '/api/global/account/user/upload-profile-image',
                "method": 'post',
                "data": d,
                "processData": false,
                "contentType": false,
            }).done((response) => {
                console.log(response);
                window.location.reload();

            }).fail(function (err) {
                console.log(err);
            });
        };

        $('#update-profile-img-input').on('change', function (e) {
            if ($(this).val().length > 0) {
                $(this).closest('form').submit();
            }
        });
    }
}

const setSVGPie = function (progress) {
    console.log(progress);
    var circle = document.querySelector('.progress-ring-circle');
    var radius = circle.r.baseVal.value;
    var circumference = radius * 2 * Math.PI;

    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = `${circumference}`;

    var setProgress=function(percent) {
        const offset = circumference - percent / 100 * circumference;
        circle.style.strokeDashoffset = offset;
    }
    
    setProgress(progress);
    $('.enrolled-percent-txt').text(progress+"%")
}

//INITIAL DATA LOAD 
async function dataLoad() {
    try {
        // get user info 
        runtime.userInfo = await runtime.getUserInfo();

        if(!runtime.userInfo.enrolled){
            let progress=1;
            let totalSteps=3;
            
            //check if medical_qualification_done_flag exists ?
            progress+="medical_qualification_details_provided_flag" in runtime.userInfo && runtime.userInfo.medical_qualification_details_provided_flag?1:0;
            
            progress+="practice_info_provided_flag" in runtime.userInfo && runtime.userInfo.practice_info_provided_flag?1:0;

            setSVGPie(Math.round((progress/totalSteps)*100));
        }
                
    } catch (error) {
        console.error(error);
    }
}




$('document').ready(function () {
    //Initial Data Load 
    dataLoad().then(r1=>{
        $.ajax({
            "url":'/account/api/practice/getbyuser',
            "processData": true,
            "contentType": "application/json; charset=utf-8",
            "data":{"user_mongo_id":runtime.userInfo._id},
            "method":"GET"
        }).done(function(d){
            console.log(d);
        });
    });    
});
