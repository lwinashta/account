//MARK THE SELECTED PAGE
$('#homepg-top-nav a[href="/profile"] .hpg-menu-item').addClass('hpg-menu-item-sel');
console.log(window);

//*** INITILIZATION */
const thisPgUriParams=new URLSearchParams(window.location.search.slice(1));
const instanceForm=new formjs();

//**** display details */
const setUserInfoRow=(icon,label,info,edititem)=>{
    if(typeof info==="undefined") info="<i>unknown</i>";

    let editable="editable";
    if(edititem==="email" || edititem==="password"){
        editable="not-editable";
    }
    return `<div class="info-row bg-ws-hv ${editable}" edititem=${edititem}>
        <div class="info-row-icon">
            <i class="material-icons align-middle">${icon}</i>
        </div>
        <div>
            <div class="info-row-content text-capitalize">
                <div>${info}</div>
                <div class="text-muted sm-txt">${label}</div>
            </div>
        </div>
    </div>`;
};

const setUserMultipleInfoRow=(icon,info,edititem)=>{
    if(typeof info==="undefined") info="<i>unknown</i>";
    let editable="editable";
    return `<div class="info-row bg-ws-hv ${editable}" edititem=${edititem}>
        <div class="info-row-icon">
            <i class="material-icons align-middle">${icon}</i>
        </div>
        <div>
        ${info.map(function (v) {
            return `<div class="info-row-content text-capitalize">
                    <div>${v.value}</div>
                    <div class="text-muted sm-txt">${v.label}</div>
                </div>`        
        }).join("")}
        </div>
    </div>`;
};

const setPersonlInfo=function(){

    let fn=setUserInfoRow('person','Name',runtime.userInfo.fullnameLowerCased,"name");
    let passw=setUserInfoRow('fingerprint','Password',"******","password");
    
    $('#profile-personal-info-container').html(fn+passw);
};

const setContactInfo=function(){

    //-- user can have multipe phone numbers 
    if("contact_numbers" in runtime.userInfo){
        runtime.userInfo.mappedPhoneNums=runtime.userInfo.contact_numbers.map((elm)=>{
            return {
                "value":elm.number,
                "label":elm.type
            }
        });
    }else{
        runtime.userInfo.mappedPhoneNums=[{
            "value":'<i>Unknown</i>',
            "label":"Phone"
        }];
    }
    
    let phone=setUserMultipleInfoRow('phone',runtime.userInfo.mappedPhoneNums,"phone");
    let email=setUserInfoRow('email','Email',`<span class="text-lowercase">${runtime.userInfo.emailid}</span>`,"email");
    $('#profile-contact-info-container').html(phone+email);
};

//** edit details */
const setFieldsForEdit=function(title){
    return `<div class="pad-10 profile-sections" id="edit-user-name" edititem="${title}">
        <div class="text-center mgB-L">
            <div class="d-inline-block pad-10 bg-w-hv back-to-details align-middle"><i class="material-icons align-middle">arrow_back</i></div>
            <div class="d-inline-block pad-10 align-middle"><div class="l-txt">Edit ${title}</div></div>
        </div>
        <div class="tile white-tile">
            <div class="form-group">
                <label for="lastname" data-required="1">Last Name </label>
                <input id="lastname" name="lastname" class='form-control' type="text" data-required="1">
            </div>
        </div>
    </div>`;
};

const editItemRouter=(editItem)=>{
    //check if uri has any search params
    if(editItem!==null){
        $('.profile-sections').addClass('hide');//hide all sections
        if($('.profile-sections[edititem="'+editItem+'"]').length>0){
            $('.profile-sections[edititem="'+editItem+'"]').removeClass('hide');//show the section
        }else{
          editInfo[editItem]();  
        }
        
    }else{
        $('#profile-details').removeClass('hide');
    }

}

