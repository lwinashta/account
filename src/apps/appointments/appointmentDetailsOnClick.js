import React, { useEffect, useState } from "react";
import { AppointmentContext } from "../../contexts/appoinment";
import { DisplayAppointmentAttendees } from './displayAppointmentAttendees';
import { DisplayAppointmentTitle } from './displayAppointmentTitle';
import { DisplayAppointmentDateTime } from './displayAppointmentDateTime';
import { DisplayAppointmentLocation } from "./displayAppointmentLocation";
import { ConfirmAppointmentButton } from "./confirmAppointmentButton";

export const AppointmentDetailsOnClick = ({clickedEvent={},onCloseHandler=function(){}}) => {

    const [topPos,setTopPos]=useState(0);
    const [leftPos,setLeftPos]=useState(0);
    const [rightPos,setRightPos]=useState(0);
    const [initiated,setInitiated]=useState(false);

    const WIDTH=380;
    let modalRef=React.createRef();

    useEffect(()=>{
        
        //calculate position of the box
        let rect=clickedEvent.el.getBoundingClientRect();

        setTopPos(rect.top);

        //setRightPos((rect.right-rect.left)+rect.width);
        setLeftPos(rect.left-(WIDTH+10));

        setInitiated(true);

    },[]);

    useEffect(()=>{
        if(initiated){
            //Check the total height of the 
            let modalPos=modalRef.current.getBoundingClientRect();

            //get the client height 
            let totalHeight=window.innerHeight;

            if(topPos+modalPos.height>=totalHeight){
                setTopPos(topPos-((topPos+modalPos.height)-(totalHeight))-(modalPos.height/3));
            }

            //If the modalRef is not clicked on mousedDown and none of the children then hide the modelRef
            document.addEventListener('mouseup',function(e){ 
                //console.log(e);
                let container=e.target;
                //console.log(container.closest('div.appointment-onclick-modal'));
                if(container.closest('div.appointment-onclick-modal')===null ){
                    onCloseHandler(false);
                }
            });

        }
    },[initiated])
    
    return (
        <AppointmentContext.Consumer>
            {({
                userInfo={}
            })=>{
                
                return <div ref={modalRef} className="appointment-onclick-modal shadow position-fixed border bg-white rounded p-3" 
                    style={{zIndex:10,'width':WIDTH+'px','top':topPos+'px','left':leftPos+'px'}}>
                    <div className="d-flex">
                        <div className="colored-checkbox mt-2" style={{backgroundColor:clickedEvent.event.backgroundColor}}></div>
                        <div><DisplayAppointmentTitle /></div>
                    </div>
                    <DisplayAppointmentDateTime />
                    <DisplayAppointmentLocation />
                    <div className="mt-2">
                        <b>Attendees</b>
                        <div className="mt-1">
                            <DisplayAppointmentAttendees />
                        </div>
                    </div>
                    <div className="mt-2 p-2 text-right">
                        {
                            userInfo.login_user_type==="healthcare_provider"?
                                <div className="d-inline-block">
                                    <ConfirmAppointmentButton />
                                </div>:null
                        }
                        <div className="d-inline-block btn-link pointer text-primary small ml-2" onClick={()=>onCloseHandler(false)}>Close</div>
                    </div>
                </div>
            }}
        </AppointmentContext.Consumer>
        
    )    
} 