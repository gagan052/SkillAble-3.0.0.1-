import React, { useState, useEffect } from "react";
import "./Gig.scss";
import Slider from "infinite-react-carousel";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import Reviews from "../../components/reviews/Reviews";

function Gig() {
  const { id } = useParams();
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const queryClient = useQueryClient();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const { isLoading, error, data } = useQuery({
    queryKey: ["gig"],
    queryFn: () =>
      newRequest.get(`/gigs/single/${id}`).then((res) => {
        return res.data;
      }),
  });

  const userId = data?.userId;

  // Check if gig is saved by current user
  useQuery({
    queryKey: ["savedGig", id],
    queryFn: () => {
      if (!currentUser) return { isSaved: false };
      return newRequest.get(`/saved-gigs/check/${id}`).then((res) => {
        setIsSaved(res.data.isSaved);
        return res.data;
      });
    },
    enabled: !!currentUser && !!id,
  });

  // Check if user is following the seller
  useQuery({
    queryKey: ["following", userId],
    queryFn: () => {
      if (!currentUser || !userId) return { isFollowing: false };
      return newRequest.get(`/users/${currentUser._id}`).then((res) => {
        const isFollowing = res.data.following?.includes(userId) || false;
        setIsFollowing(isFollowing);
        return { isFollowing };
      });
    },
    enabled: !!currentUser && !!userId,
  });

  // Save gig mutation
  const saveGigMutation = useMutation({
    mutationFn: (gigId) => {
      return newRequest.put(`/saved-gigs/toggle/${gigId}`);
    },
    onSuccess: (response) => {
      setIsSaved(response.data.isSaved);
      queryClient.invalidateQueries(["savedGig", id]);
      queryClient.invalidateQueries(["savedGigs"]);
    },
  });

  // Handle save gig
  const handleSaveGig = () => {
    if (!currentUser) {
      alert("You need to be logged in to save gigs!");
      return;
    }
    
    saveGigMutation.mutate(id);
  };

  // Handle share gig
  const handleShareGig = () => {
    if (navigator.share) {
      navigator.share({
        title: data.title,
        text: data.shortDesc,
        url: window.location.href,
      })
      .catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const {
    isLoading: isLoadingUser,
    error: errorUser,
    data: dataUser,
  } = useQuery({
    queryKey: ["user"],
    queryFn: () =>
      newRequest.get(`/users/${userId}`).then((res) => {
        return res.data;
      }),
    enabled: !!userId,
  });

  return (
    <div className="gig">
      {isLoading ? (
        "loading"
      ) : error ? (
        "Something went wrong!"
      ) : (
        <div className="container">
          <div className="left">
            <span className="breadcrumbs">
              SkillAble {">"} Graphics & Design {">"}
            </span>
            <h1>{data.title}</h1>
            {isLoadingUser ? (
              "loading"
            ) : errorUser ? (
              "Something went wrong!"
            ) : (
              <div className="user">
                <img
                  className="pp"
                  src={dataUser.img || "public/img/noavatar.jpg"}
                  alt=""
                />
                <span>{dataUser.username}</span>
                {!isNaN(data.totalStars / data.starNumber) && (
                  <div className="stars">
                    {Array(Math.round(data.totalStars / data.starNumber))
                      .fill()
                      .map((item, i) => (
                        <img src="/img/star.png" alt="" key={i} />
                      ))}
                    <span>{Math.round(data.totalStars / data.starNumber)}</span>
                  </div>
                )}
              </div>
            )}
            <Slider slidesToShow={1} arrowsScroll={1} className="slider">
              {data.images.map((img) => (
                <img key={img} src={img} alt="" />
              ))}
            </Slider>
            <h2>About This Gig</h2>
            <p>{data.desc}</p>
            {isLoadingUser ? (
              "loading"
            ) : errorUser ? (
              "Something went wrong!"
            ) : (
              <div className="seller">
                <h2>About The Seller</h2>
                <div className="user">
                  <img src={dataUser.img || "/img/noavatar.jpg"} alt="" />
                  <div className="info">
                    <span>{dataUser.username}</span>
                    {!isNaN(data.totalStars / data.starNumber) && (
                      <div className="stars">
                        {Array(Math.round(data.totalStars / data.starNumber))
                          .fill()
                          .map((item, i) => (
                            <img src="/img/star.png" alt="" key={i} />
                          ))}
                        <span>
                          {Math.round(data.totalStars / data.starNumber)}
                        </span>
                      </div>
                    )}
                    <div className="user-actions">
                      <button>Contact Me</button>
                      {currentUser && currentUser._id !== userId && (
                        <button 
                          className={`follow-btn ${isFollowing ? "following" : ""}`}
                          onClick={() => {
                            if (!currentUser) {
                              alert("You need to be logged in to follow sellers!");
                              return;
                            }
                            
                            newRequest.put(`/users/follow/${userId}`)
                              .then(() => {
                                setIsFollowing(!isFollowing);
                                queryClient.invalidateQueries(["user"]);
                              })
                              .catch(err => console.error(err));
                          }}
                        >
                          {isFollowing ? "Following" : "Follow"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="box">
                  <div className="items">
                    <div className="item">
                      <span className="title">From</span>
                      <span className="desc">{dataUser.country}</span>
                    </div>
                    <div className="item">
                      <span className="title">Member since</span>
                      <span className="desc">Aug 2022</span>
                    </div>
                    <div className="item">
                      <span className="title">Avg. response time</span>
                      <span className="desc">4 hours</span>
                    </div>
                    <div className="item">
                      <span className="title">Last delivery</span>
                      <span className="desc">1 day</span>
                    </div>
                    <div className="item">
                      <span className="title">Languages</span>
                      <span className="desc">English</span>
                    </div>
                  </div>
                  <hr />
                  <p>{dataUser.desc}</p>
                </div>
              </div>
            )}
            <Reviews gigId={id} />
          </div>
          <div className="right">
            <div className="price">
              <h3>{data.shortTitle}</h3>
              <h2>$ {data.price}</h2>
            </div>
            <div className="gig-actions">
              <button 
                className={`action-btn save-btn ${isSaved ? "saved" : ""}`}
                onClick={handleSaveGig}
                title={isSaved ? "Unsave" : "Save"}
              >
                <img src={isSaved ? "/img/bookmark-fill.png" : "/img/bookmark-line.png"} alt="Save" />
                {isSaved ? "Saved" : "Save"}
              </button>
              <button 
                className="action-btn share-btn"
                onClick={handleShareGig}
                title="Share"
              >
                <img src="/img/share-line.png" alt="Share" />
                Share
              </button>
            </div>
            <p>{data.shortDesc}</p>
            <div className="details">
              <div className="item">
                <img src="/img/clock.png" alt="" />
                <span>{data.deliveryDate} Days Delivery</span>
              </div>
              <div className="item">
                <img src="/img/recycle.png" alt="" />
                <span>{data.revisionNumber} Revisions</span>
              </div>
            </div>
            <div className="features">
              {data.features.map((feature) => (
                <div className="item" key={feature}>
                  <img src="/img/greencheck.png" alt="" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            <Link to={`/pay/${id}`}>
            <button>Continue</button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gig;
