import React, { useContext, useState } from 'react';
import {Link,useLocation} from "react-router-dom";
import { AppContext } from "../../AppContext";
import './appMenu.css';

export const AppMenu = () => {

    const {userInfo} = useContext(AppContext);

    let location = useLocation();
    //console.log(location); 
    return (
        <div>
            <Link to="/">
                <div className={`app-menu-item pointer border-bottom ${location.pathname==="/"?"current-app-menu-item":""}`} >
                    <i className="fas fa-home"></i>
                    <div className="menu-text">Profile</div>
                </div>
            </Link>
          
            {
                (userInfo.userType==="healthcare_provider" || userInfo.userType==="patient") ?
                    <React.Fragment>
                        <Link to="/manage-qualification">
                            <div className={`app-menu-item pointer border-bottom ${location.pathname==="/manage-qualification"?"current-app-menu-item":""}`} >
                                <i className="fas fa-university"></i>
                                <div className="menu-text">Provider Qualification</div>
                            </div>
                        </Link>
                        <a href="/practice-management">
                            <div className={`app-menu-item pointer border-bottom ${location.pathname==="/practice-management"?"current-app-menu-item":""}`}>
                                <i className="fas fa-clinic-medical"></i>
                                <div className="menu-text">Practice Management</div>
                            </div>
                        </a>
    
                        <a href="/subscription-management">
                            <div className={`app-menu-item pointer border-bottom ${location.pathname==="/subscription-management"?"current-app-menu-item":""}`}>
                                <i className="fab fa-battle-net"></i>
                                <div className="menu-text">Subscriptions</div>
                            </div>
                        </a>
                    </React.Fragment> :
                    null
            }

            <div className={`app-menu-item pointer border-bottom ${location.pathname==="/appointments"?"current-app-menu-item":""}`}>
                <i className="far fa-calendar-check"></i>
                <div className="menu-text">My Appointments</div>
            </div>


            <div className={`app-menu-item pointer border-bottom ${location.pathname==="/my-visits"?"current-app-menu-item":""}`}>
                <i className="fas fa-glasses"></i>
                <div className="menu-text">My Visits</div>
            </div>
            <div className={`app-menu-item pointer border-bottom ${location.pathname==="/my-labs"?"current-app-menu-item":""}`}>
                <i className="fas fa-vial"></i>
                <div className="menu-text">My Lab Records</div>
            </div>
            <div className={`app-menu-item pointer border-bottom ${location.pathname==="/my-medications"?"current-app-menu-item":""}`}>
                <i className="fas fa-prescription"></i>
                <div className="menu-text">My Medications</div>
            </div>

            <a href="/payment-management">
                <div className={`app-menu-item pointer border-bottom ${location.pathname==="/payment-management"?"current-app-menu-item":""}`}>
                    <i className="far fa-credit-card"></i>
                    <div className="menu-text">Payment & Transactions</div>
                </div>
            </a>

            <div className={`app-menu-item pointer border-bottom ${location.pathname==="/security"?"current-app-menu-item":""}`}>
                <i className="fas fa-user-shield"></i>
                <div className="menu-text">Security</div>
            </div>
        </div>
    );
}