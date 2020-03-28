import {
    runtime
} from "./base.js";

import {
    listjs
} from '/efs/utilities/lib/js/list.js';

import {formjs, bindFormControlEvents, insertValues} from '/efs/utilities/lib/js/form.js';

import {healthcareProviderActions as actions} from './healthcare-provider-form-actions.js';

const _lists = new listjs();
const _insertValues=new insertValues();

export class providerQualification{
    
    constructor(values){
        this.container={};
        this.medicalDegrees=[];
        this.medicalCouncils=[];

        //*** INITIALIZE VARIABLES */
        this._formjs=new formjs();

        let self=this;
        self=Object.assign(this,values);

        this._bindEvents=new bindFormControlEvents({
            "formData": self._formjs.formData//reference variable
        });
    }

    async init(){
        let self=this;

        //--display the form -- 
        $(self.container).on('click','.add-provider-qualification-button',function(){
            
            let itemtype = $(this).attr('edititem');

            //hide all pg sections and show only editfom-container section
            $.get(`/edit/${itemtype}`).done(function (ly) {
                
                $('.pg-section').addClass('d-none');
                $('#editform-container').removeClass('d-none').html(ly);

                let form=$('#provider-qualification-form');

                //bind all the fields in the form 
                self.bindFormFields(form).then(d=>{
                    console.log("--binded--");
                });

            });
            
        });

    }

    async bindFormFields(form){

        let self=this;

        //--- set Medical Degree -- 
        let setMedicalDegreeCF=await actions.bindFields.setMedicalDegressComboField($(form).find('#medical-degree-search-container'))

        //-- Set Medical Council -
        let medicalCouncilCF=await actions.bindFields.setMedicalCouncilComboField($(form).find('#medical-registration-council-search-container'));
        
         //-- Set languages -- 
        let setLanguagesCF=await actions.bindFields.setLanguageComboField($(form).find('#known-languages-search-container'));

        //-- Year Drop down --- 
        actions.bindFields.setYearDropDownField($(form).find('.years-dropdown'));

        //drag and drop files 
        self._bindEvents.container = $(form);

        //callback when file is dropped or slected 
        self._bindEvents.onFileSelection=function(elm, name, files){

            $.each(files, (indx, file) => {
                let fileObj = {};
                fileObj[name + '-' + indx] = file;
                fileObj[name + '-' + indx].fieldname = name;

                self._bindEvents.formData= Object.assign(self._bindEvents.formData, fileObj);

            });
        };

        //bind the drag and drop file field
        self._bindEvents.dragDropFileContainer();

        $(form).find('.done-button').click(function(){
            
            self.addProviderQualification(form);

         });
    }

    addProviderQualification(form){
        let self=this;

        try {
            popup.onScreen("Saving qualification details");

            let errCount=self._formjs.validateForm($(form),'entry-field');

            if(errCount>0) throw 'validation error';

           //-- save the information 
           $(form).find('.entry-field').each(function(){
                self._formjs.formData=Object.assign(self._formjs.formData,self._formjs.getFieldData(this));
            });
            console.log(self._formjs.formData);

            //save this information in the db
            let data = self._formjs.convertJsonToFormdataObject(self._formjs.formData);
            data.append("_id",$(form).attr('userid'));

            $.ajax({
                "url": '/account/api/user/update',
                "processData": false,
                "contentType": false,
                "data": data,
                "method": "POST"

            }).then(u=>{
                console.log(u);
                window.location.reload();

            }).catch(error=>{
                popup.remove();
                alert("error");
                console.log(error);
            });

        } catch (error) {
            popup.remove();
            console.log(error);
        }
        
    }
}