import React, { useEffect, useState } from "react";
import { UserInfo } from "./../../contexts/userInfo";
import { ManagePaymentMethods } from "./paymentMethods";
import { Transactions } from "./transactions";
export const App = () => {

    const [appLoader, setAppLoader] = useState(true);
    const [userInfo, setUserInfo] = useState({});

    //Onload 
    useEffect(() => {
        getUserInfo().then(response => {

            //console.log(response);
            setUserInfo(response);
            setAppLoader(false);

        });

    }, []);

    useEffect(()=>{
        if(!appLoader){
            $('.tab').tab();
            $('.tab[showel="payment-method-container"]').trigger('click');
        }
    },[appLoader])

    /**
     * Update the ContextValues from the child items
     * @param {*} info as Object
     */
    const updateUserInfoContext = (info) => {
        let data = { ...userInfo };
        let updatedData = Object.assign(data, info);
        //console.log(updatedData);
        setUserInfo(updatedData);
    }

    
    /** Get Data ***/
    const getUserInfo = () => {
        return $.post('/account/api/user/verifytoken')
    }

    return (
        <UserInfo.Provider value={{
            userInfo: userInfo,
            updateUserInfoContext: updateUserInfoContext
        }}>
            <div>
                {
                    appLoader ?
                        <div className="mt-2 p-2 text-center">
                            <img src="/efs/core/images/core/loading.gif" style={{ width: "40px" }}></img>
                        </div> :
                        <div className="tab-parent-container mt-3">
                            <div className="d-flex">
                                <div className="tab pt-2 pb-2 ml-3 h5" showel="payment-method-container">Payment Methods</div>
                                <div className="tab pt-2 pb-2 ml-5 h5" showel="transactions-container">Transactions</div>
                            </div>
                            <div className="mt-2 tab-content-container">
                                <div className="tab-content" id="payment-method-container">
                                    <ManagePaymentMethods />
                                </div>
                                <div className="tab-content" id="transactions-container">
                                    <Transactions />
                                </div>
                            </div>
                        </div>
                }
            </div>
            
        </UserInfo.Provider>
    );
};