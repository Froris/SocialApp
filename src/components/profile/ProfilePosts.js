import React, { useEffect, useState } from "react";
import Page from "../Page";
import { useParams } from "react-router-dom";
import Axios from "axios";
import LoadingDots from "../LoadingDots";
import Post from "../Post";

const ProfilePosts = () => {
  const { username } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();
    async function fetchPosts() {
      try {
        const response = await Axios.get(`/profile/${username}/posts`, {
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
        {posts.map((post) => {
          return <Post noAuthor={true} post={post} key={post._id} />;
        })}
      </div>
    </Page>
  );
};

export default ProfilePosts;
