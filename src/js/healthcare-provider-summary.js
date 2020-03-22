import {
    runtime
} from "./base.js";

import {formjs} from '/efs/utilities/lib/js/form.js';
import {managePractices} from './manage-practices.js';

const _formjs=new formjs();
const _managePractice=new managePractices();

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

        //EventHandler: Edit button on the individual edit items
        $('#app-right-pane-container').on('click', '.edit-item-button', function () {
            let itemtype = $(this).attr('edititem');

            //hide all pg sections and show only editfom-container section
            $.get(`/edit/${itemtype}`).done(function (ly) {
                $('.pg-section').addClass('d-none');
                $('#editform-container').removeClass('d-none').html(ly);
            });
            
        });

        //EventHandler: Go back button when user is editing the information 
        $('#app-right-pane-container').on('click', '#editform-container .cancel-go-back', function () {
             
            //-- remove the form 
             $(this).closest('.form').remove();

             $('.pg-section').addClass('d-none');
             
             $('#summary-container').removeClass('d-none');
           
        });

        //load practices 
        _managePractice.container=$('#practices-outer-container');
        _managePractice.init().then(d=>{
            console.log('practices loaded');
        });
        
    });    
});
