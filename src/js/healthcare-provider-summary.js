import {
    runtime
} from "./base.js";

import {listjs} from '/gfs/utilities/lib/js/list.js';
import {formjs, bindFormControlEvents, insertValues} from '/gfs/utilities/lib/js/form.js';

const _formjs=new formjs();
const _lists=new listjs();

/** UPLOAD PROFILE IMAGE */

const uploadProfileImg = () => {
    $('#update-profile-img-input').on('change', function (e) {
        
        e.preventDefault();

        if($('#update-profile-img-input').val().length>0){
            
            let files=e.target.files[0];
            files.fieldname="personal_profile_image";

            //console.log(e.target.files);

            let imgData={
                "personal_profile_image-1":files,
                "_id":runtime.userInfo._id
            }
        
            $.ajax({
                "url": '/account/api/user/uploadprofileimage',
                "method": 'POST',
                "data": _formjs.convertJsonToFormdataObject(imgData),
                "processData": false,
                "contentType": false,
            }).done((response) => {
                console.log(response);
                window.location.reload();

            }).fail(function (err) {
                console.log(err);
            });
        }
        
    });
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
    
}

//INITIAL DATA LOAD 
async function dataLoad() {

    try {
        // get user info 
        runtime.userInfo = await runtime.getUserInfo();

        console.log(runtime.userInfo);
        let progress="enrollmentProgress" in runtime.userInfo?runtime.userInfo.enrollmentProgress:0;

        $('.enrolled-percent-txt').text(progress+"%")
                
    } catch (error) {
        console.error(error);
    }
}


$('document').ready(function () {
    
    //Initial Data Load 
    dataLoad().then(r1=>{

        uploadProfileImg();//bind upload profile image 

        $('.edit-item-button').on('click',function(){
            let itemtype=$(this).attr('edititem');

            //hide all pg sections and show only editfom-container section
            $.get(`/edit/${itemtype}`).done(function(ly){
                $('.pg-section').addClass('d-none');
                $('#editform-container').removeClass('d-none').html(ly);
            });
        });

        $('#editform-container').on('click','.cancel-go-back',function(){
            //-- remove the form 
            $(this).closest('.form').remove();

            $('.pg-section').addClass('d-none');
            
            $('#summary-container').removeClass('d-none');
        });
        
    });    
});