const editInfo={
    "name":function(){
        let html=`<div class="pad-10 profile-sections" id="edit-user-name" edititem="name">
            <div class="text-center mgB-L">
                <div>
                    <div class="d-inline-block pad-10 bg-w-hv back-to-details align-middle"><i class="material-icons align-middle">arrow_back</i></div>
                    <div class="d-inline-block pad-10 align-middle"><div class="l-txt">Edit name</div></div>
                </div>
                <div class="text-muted">
                    <div>Update your name. This name will be visible in all oi apps.</div>
                    <div>Do not forget to click on <b><i>Update</i></b> button to save the information.</div>
                </div>
            </div>
            <div class="tile white-tile">
                <form id="update-user-name">
                    <div class="form-group">
                        <label for="firstname" data-required="1">First Name </label>
                        <input id="firstname" name="firstname" class='form-control' type="text" data-required="1" value="${runtime.userInfo.firstname}">
                    </div>
                    <div class="form-group">
                        <label for="lastname" data-required="1">Last Name </label>
                        <input id="lastname" name="lastname" class='form-control' type="text" data-required="1" value="${runtime.userInfo.lastname}">
                    </div>
                    
                    <div class="form-group text-center">
                        <button type="submit" class="btn btn-primary">Update</div>
                    </div>
                </form>
            </div>
        </div>`;
        $('section#profile').append(html);
    },
    "refreshContactNumbers":function(){
        return `${'contact_numbers' in runtime.userInfo && runtime.userInfo.contact_numbers.length>0?runtime.userInfo.contact_numbers.map((v)=>{
            return `<div class="inline-dataview">
                <div class="inline-label font-b">${v.type}</div> 
                <div class="inline-value">${v.number}</div> 
                <div class="inline-action delete-phone-number">
                    <i class="material-icons">delete</i>
                </div> 
            </div>`;
        }):"<div class='pad-10 text-muted'>No contact numbers found. Add contact information using the form below.</div>"}`;
    },
    "phone":function(){
        let html=`<div class="pad-10 profile-sections" id="edit-user-phone" edititem="phone">
            <div class="text-center mgB-L">
                <div>
                    <div class="d-inline-block pad-10 bg-w-hv back-to-details align-middle"><i class="material-icons align-middle">arrow_back</i></div>
                    <div class="d-inline-block pad-10 align-middle"><div class="l-txt">Edit Phone</div></div>
                </div>
                <div class="text-muted">
                    <div>Update your phone number(s). You can have multiple phone number assigned</div>
                    <div>Do not forget to click on <b><i>Update</i></b> button to save the information.</div>
                </div>
            </div>
            <div class="tile white-tile">
                ${this.refreshContactNumbers()}
            </div>
            <div class="tile white-tile mgB-T-L">
                <h5>Add Contact</h5>
                <form id="add-new-contact-number">
                    <div class="form-group">
                        <label for="country_code" data-required="1">Country </label>
                        <select id="country_code" name="country_code" class='form-control' data-required="1">
                            <option value=""></option>
                            ${runtime.countries.map((elm)=>{
                               return `<option value="${elm.dial_code}">${elm.name} (${elm.dial_code})</option>`  
                            })}
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="contact_number" data-required="1">Contact Number</label>
                        <input id="contact_number" name="contact_number" class='form-control' type="tel" data-required="1">
                    </div>

                    <div class="form-group">
                        <label for="contact_type" data-required="1">Type</label>
                        <select id="contact_type" name="contact_type" class='form-control' data-required="1">
                            <option value=""></option>
                            <option value="Work">Work</option>
                            <option value="Work">Home</option>
                            <option value="Work">Fax</option>
                            <option value="Work">Other</option>
                        </select>
                    </div>
                    
                    <div class="form-group text-center">
                        <button type="submit" class="btn btn-primary">Update</div>
                    </div>

                </form>
            </div>
        </div>`;
        $('section#profile').append(html);
    }
}

const pushWinState=()=>{
    window.history.pushState({},"history",window.location.origin+window.location.pathname+'?'+thisPgUriParams.toString());
}

const updateUserInfo=(data)=>{
    return $.ajax({
        "url": '/account/api/user/update',
        "processData": false,
        "contentType": false,
        "data": data,
        "method": "POST"
    });
}

//** EXECUTION */

$.post('/api/global/account/user/bytoken').then(function(userinfo){

    runtime.userInfo=userinfo;
    
    return $.get('/gfs/utilities/countries.json');
    
}).then(function(countries){

    runtime.countries=countries;
    console.log(countries);
    
    setPersonlInfo();
    setContactInfo();

    editItemRouter(thisPgUriParams.get('edititem'));
    
    $('section#profile').on('click','.back-to-details',function(){
        $('.profile-sections').addClass('hide');//hide all sections
        $('#profile-details').removeClass('hide');

        //remove the edit item from url and push state 
        thisPgUriParams.delete('edititem');

        pushWinState();
    });

    $('#profile-details').on('click','.editable',function(){

        let edititem=$(this).attr('edititem');

        if(!thisPgUriParams.has('edititem')){
            thisPgUriParams.set('edititem',edititem);
        }
        pushWinState();
        editItemRouter(edititem);
    });

    //BIND FORMS
    $('section#profile').on('submit', 'form',  function (e) {
        e.preventDefault(); //dont refrehs the page for all forms 
    });

    //-- Submit username update ---
    $('section#profile').on('submit','#update-user-name',async function(e){
        instanceForm.form = this;
        try {
            //-- check form validation -- 
            let d1 = await instanceForm.validateForm(this);

            //get data 
            let data = new FormData(this);

            let exeUpdate = await updateUserInfo(data);

            window.location.assign('/profile');

        } catch (err) {
            console.error(err);
        }
    });

    //add new phone number -- 
    $('section#profile').on('submit','#add-new-contact-number',async function(e){
        instanceForm.form = this;
        try {
            //-- check form validation -- 
            let d1 = await instanceForm.validateForm(this);

            //get data 
            let data = new FormData(this);

            let exeUpdate = await updateUserInfo(data);

            window.location.assign('/profile');

        } catch (err) {
            console.error(err);
        }
    });

});

