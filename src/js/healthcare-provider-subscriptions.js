$.getJSON("/gfs/apps/apps.json").done(apps => {

        apps.sort(function (a, b) {
            if (a.name > b.name) return -1;
            return 1;
        });

        apps.filter(a => a.user_types.indexOf("healthcare-provider") > -1).forEach(async (element, indx) => {

            let details = "";

            try {

                details = await $.get(`/gfs/apps/details/${element._id}.html`);

                let html=`<div class="p-3 mt-3 bg-white rounded shadow individual-app-tiles position-relative border" appid="${element._id}"> 
                    <div>
                        <div class="d-inline-block mr-2 align-top">
                            <img style="width:30px" class="mx-auto"  src="/gfs/apps/icons/${element._id}.png">
                        </div>
                        <div class="d-inline-block align-top">
                            <div class="text-capitalize">${element.name}</div>
                            <div><b>$${element.cost.monthly.us_dollars} or ₹${element.cost.monthly.indian_rupees}/ Month</b></div>
                        </div>
                    </div>
                    <div class="push-right">
                        <div class="btn btn-primary pointer">
                            <label class="m-0 pointer">Subscribe</label>
                        </div>
                    </div>
                    <div class="small" style="margin-left:30px;">
                        ${details}
                    </div>

                </div>`;

                $('#subscriptions-per-app-container').append(html);


            } catch (error) {
                console.log(error);

            }

        });



    });