import React, { useEffect, useState } from "react";
import Page from "./Page";
import { useParams, Link, Redirect } from "react-router-dom";
import Axios from "axios";
import LoadingDots from "./LoadingDots";
import ReactMarkdown from "react-markdown";
import ReactTooltip from "react-tooltip";
import NotFound from "./NotFound";
import { useContext } from "react";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";

const SinglePost = () => {
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);

  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState();

  const [deleteAttemptCount, setDeleteAttemptCount] = useState(0);
  const [deleteWasSuccessful, setDeleteWasSuccessful] = useState(false);

  // Запрашиваем пост по id
  useEffect(() => {
    // Генерируем токен для отмены запроса
    const ourRequest = Axios.CancelToken.source();
    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${id}`, { cancelToken: ourRequest.token }); // вместе с запросом передаем токен отмены
        setPost(response.data);
        setIsLoading(false);
      } catch (error) {
        console.log("something bad happen:");
      }
    }
    fetchPost();
    // Вызываем cancel, который, юзая токен отмены, прерывает запрос
    return () => {
      ourRequest.cancel();
    };
  }, [id]);

  // Удаляем пост
  useEffect(() => {
    if (deleteAttemptCount > 0) {
      const ourRequest = Axios.CancelToken.source();
      async function deletePost() {
        // Отправляем запрос на удаление
        try {
          const response = await Axios.delete(
            `/post/${id}`,
            { data: { token: appState.user.token } },
            { cancelToken: ourRequest.token }
          );
          if (response.data === "Success") {
            setDeleteWasSuccessful(true);
          }
        } catch (error) {
          console.log("something bad happen:");
        }
      }
      deletePost();
      return () => {
        ourRequest.cancel();
      };
    }
  }, [deleteAttemptCount]);

  if (deleteWasSuccessful) {
    appDispatch({ type: "FLASH_MESSAGE", value: "Post was successfully deleted" });
    return <Redirect to={`/profile/${appState.user.username}`} />;
  }
  if (!isLoading && !post) {
    return <NotFound />;
  }
  if (isLoading)
    return (
      <Page title="...">
        <LoadingDots />
      </Page>
    );

  function isOwner() {
    if (appState.loggedIn) {
      return appState.user.username === post.author.username;
    } else {
      return false;
    }
  }

  function deleteHandler() {
    const areYouSure = window.confirm("Are you really want to delete this post?");
    if (areYouSure) {
      setDeleteAttemptCount((prev) => prev + 1);
    }
  }

  const date = new Date(post.createdDate);
  const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

  return (
    <Page title=" Social App/post page">
      <div className="d-flex justify-content-between">
        <h2>{post.title}</h2>
        {isOwner() && (
          <span className="pt-2">
            <Link to={`/post/${id}/edit`} data-tip="Edit" data-for="edit" className="text-primary mr-2">
              <i className="fas fa-edit"></i>
            </Link>
            <ReactTooltip id="edit" className="custom-tooltip" />{" "}
            <button
              onClick={deleteHandler}
              className="delete-post-button text-danger"
              data-tip="Delete"
              data-for="delete"
            >
              <i className="fas fa-trash"></i>
            </button>
            <ReactTooltip id="delete" className="custom-tooltip" />
          </span>
        )}
      </div>

      <p className="text-muted small mb-4">
        <Link to={`/profile/${post.author.username}`}>
          <img className="avatar-tiny" src={post.author.avatar} alt="avatar-tiny" />
        </Link>
        Posted by <Link to={`/profile/${post.author.username}`}>{post.author.username}</Link> on {formattedDate}
      </p>

      <div className="body-content">
        <ReactMarkdown source={post.body} />
      </div>
    </Page>
  );
};

export default SinglePost;
