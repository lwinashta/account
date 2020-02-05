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

        //set enrollment progress 
        if(!runtime.userInfo.enrolled){

            let progress=1;
            let totalSteps=3;

            progress+="qualification_provided" in runtime.userInfo && runtime.userInfo.qualification_provided?1:0;
            progress+="practice_info_provided" in runtime.userInfo && runtime.userInfo.practice_info_provided?1:0;

            setSVGPie(Math.round((progress/totalSteps)*100));
        }

    } catch (error) {
        console.error(error);
    }
}




$('document').ready(function () {
    dataLoad(); // Trigger data load 
    //TRIGGER FUNCTIONS ON LOAD
    uploadProfileImg();
});
