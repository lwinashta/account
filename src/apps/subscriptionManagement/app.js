import React, { useEffect, useState } from "react";
import { UserInfo } from "./../../contexts/userInfo";
import { HealthcareProviderApps } from "./healthcareProviderApps";
import { HealthcareProviderSubscriptionManagement } from "./healthcareProviderSubscriptionManagement";

export const App = () => {

    const [appLoader, setAppLoader] = useState(true);

    const [userInfo, setUserInfo] = useState({});
    const [userPaymentAccount, setUserPaymentAccount]=useState({});
    const [userSubscriptions, setUserSubscriptions]=useState({
        fetched:false,
        subscriptions:[]
    });

    const [storedUserAccountSubscriptions,setStoredUserAccountSubscriptions]=useState([]);

    const [userCurentLocationByIp, setUserCurrentLocationByIp] = useState({});
    const [subscriptionPlans, setSubscriptionPlans] = useState([]);

    const [subscriptionPlanByCountry,setCountryPackageInfo]=useState([]);

    /**
     * @Gathering @useEffects Dataset
     */
    //1a. get UserInfo
    //1b. get Plans -Companys subscription plans 
    //2. Once userInfo is fetched, get user payment information using users's registration number
    //3. Once user payment information is fetched, get user subscriptions from the user credit card on file 
    //4. Once subscriptions are fetched - set AppLoader to false 
    useEffect(() => {

        Promise.all([getUserInfo(), getUserLocationByIp(), getPlans()]).then(values => {
            console.log(values);

            setUserInfo(values[0]);
            setUserCurrentLocationByIp(values[1]);
            setSubscriptionPlans(values[2].plans);

        });

    }, []);

    useEffect(()=>{

        if(subscriptionPlans.length>0 && Object.keys(userCurentLocationByIp).length>0 && Object.keys(userInfo)){

            //Set the package and currency
            if (userCurentLocationByIp.country_code === "IN"){
                setCountryPackageInfo({
                    "monthly":subscriptionPlans.filter(p => p.id === "ELITE_PKG_MO_INR")[0],
                    "yearly":subscriptionPlans.filter(p => p.id === "ELITE_PKG_YEARLY_INR")[0],
                    "merchantAccountId":"owninvention_India"
                });
            }

            if (userCurentLocationByIp.country_code === "US"){
                setCountryPackageInfo({
                    "monthly":subscriptionPlans.filter(p => p.id === "ELITE_PKG_MO_US")[0],
                    "yearly":subscriptionPlans.filter(p => p.id === "ELITE_PKG_YEARLY_US")[0],
                    "merchantAccountId":"owninvention"
                });
            }

            //Get the payment methods for the user 
            Promise.all([getUserPaymentAccount(),getStoredUserAccountSubscriptions()]).then(values=>{
                console.log(values);

                let pym=values[0];
                setUserPaymentAccount(pym);

                if(Object.keys(pym).length>0 && pym.creditCards.length>0){
                    //console.log(getUserSubscriptions(pym));
                    setUserSubscriptions({
                        fetched:true,
                        subscriptions:getUserSubscriptions(pym)
                    });

                }else{
                    setUserSubscriptions({
                        fetched:true,
                        subscriptions:[]
                    })
                }

                setStoredUserAccountSubscriptions(values[1]);

            });
        }

    },[subscriptionPlans,userCurentLocationByIp,userInfo]);

    useEffect(()=>{
        if(Object.keys(userSubscriptions).length>0 && userSubscriptions.fetched){
            //console.log(userSubscriptions);
            setAppLoader(false);
        }
    },[userSubscriptions]);
    
    /**
     * @Functions
     */
    const getUserInfo = () => {
        return $.post('/account/api/user/verifytoken')
    }

    /**  GET ALL PLANS */
    const getPlans = function () {
        return $.post('/payment/plans/getall');
    }

    const getUserPaymentAccount=()=>{
        return $.post('/payment/customer/get', {
            "registration_number": userInfo.registration_number
        });
    }

    const getUserLocationByIp = () => {
        return $.getJSON('https://api.ipdata.co/es?api-key=071be21a2b0139997678d23a3fa5303040ada726a0dfaa55c817da21');
    }

    const getUserSubscriptions=(pym)=>{
        return pym.creditCards.reduce((acc,ci)=>{
            if(ci.subscriptions.length>0){
                acc=acc.concat(ci.subscriptions);
            }
            return acc;
        },[]);
    }

    const getStoredUserAccountSubscriptions=()=>{
        return $.getJSON('/account/api/subscription/get',{
            "registration_number":userInfo.registration_number,
            "subscription_name":"elite subscription"
        });
    }

    return (
        <UserInfo.Provider value={{
            userInfo: userInfo,
            subscriptionPlans:subscriptionPlans,
            userCurentLocationByIp:userCurentLocationByIp,
            subscriptionPlanByCountry:subscriptionPlanByCountry,
            userPaymentAccount:userPaymentAccount,
            userSubscriptions:userSubscriptions,
            storedUserAccountSubscriptions:storedUserAccountSubscriptions
        }}>
            <div className="mt-3">
                <div className="container">
                    {
                        appLoader ?
                            <div className="mt-2 p-2 text-center">
                                <img src="/efs/core/images/core/loading.gif" style={{ width: "40px" }}></img>
                            </div>:
                            <div className="pt-2 pb-2" >
                                {
                                    'login_user_type' in userInfo && userInfo.login_user_type === "healthcare_provider" ?
                                        <div className="mt-3 ">
                                            <HealthcareProviderSubscriptionManagement />
                                        </div> : null
                                }

                                <div className="mt-3 text-center">
                                    <div className="mb-2 mt-2">Apps included in subscriptions</div>
                                    <HealthcareProviderApps />
                                    <div className="small mt-2 text-primary">More to come...</div>
                                </div>
                            </div>
                    }
                </div>
            </div>
        </UserInfo.Provider>

    );

};



