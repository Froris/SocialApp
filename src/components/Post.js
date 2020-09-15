import React, { Fragment } from "react";
import { Link } from "react-router-dom";

const Post = (props) => {
  const date = new Date(props.post.createdDate);
  const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  return (
    <Link to={`/post/${props.post._id}`} className="list-group-item list-group-item-action" onClick={props.onClick}>
      <img className="avatar-tiny" src={props.post.author.avatar} /> <strong>{props.post.title}</strong>{" "}
      <span className="text-muted small">
        {!props.noAuthor && <Fragment>by {props.post.author.username}</Fragment>} on {formattedDate}
      </span>
    </Link>
  );
};

export default Post;
