import React, { useContext, useState } from 'react';

import { AppContext } from "../../../AppContext";
import { isClamped } from "@oi/utilities/lib/ui/utils";

import { AboutMeForm } from "./form";

export const ManageAboutMe = () => {

    let AppLevelContext = useContext(AppContext);

    const [showAboutMeForm, setAboutMeFormFlag] = useState(false);
    const [clamped, setClamped] = useState(false);
    const [viewMore, setViewMore] = useState(false);

    let aboutMeContentContainer = React.createRef();

    // useEffect(() => {
    //     setClamped(isClamped(aboutMeContentContainer.current));
    // }, [AppLevelContext.userInfo]);

    const handleViewMoreClick = () => {
        setViewMore(true);
        aboutMeContentContainer.current.classList.remove('line-clamp');
    }

    const handleShowLessClick = () => {
        setViewMore(false);
        aboutMeContentContainer.current.classList.add('line-clamp');
    }

    const handleAfterSubmission=(updatedValue)=>{
        setAboutMeFormFlag(false);
    }

    return (
        <div>
            {
                'aboutMe' in AppLevelContext.userInfo && AppLevelContext.userInfo.aboutMe &&  AppLevelContext.userInfo.aboutMe.length > 0 ?
                    <div className="d-flex flex-row justify-content-between">
                        <div>
                            <div ref={aboutMeContentContainer} className="line-clamp">{AppLevelContext.userInfo.aboutMe} </div>
                            {
                                clamped && !viewMore ?
                                    <div className="btn-link pointer mt-2" onClick={() => { handleViewMoreClick() }}>View More...</div> :
                                clamped && viewMore ?
                                    <div className="btn-link pointer mt-2" onClick={() => { handleShowLessClick() }}>Show Less...</div> :
                                null
                            }
                        </div>
                        <div className="icon-button" onClick={() => { setAboutMeFormFlag(true) }}>
                            <i className="fas fa-pencil-alt"></i>
                        </div>
                    </div> :
                    <div className="btn-link pointer" onClick={() => setAboutMeFormFlag(true)}>Add About Me</div>
            }

            {
                showAboutMeForm ?
                <AboutMeForm 
                    onCloseHandler={()=>{setAboutMeFormFlag(false)}}
                    afterSubmission={handleAfterSubmission}
                /> : null
            }
        </div>
    )
}