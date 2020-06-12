import React, { useEffect, useState } from "react";
import Page from "../Page";
import { useParams, Link } from "react-router-dom";
import Axios from "axios";
import LoadingDots from "../LoadingDots";

const ProfileFollowing = () => {
  const { username } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();
    async function fetchPosts() {
      try {
        const response = await Axios.get(`/profile/${username}/following`, {
          cancelToken: ourRequest.token,
        });
        setIsLoading(false);
        setPosts(response.data);
      } catch (error) {
        console.log("something bad happen:");
      }
    }
    fetchPosts();
    return () => ourRequest.cancel();
  }, [username]);

  if (isLoading) return <LoadingDots />;

  return (
    <Page>
      <div className="list-group">
        {posts.map((follower, index) => {
          return (
            <Link
              key={index}
              to={`/profile/${follower.username}`}
              className="list-group-item list-group-item-action"
            >
              <img className="avatar-tiny" src={follower.avatar} alt="follower-avatar" /> {follower.username}
            </Link>
          );
        })}
      </div>
    </Page>
  );
};

export default ProfileFollowing;
