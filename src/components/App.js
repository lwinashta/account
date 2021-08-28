import React,{ useEffect, useState } from 'react';
import { BrowserRouter as Router, Switch,Route } from "react-router-dom";

import { GlobalHeader } from "core/components/globalHeader/globalHeader";
import { OnBottomCenter, ScreenLoader,removeLoader } from "core/components/popups/web/popups";
import { getUserInfoFromCookieToken } from "account-manager-module/lib/auth/login/handlers";

import { AppContext } from "./AppContext";
import { AppMenu } from "./common/menu/appMenu";

import { Profile } from "./profile/Profile";
import { ProviderQualification } from './providerQualifications/providerQualification';
import {PracticeManagement} from './practiceManagement/practiceManagement';
import { PracticeEntry } from './practiceManagement/practiceEntry/practiceEntry';

import '../styles/panes.css';
import '../styles/base.css';

const App = () => {

    const [userInfo, setUserInfo] = useState({});
    const [appLoader, setAppLoader] = useState(true);
    const [onScreenLoader,setOnScreenLoader]=useState({
        message:null,
        show:false
    });
    const [popup,setPopup]=useState({
        position:null,
        message:null,
        messageType:null,
        show:false
    });


    useEffect(() => {
        try {
            resetUserInformation()
            .then(response=>setAppLoader(false))
            .catch(err=>{
                //send user to login page
                console.log(err);
            });

        } catch (error) {
            //send user to login page
            
        }

    }, []);

    const resetUserInformation=async()=>{
        try {
            let userInfoRespons=await getUserInfoFromCookieToken();
            setUserInfo(userInfoRespons);
            return "user_information_fetched";

        } catch (error) {
            throw error;
        }
    }

    const updateUserContextInfo=(params)=>{
        let _d={...userInfo};
        _d=Object.assign(_d,params);

        setUserInfo(_d);
    }

    const removeOnScreenLoader=()=>{
        setOnScreenLoader({
            message:null,
            show:false
        });
    }

    const removePopup=()=>{
        setPopup({
            position:null,
            message:null,
            show:false
        })
    }

    return ( 
        <AppContext.Provider value={{
            userInfo: userInfo,
            setUserInfo:setUserInfo,
            resetUserInformation:resetUserInformation,
            updateUserContextInfo:updateUserContextInfo,
            setOnScreenLoader:setOnScreenLoader,
            removeOnScreenLoader:removeOnScreenLoader,
            setPopup:setPopup,
            removePopup:removePopup
        }}>
            <GlobalHeader />

            <Router>
                <div id="app-left-pane-container">
                    <AppMenu />
                </div>
                <div id="app-right-pane-container">
                    {
                        Object.keys(userInfo).length>0?
                        <Switch>
                            <Route exact path="/" component={Profile} />
                            <Route exact path="/provider-qualification" component={ProviderQualification} />
                            <Route exact path="/practice-management" component={PracticeManagement} />
                            <Route path="/practice-management/practice/:practiceId" component={PracticeEntry} />
                        </Switch>:
                        <div>Loading</div>
                    }
                </div>
            </Router> 

            {
                onScreenLoader.show?
                    <ScreenLoader message={onScreenLoader.message} />:
                null
            }

            {
                popup.show?
                    <OnBottomCenter 
                        messageType={popup.messageType}
                        onCloseHandler={()=>{removePopup()}}
                        message={popup.message} />:
                null
            }

        </AppContext.Provider>);
}
 
export default App;