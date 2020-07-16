import React from "react";
const apps = require('../../../../efs/subscriptions/apps.json');

export const HealthcareProviderApps=()=>{
    return (
        <div>
            {apps.length>0?
                <div className="d-flex flex-wrap">
                    {
                        apps.map(app=>{
                            return <div key={app._id} className="responsive-tile-2 text-left ml-2 mt-2 border bg-white rounded p-2" style={{"width":"250px","height":"150px"}}>
                                <div>
                                    <img src={"/efs/subscriptions/icons/"+app._id+".png"} style={{width:"30px"}}/>
                                    <div className="ml-3 d-inline-block font-weight-bold text-uppercase">{app.name}</div> 
                                </div>
                                <div className="mt-2 text-muted small">{app.description}</div>
                            </div>
                        })
                    }
                    
                </div>:null
            }
        </div>
    )
}