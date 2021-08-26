import React, { useState, useContext, useEffect } from 'react';
import { AppointmentContext } from "../../../../contexts/appoinment";
import { ProviderContext } from "../../../../contexts/provider";
import { Modal } from "@oi/reactcomponents";
import { ProviderReviewForm,DisplayProviderRatings, DisplayEachRatings } from "@oi/reactcomponents/provider-review";

import { DisplayProviderProfilePic } from './displayProviderProfilePic';
import { DisplayProviderDemographics } from './displayProviderDemographics';
import { DisplayAppointmentLocation } from "./displayAppointmentLocation";

const config=require('../../../../../../efs/core/config/config.json');

export const ManageProviderReviews = () => {

    let appointmentContextValues = useContext(AppointmentContext);
    let providerContextValues = useContext(ProviderContext);

    const [showReviewForm, setShowReviewFormFlag] = useState(false);
    const [viewMyComments,setViewMyCommentModalFlag]=useState(false);

    const [providerReviewStats,setProviderReviewStats]=useState({});
    const [reviewEntered,setReviewEntered]=useState({});

    const [providerReviews,setProviderReviews]=useState([]);

    useEffect(()=>{
        
        if('provider' in providerContextValues && Object.keys(providerContextValues.provider).length>0){
            
            //** GET PROVIDER REVIEWS **
            let reviews=window.providerReviews.filter(p=>p._id.providerId===providerContextValues.provider._id);
            
            if(reviews.length>0){

                //console.log('exists');
                setProviderReviewStats(reviews[0]);

            }else{

                let reviewStats={};

                //Get the reveiws 
                $.getJSON('/review/get/providerstats',{
                    'provider_id.$_id':providerContextValues.provider._id

                }).then(stats=>{
                    //console.log(stats);
                    reviewStats=stats[0];

                    //console.log(window.providerReviews);
                    window.providerReviews.push(reviewStats);
                    
                    setProviderReviewStats(reviewStats);

                });
            }

            //** CHECK IF USER HAS ALREADY ENTERED REVIEWS ****
            let enteredReview=window.userEnteredReviews.filter(entry=>entry.provider_id===providerContextValues.provider._id);
            if(enteredReview.length>0){
                setReviewEntered(enteredReview[0]);
            }else{
                //Get the reveiws 
                $.getJSON('/review/get',{
                    'provider_id.$_id':providerContextValues.provider._id,
                    'user_mongo_id.$_id':appointmentContextValues.userInfo._id

                }).then(review=>{

                    //console.log(review[0]);
                    setReviewEntered(review[0]);//Take the first review

                    //console.log(window.providerReviews);
                    window.userEnteredReviews=window.userEnteredReviews.concat(review);
                    
                });
            }
        }

    },[]);

    const handleReviewSubmission = (data) => {

        popup.onScreen("Adding Review...");
        
        data['user_mongo_id.$_id'] = appointmentContextValues.userInfo._id;
        data.review_for = "provider";

        data['provider_id.$_id'] = providerContextValues.provider._id;
        data['facilityId.$_id'] = appointmentContextValues.appointment.facilityId;

        console.log(data);

        $.ajax({
            "url": "/review/create",
            "processData": false,
            "contentType": "application/json; charset=utf-8",
            "data": JSON.stringify(data),
            "method": "POST"
        }).then(response => {

            console.log(response);

            popup.remove();

            setShowReviewFormFlag(false);
            popup.onBottomCenterSuccessMessage("Review Submitted");
        });
    }

    return (
        <AppointmentContext.Consumer>
            {({ upcoming = false, userInfo = {} }) => {
                return <ProviderContext.Consumer>
                    {({ provider = {} }) => {
                        return <div className="provider-review mt-2">
                            <div className="d-flex align-items-center">
                                
                                <DisplayProviderRatings reviewStat={{
                                    overall_rating:providerReviewStats.avgOverallRating,
                                    wait_time_rating:providerReviewStats.avgwaitTimeRating,
                                    knowledge_rating:providerReviewStats.avgKnowledgeRating
                                }} />

                                <div className="ml-2 pt-1">
                                    <a href={`${config.domains[config.host][config.env].web}/reviews/healthcare-provider/${provider._id}`}>
                                        <div className="small btn-sm btn-link pointer">{providerReviewStats.totalItems} Reviews</div>
                                    </a>
                                </div>

                                {
                                    !upcoming && reviewEntered.length===0 ?
                                        <div className="ml-2 btn-sm btn-primary small pointer" onClick={() => { setShowReviewFormFlag(true) }}>
                                            <span className="material-icons align-middle">rate_review</span>
                                            <span className="ml-2">Write a review</span>
                                        </div> :
                                        <div className="dot-seprator ml-1">
                                            <div className="pointer d-inline-block small btn-link" 
                                                onClick={()=>setViewMyCommentModalFlag(true)}><i className="far fa-comment"></i> View My Comment</div>
                                        </div>
                                }
                                {
                                    showReviewForm ?
                                        <Modal header={<h4>Review</h4>}
                                            onCloseHandler={() => { setShowReviewFormFlag(false) }}>
                                            <div className="d-flex pb-2 pt-2 border-bottom">
                                                <div><DisplayProviderProfilePic /> </div>
                                                <div className="align-top ml-2">
                                                    <div className="pb-2">
                                                        <DisplayProviderDemographics />
                                                    </div>
                                                    <div className="border-top pt-2">
                                                        <DisplayAppointmentLocation />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-3">
                                                <ProviderReviewForm
                                                    userInfo={userInfo}
                                                    onSubmission={handleReviewSubmission} />
                                            </div>
                                            
                                        </Modal> :
                                        null
                                }
                                {
                                    viewMyComments && Object.keys(reviewEntered).length>0?
                                    <Modal header={<h4>Provider Review</h4>} 
                                        onCloseHandler={() => { setViewMyCommentModalFlag(false) }}>
                                        <div className="d-flex pb-2 pt-2 border-bottom">
                                            <div><DisplayProviderProfilePic /> </div>
                                            <div className="align-top ml-2">
                                                <div className="pb-2">
                                                    <DisplayProviderDemographics />
                                                </div>
                                                <div className="border-top pt-2">
                                                    <DisplayAppointmentLocation />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <div className="mt-2">
                                                <div>Overall Rating</div>
                                                <div><DisplayEachRatings rating={reviewEntered.overall_rating} /></div>
                                            </div>
                                            <div className="mt-2">
                                                <div>Overall Rating</div>
                                                <div><DisplayEachRatings rating={reviewEntered.wait_time_rating}/></div>
                                            </div>
                                            <div className="mt-2">
                                                <div>Overall Rating</div>
                                                <div><DisplayEachRatings rating={reviewEntered.knowledge_rating} /></div>
                                            </div>
                                            <div className="mt-2">
                                                {
                                                    reviewEntered.subject_line.length>0?
                                                    <b>{reviewEntered.subject_line}</b>:null
                                                }
                                            </div>
                                            <div className="mt-2">
                                                {
                                                    reviewEntered.review_details.length>0?
                                                    <div>{reviewEntered.review_details}</div>:
                                                    <div className="small text-muted">No comments entered</div>
                                                }
                                            </div>
                                        </div>
                                    </Modal>:
                                    null
                                }

                            </div>
                        </div>

                    }}
                </ProviderContext.Consumer>

            }}
        </AppointmentContext.Consumer>

    );

}
