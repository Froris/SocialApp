import React, { useEffect, useContext } from "react";
import { useImmer } from "use-immer";

import Axios from "axios";
import { useParams, NavLink, Switch, Route } from "react-router-dom";
import StateContext from "../../StateContext";
import Page from "../Page";
import ProfilePosts from "./ProfilePosts";
import ProfileFollowers from "./ProfileFollowers";
import ProfileFollowing from "./ProfileFollowing";

const Profile = () => {
  const appState = useContext(StateContext);
  const { username } = useParams();
  const [state, setState] = useImmer({
    followingActionLoading: false,
    startFollowingRequestCount: 0,
    stopFollowingRequestCount: 0,
    profileData: {
      profileUsername: "...",
      profileAvatar: "https://gravatar.com/avatar/placeholder?s=128",
      isFollowing: false,
      counts: { postCount: "", followerCount: "", followingCount: "" },
    },
  });

  // Получаем профиль пользователя
  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();
    async function fetchData() {
      try {
        const response = await Axios.post(`/profile/${username}`, {
          token: appState.user.token,
          cancelToken: ourRequest.token,
        });
        setState((draft) => {
          draft.profileData = response.data;
        });
      } catch (error) {
        console.log("something bad happen:");
      }
    }
    fetchData();
    return () => {
      ourRequest.cancel();
    };
  }, [username]);
  // Начинаем следовать за пользователем
  useEffect(() => {
    if (state.startFollowingRequestCount) {
      setState((draft) => {
        draft.followingActionLoading = true;
      });
      const ourRequest = Axios.CancelToken.source();
      async function fetchData() {
        try {
          const response = await Axios.post(`addFollow/${state.profileData.profileUsername}`, {
            token: appState.user.token,
            cancelToken: ourRequest.token,
          });
          setState((draft) => {
            draft.profileData.isFollowing = true;
            draft.profileData.counts.followerCount++;
            draft.followingActionLoading = false;
          });
        } catch (error) {
          console.log("something bad happen:");
        }
      }
      fetchData();
      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.startFollowingRequestCount]);

  // Прекращаем следовать за пользователем
  useEffect(() => {
    if (state.stopFollowingRequestCount) {
      setState((draft) => {
        draft.followingActionLoading = true;
      });
      const ourRequest = Axios.CancelToken.source();
      async function fetchData() {
        try {
          const response = await Axios.post(`addFollow/${state.profileData.profileUsername}`, {
            token: appState.user.token,
            cancelToken: ourRequest.token,
          });
          setState((draft) => {
            draft.profileData.isFollowing = false;
            draft.profileData.counts.followerCount--;
            draft.followingActionLoading = false;
          });
        } catch (error) {
          console.log("something bad happen:");
        }
      }
      fetchData();
      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.stopFollowingRequestCount]);

  function startFollowing() {
    setState((draft) => {
      draft.startFollowingRequestCount++;
    });
  }

  function stopFollowing() {
    setState((draft) => {
      draft.stopFollowingRequestCount++;
    });
  }

  return (
    <Page title="Profile page">
      <h2>
        <img className="avatar-small" src={state.profileData.profileAvatar} alt="avatar" />
        {state.profileData.profileUsername}
        {appState.loggedIn &&
          !state.profileData.isFollowing &&
          state.profileData.profileUsername !== appState.user.username &&
          state.profileData.profileUsername !== "..." && (
            <button
              onClick={startFollowing}
              disabled={state.followingActionLoading}
              className="btn btn-primary btn-sm ml-2"
            >
              Follow <i className="fas fa-user-plus"></i>
            </button>
          )}
        {appState.loggedIn &&
          state.profileData.isFollowing &&
          state.profileData.profileUsername !== appState.user.username &&
          state.profileData.profileUsername !== "..." && (
            <button
              onClick={stopFollowing}
              disabled={state.startFollowingActionLoading}
              className="btn btn-danger btn-sm ml-2"
            >
              Stop following <i className="fas fa-user-times"></i>
            </button>
          )}
      </h2>
      <div className="profile-nav nav nav-tabs pt-2 mb-4">
        <NavLink exact to={`/profile/${state.profileData.profileUsername}`} className="nav-item nav-link">
          Posts: {state.profileData.counts.postCount}
        </NavLink>
        <NavLink to={`/profile/${state.profileData.profileUsername}/followers`} className="nav-item nav-link">
          Followers: {state.profileData.counts.followerCount}
        </NavLink>
        <NavLink to={`/profile/${state.profileData.profileUsername}/following`} className="nav-item nav-link">
          Following: {state.profileData.counts.followingCount}
        </NavLink>
      </div>
      <Switch>
        <Route exact path="/profile/:username">
          <ProfilePosts />
        </Route>
        <Route path="/profile/:username/followers">
          <ProfileFollowers />
        </Route>
        <Route path="/profile/:username/following">
          <ProfileFollowing />
        </Route>
      </Switch>
    </Page>
  );
};

export default Profile;
