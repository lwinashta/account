import React, { useContext, useEffect, useState } from "react";
import { UserInfo } from "../../contexts/userInfo";
import { CreateUpdateSubscription } from "./createUpdateSubscription";
import { CancelSubscription } from "./cancelSubscription";

export const YearlyEliteSubscription = () => {
    const BILLINGFREQUENCY = "yearly";
    const SUBSCRIPTIONNAME="elite subscription";
    return (
        <UserInfo.Consumer>
            {({
                subscriptionPlanByCountry={},
                userPaymentAccount={},
                userSubscriptions={}
            }) => {
                return <div>
                    <CreateUpdateSubscription 
                        planBillingFrequency={BILLINGFREQUENCY} 
                        subscriptionName={SUBSCRIPTIONNAME} />
                    <CancelSubscription 
                        planBillingFrequency={BILLINGFREQUENCY} 
                        subscriptionName={SUBSCRIPTIONNAME} />
                </div>

            }}
        </UserInfo.Consumer>
    )
}