// Компонент, когда мы залогинены
import React, { useContext } from "react";
import ReactTooltip from "react-tooltip";
import { Link, useHistory } from "react-router-dom";
import DispatchContext from "../DispatchContext";
import StateContext from "../StateContext";

const HeaderLoggedIn = () => {
  const appDispatch = useContext(DispatchContext);
  const appState = useContext(StateContext);
  let history = useHistory();

  function handleLogOut() {
    appDispatch({ type: "LOGOUT" });
    appDispatch({ type: "FLASH_MESSAGE", value: "You have successfully logged out." });
    history.push("/");
  }

  function handleSearchIcon(e) {
    e.preventDefault();
    appDispatch({ type: "SEARCH_OPEN" });
  }

  return (
    <div className="flex-row my-3 my-md-0">
      <a
        data-for="search"
        data-tip="Search"
        onClick={handleSearchIcon}
        className="text-white mr-2 header-search-icon"
      >
        <i className="fas fa-search"></i>
      </a>
      <ReactTooltip place="bottom" id="search" className="custom-tooltip" />{" "}
      <span
        onClick={() => appDispatch({ type: "TOGGLE_CHAT" })}
        data-for="chat"
        data-tip="Chat"
        className={"mr-2 header-chat-icon " + (appState.unreadMessagesCount ? "text-danger" : "text-white")}
      >
        <i className="fas fa-comment"></i>
        {appState.unreadMessagesCount ? (
          <span className="chat-count-badge text-white">
            {appState.unreadMessagesCount < 10 ? appState.unreadMessagesCount : "9+"}
          </span>
        ) : (
          ""
        )}
      </span>
      <ReactTooltip place="bottom" id="chat" className="custom-tooltip" />{" "}
      <Link data-for="profile" data-tip="Profile" to={`/profile/${appState.user.username}`} className="mr-2">
        <img className="small-header-avatar" src={appState.user.avatar} alt="" />
      </Link>
      <ReactTooltip place="bottom" id="profile" className="custom-tooltip" />{" "}
      <Link className="btn btn-sm btn-success mr-2" to="/create-post">
        Create Post
      </Link>{" "}
      <button onClick={handleLogOut} className="btn btn-sm btn-secondary">
        Sign Out
      </button>
    </div>
  );
};

export default HeaderLoggedIn;
