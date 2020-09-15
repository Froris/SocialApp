import React, { Fragment, useContext, useEffect } from "react";
import Page from "./Page";
import StateContext from "../StateContext";
import LoadingDots from "./LoadingDots";
import { useImmer } from "use-immer";
import Axios from "axios";
import Post from "./Post";

const Home = () => {
  const [state, setState] = useImmer({
    isLoading: true,
    feed: [],
  });
  const appState = useContext(StateContext);

  // Получаем профиль пользователя
  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();
    async function fetchData() {
      try {
        const response = await Axios.post("/getHomeFeed", {
          token: appState.user.token,
          cancelToken: ourRequest.token,
        });
        setState((draft) => {
          draft.isLoading = false;
          draft.feed = response.data;
        });
      } catch (error) {
        console.log("something bad happen:");
      }
    }
    fetchData();
    return () => {
      ourRequest.cancel();
    };
  }, []);

  if (state.isLoading) {
    return <LoadingDots />;
  }

  return (
    <Page>
      {state.feed.length > 0 && (
        <Fragment>
          <h2 className="text-center mb-4">The latest from those you follow:</h2>
          <div className="list-group">
            {state.feed.map((post) => {
              return <Post post={post} key={post._id} />;
            })}
          </div>
        </Fragment>
      )}
      {state.feed.length === 0 && (
        <Fragment>
          <h2 className="text-center">
            Hello <strong>{appState.user.username}</strong>, your feed is empty.
          </h2>
          <p className="lead text-muted text-center">
            Your feed displays the latest posts from the people you follow. If you don&rsquo;t have any friends to
            follow that&rsquo;s okay; you can use the &ldquo;Search&rdquo; feature in the top menu bar to find
            content written by people with similar interests and then follow them.
          </p>
        </Fragment>
      )}
    </Page>
  );
};

export default Home;
