import React, { useContext } from 'react';
import {Link} from "react-router-dom";
import { AppContext } from "../../AppContext";
import './appMenu.css';

export const AppMenu = () => {

    const AppLevelContext = useContext(AppContext);

    const isCurrentMenu = (name) => {
        if(window.location.href.includes(name)) return true;
        return false;
    }
     
    return (
        <div>
            <Link to="/">
                <div className={`px-3 py-2 app-menu-item pointer border-bottom ${isCurrentMenu("/home")?"current-app-menu-item":""}`} >
                    <i className="fas fa-home"></i>
                    <div>Home</div>
                </div>
            </Link>
            <div className={`px-3 py-2 app-menu-item pointer border-bottom ${isCurrentMenu("/appointments")?"current-app-menu-item":""}`}>
                <i className="far fa-calendar-check"></i>
                <div>My Appointments</div>
            </div>
            {
                AppLevelContext.userInfo.isHealthcareProvider ?
                    <React.Fragment>
                        <a href="/practice-management">
                            <div className={`px-3 py-2 app-menu-item pointer border-bottom ${isCurrentMenu("/practice-management")?"current-app-menu-item":""}`}>
                                <i className="fas fa-clinic-medical"></i>
                                <div>Practice Management</div>
                            </div>
                        </a>

                        <a href="/payment-management">
                            <div className={`px-3 py-2 app-menu-item pointer border-bottom ${isCurrentMenu("/payment-management")?"current-app-menu-item":""}`}>
                                <i className="far fa-credit-card"></i>
                                <div>Payment & Transactions</div>
                            </div>
                        </a>

                        <a href="/subscription-management">
                            <div className={`px-3 py-2 app-menu-item pointer border-bottom ${isCurrentMenu("/subscription-management")?"current-app-menu-item":""}`}>
                                <i className="fab fa-battle-net"></i>
                                <div>Subscriptions</div>
                            </div>
                        </a>
                    </React.Fragment> :
                    null
            }
            <div className={`px-3 py-2 app-menu-item pointer border-bottom ${isCurrentMenu("/my-visits")?"current-app-menu-item":""}`}>
                <i className="fas fa-glasses"></i>
                <div>My Visits</div>
            </div>
            <div className={`px-3 py-2 app-menu-item pointer border-bottom ${isCurrentMenu("/my-labs")?"current-app-menu-item":""}`}>
                <i className="fas fa-vial"></i>
                <div>My Lab Records</div>
            </div>
            <div className={`px-3 py-2 app-menu-item pointer border-bottom ${isCurrentMenu("/my-medications")?"current-app-menu-item":""}`}>
                <i className="fas fa-prescription"></i>
                <div>My Medications</div>
            </div>
            <div className={`px-3 py-2 app-menu-item pointer border-bottom ${isCurrentMenu("/security")?"current-app-menu-item":""}`}>
                <i className="fas fa-user-shield"></i>
                <div>Security</div>
            </div>
        </div>
    );
}