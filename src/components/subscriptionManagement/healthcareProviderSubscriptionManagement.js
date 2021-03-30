import React, { useEffect, useState, useContext } from "react";
import { UserInfo } from "../../contexts/userInfo";
import { MonthlyEliteSubscription } from "./monthlyEliteSubscription";
import { YearlyEliteSubscription } from "./yearlyEliteSubscription";


export const HealthcareProviderSubscriptionManagement = () => {

    return (
        <UserInfo.Consumer>
            {({ subscriptionPlanByCountry = {},
                userCurentLocationByIp = {}
            }) => {
                return <div>

                    <div className="text-center">
                        <h5 >Elite Subscription Plans</h5>
                        <div>Subscribe today to get all that you need to manage your practice.</div>
                    </div>

                    <div className="row mt-2">
                        
                        {/** Monthly Elite Subscription */}
                        <div className="col-sm-12 col-md-6 col-lg-6">

                            <div className="border mt-2 p-2 bg-white rounded position-relative" style={{ height: '180px' }}>
                                <div className="text-center">
                                    <div className="font-weight-bold text-center">Monthly Subscription</div>
                                    <div>
                                        <span>{userCurentLocationByIp.currency.native} {subscriptionPlanByCountry.monthly.price}/ Monthly</span>
                                    </div>
                                </div>
                                <div className="position-absolute w-100" style={{ bottom: '15px' }}>
                                    <MonthlyEliteSubscription />
                                </div>
                            </div>

                        </div>

                        {/** Yearly Elite Subscriptions */}
                        <div className="col-sm-12 col-md-6 col-lg-6">
                            <div className="border mt-2 p-2 bg-white rounded position-relative" style={{ height: '180px' }}>
                                <div className="text-center">
                                    <div className="font-weight-bold ">Yearly Subscription</div>
                                    <div>
                                        <div>
                                            <span style={{ textDecoration: 'line-through' }} className="text-danger">{userCurentLocationByIp.currency.native} 360.00 </span>
                                            <span>{userCurentLocationByIp.currency.native} {subscriptionPlanByCountry.yearly.price} / Yearly  </span>
                                        </div>
                                        <div className="small">Save 10% by subscribing yearly</div>
                                    </div>
                                </div>
                                <div className="position-absolute w-100" style={{ bottom: '15px' }}>
                                    <YearlyEliteSubscription />
                                </div>
                            </div>

                        </div>

                    </div>

                </div>

            }}
        </UserInfo.Consumer>
    );
}