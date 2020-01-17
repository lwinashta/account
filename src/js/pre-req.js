
$('document').ready(function(){

    //insert all the drop downs options
    $('#tabs-container').on('click','.tab-enabled',function(){

        //hide all form container
        $('.form-content-container').hide();

        //show the element selected 
        let showel=$(this).attr('showel');
        $(`#${showel}`).show();

        //add checkmark 
        $('#tabs-container').find('.tabs .btn-rounded-sides').removeClass('bg-info');

        $(this).find('.btn-rounded-sides').addClass('bg-info');

    });

    $('.tabs[showel="heathcare-provider-personal-info-form"]').trigger('click');

    let _bindEvents = new bindFormControlEvents();
    _bindEvents.container = $('#form-parent-content-container');
    _bindEvents.dragDropFileContainer();

    let _lists = new listjs();

    //get countries 
    _lists.getCountries().done(countries => {

        countries=countries.sort(function(a,b){
            if(a.name>b.name) return 1;
            return -1;
        });

        let optionDialCodeHtml="<option value=''>Select country code</option>";
        let countryNameHtml="<option value=''>Select country</option>";

        countries.forEach(c => {
            optionDialCodeHtml+=`<option value="${c._id}">${c.name} (${c.dial_code}) </option>`;
            countryNameHtml+=`<option value="${c._id}">${c.name}</option>`
        });

        //add data to all the fields related to countries 
        $('#form-parent-content-container').find('.country-dial-code-option-list').html(optionDialCodeHtml);
        $('#form-parent-content-container').find('.country-name-option-list').html(countryNameHtml);
        
    });

    _lists.getMedicalSpecialties().done(specialties => {

        specialties=specialties.sort(function(a,b){
            if(a.name>b.name) return 1;
            return -1;
        });

        specialties.map(m=>m.name=capitalizeText(m.name));

        let specialtiesHtml="<option value=''> - Select specialty - </option>";

        specialties.forEach(c => {
            specialtiesHtml+=`<option class="text-capitalize" value="${c._id}">${c.name}</option>`;
        });

        //add data to all the fields related to countries 
        $('#form-parent-content-container')
            .find('.specialty-option-list')
            .html(specialtiesHtml);
        
    });

    _lists.getLanguages().done(languages => {

        languages=languages.sort(function(a,b){
            if(a.name>b.name) return 1;
            return -1;
        });

        specialties.map(m=>m.name=capitalizeText(m.name));

        let specialtiesHtml="<option value=''> - Select specialty - </option>";

        specialties.forEach(c => {
            specialtiesHtml+=`<option class="text-capitalize" value="${c._id}">${c.name}</option>`;
        });

        //add data to all the fields related to countries 
        $('#form-parent-content-container')
            .find('.specialty-option-list')
            .html(specialtiesHtml);
        
    });

    //bind next buttn 
    $('.next-button').click(function(){

        let nextStep=parseFloat($(this).attr('nextstepnum'));

        let tab=$('.tabs[stepnum="'+nextStep+'"]');
        //console.log(nextStep,$(tab).length);
        if ($(tab).length > 0) {

            //--- check if show el exists for the tab -- 
            if (!$(tab).hasClass('tab-enabled') && $(tab).hasClass('tab-disabled')) {
                $(tab).removeClass('tab-disabled').addClass('tab-enabled');
            }

            $(tab).trigger('click')
                .find('.btn-rounded-sides')
                .removeClass('bg-light text-muted')
                .addClass('bg-primary');

        }else{
            //--- just show the tab 
            //hide all form container
            $('.form-content-container').hide();

            $('.form-content-container[stepnum  ="'+nextStep+'"]').show();

        }

    });

});