import React, { useContext, useEffect,useState } from 'react';
import { UserInfo } from "./../../contexts/userInfo";
import { Modal } from "@oi/reactcomponents";
import {submitUserUpdates} from './../reusable/userInfoFunctions';


export const ManageAboutMe = () => {

    let contextValues=useContext(UserInfo);
    const [showAboutMeForm, setAboutMeFormFlag] = useState(false);

    const [aboutMe,setAboutMe]=useState('aboutme' in contextValues.userInfo?contextValues.userInfo.aboutme:null);
    const [clamped,setClamped]=useState(false);
    const [viewMoreClicked,setviewMoreClicked]=useState(false);

    let aboutMeContentContainer=React.createRef();

    useEffect(()=>{
        if(aboutMe!==null && aboutMe.length>0){
            setClamped(isClamped(aboutMeContentContainer.current));
        } 
    },[aboutMe]);

    const handleAboutMeUpdate=(e)=>{
        
        e.preventDefault();
        popup.onScreen("Updating...");

        let form=e.target;
        let aboutme=$(form).find('textarea[name="aboutme"]').val();

        submitUserUpdates({
            aboutme:aboutme,
            "_id":contextValues.userInfo._id

        }).then(response=>{

            popup.remove();
            popup.onBottomCenterSuccessMessage("About Me updated");

            setAboutMeFormFlag(false);
            setAboutMe(aboutMe);

            contextValues.updateUserInfoContext({
                aboutme:aboutme
            });
        }).catch(err=>{
            popup.remove();
            console.log(err);
            popup.onBottomCenterErrorOccured("Error while updating the info. Try again.");
        });
    }

    const handleViewMoreClick=()=>{
        setviewMoreClicked(true);
        $(aboutMeContentContainer.current).removeClass('line-clamp');
    }

    const handleShowLessClick=()=>{
        setviewMoreClicked(false);
        $(aboutMeContentContainer.current).addClass('line-clamp');
    }

    return (
        <UserInfo.Consumer>
            {({ userInfo = {} }) => {
                return <div>
                    {
                        'aboutme' in userInfo && userInfo.aboutme.length>0?
                            <div className="position-relative mt-2 small"> 
                                <div className="push-right" style={{top: '-10px'}}>
                                    <div className="btn-link pointer" onClick={()=>setAboutMeFormFlag(true)}>Edit</div>
                                </div>
                                <div ref={aboutMeContentContainer} className="line-clamp">{userInfo.aboutme} </div>
                                {
                                    clamped && !viewMoreClicked?
                                    <div className="btn-link pointer mt-2" onClick={()=>{handleViewMoreClick()}}>View More...</div>:
                                    clamped && viewMoreClicked?
                                    <div className="btn-link pointer mt-2" onClick={()=>{handleShowLessClick()}}>Show Less...</div>:
                                    null
                                }
                            </div>: 
                        !('aboutme' in userInfo) || ('aboutme' in userInfo && userInfo.aboutme.length===0)?
                            <div className="mt-2"> 
                                <div className="small mb-1 mt-1 btn-link pointer" 
                                    onClick={()=>setAboutMeFormFlag(true)}>Add About Me</div>
                            </div>:
                            null
                    }

                    {
                        showAboutMeForm ?
                            <Modal
                                header={<h4> About Me </h4>}
                                onCloseHandler={() => { setAboutMeFormFlag(false) }}>
                                <form onSubmit={(e) => { handleAboutMeUpdate(e) }}>
                                    <div className="text-muted">
                                        Enter few sentences to describe yourself and your experience. 
                                        This information will be visible on your profile page.
                                    </div>
                                    <div className="form-group mt-2">
                                        <textarea id="aboutme"
                                            name="aboutme" className='form-control entry-field'
                                            data-required="1" placeholder="Enter somethign about yourself"
                                            autoComplete="off" defaultValue={userInfo.aboutme} />
                                    </div>
                                    <div className="mt-2 text-center">
                                        <button className="btn btn-primary w-75" type="submit">Save Information</button>
                                    </div>
                                </form>
                            </Modal> : null
                    }
                </div>

            }}
        </UserInfo.Consumer>
    )
}