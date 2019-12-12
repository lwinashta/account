const instanceForm= new formjs();

$('.password-field').keyup(function(){
    instanceForm.validatePassw(this);
});

const checkCurrentPassw=(passw)=>{
    return $.post('/account/api/user/checkpassw',{
        "passw":passw
    });
};

$('#reset-user-passw').on('submit',  async function (e) {
    e.preventDefault(); //dont refrehs the page for all forms 
    try {
        //-- check form validation -- 
        let d1 = await instanceForm.validateForm(this);

        //get data 
        let data = new FormData(this);

        //check if new passw and repeat passw are same 
        let newPassw=data.get('new_passw');
        let repeatNewPass=data.get('repeat_new_passw');

        if(newPassw!==repeatNewPass){
            $(this).find('[name="new_passw"]')
                .closest('.form-group')
                .append(`<div class="required-err">New Password and re-entered password doesnt match</div>`);
                            
            throw "New Password and re-entered password doesnt match";

        }

        //check if current passw is correct 
        let check=await checkCurrentPassw(data.get('current_passw'));

        //console.log(check);

        if(check.length===0){
            $(this).find('[name="current_passw"]')
                .closest('.form-group')
                .append(`<div class="required-err">Current password incorrect</div>`);
                            
            throw "Incorrect current password";
        }

        //all check are correct - update the passw
        //content type must be json and json must be send as string 
        let exeUpdate = await $.ajax({
            "url": '/account/api/user/update',
            "processData": false,
            "contentType": "application/json; charset=utf-8",
            "data": JSON.stringify({
                "password":data.get('current_passw')
            }),
            "method": "POST"
        });

        //get settings to get the home page settings
        let settings=await $.getJSON('/gfs/sys-settings/config/config.json');

        //-- update made successfully. 
        window.location.assign(`${settings.website}/logout`);

    } catch (err) {
        console.error(err);
    }
});