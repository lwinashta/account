import React, { useEffect, useContext, useState } from "react";
import { UserInfo } from "../../contexts/userInfo";
const moment = require('moment');

export const Transactions = () => {
    let contextValues = useContext(UserInfo);

    const [appLoader, setAppLoader] = useState(true);
    const [userTransactions, setUserTransactions] = useState([]);

    useEffect(() => {
        //console.log("gettrasactions");
        $.post('/payment/transactions/getall', {
            customerId: contextValues.userInfo.registration_number

        }).then(transactions => {
            console.log(transactions);
            setUserTransactions(transactions);
            setAppLoader(false);
        })

    }, []);

    return (<div>
        {
            appLoader ?
                <div className="mt-2 p-2 text-center">
                    <img src="/efs/core/images/core/loading.gif" style={{ width: "40px" }}></img>
                </div> :
                <div className="p-2">
                    <table className="table table-bordered bg-white rounded">
                        <thead>
                            <tr>
                                <td>Status</td>
                                <td>Payment Method</td>
                                <td>Amount</td>
                                <td>Type</td>
                                <td>Date</td>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                userTransactions.length > 0 ?
                                    userTransactions.map((transaction, indx) => {
                                        return <tr key={indx}>
                                            <td>
                                                <div>
                                                    {
                                                        transaction.status !== "voided" ?
                                                            <i className="far fa-check-circle text-success"></i> :
                                                            <i className="fas fa-minus-circle text-danger"></i>
                                                    }
                                                    <span className="ml-2 text-capitalize">{transaction.status.replace(/\_/g, " ")}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex">
                                                    <div>
                                                        <img style={{ width: "30px" }} src={transaction.creditCard.imageUrl} aria-hidden="true" />
                                                    </div>

                                                    <div className="ml-3 align-top">
                                                        <div>{transaction.creditCard.cardType} •••• {transaction.creditCard.last4}</div>
                                                        <div className="text-small text-muted">Expires {transaction.creditCard.expirationMonth}/{transaction.creditCard.expirationYear}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div>{transaction.type==="credit"?"-":""} {transaction.currencyIsoCode}  {transaction.amount}</div>
                                            </td>
                                            <td>
                                                <div className="text-capitalize">{transaction.type}</div>
                                            </td>
                                            <td>
                                                <div>{moment(transaction.createdAt).format('DD MMM YYYY, hh:mm a')}</div>
                                            </td>
                                        </tr>
                                    })
                                    : null
                            }
                        </tbody>
                    </table>

                </div>

        }

    </div>);
}