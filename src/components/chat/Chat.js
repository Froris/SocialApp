import React, { useContext, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import StateContext from "../../StateContext";
import DispatchContext from "../../DispatchContext";
import { useImmer } from "use-immer";
import io from "socket.io-client";

const Chat = () => {
  const socket = useRef(null);
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);

  const chatField = useRef(null);
  const chatLog = useRef(null);

  const [state, setState] = useImmer({
    fieldValue: "",
    chatMessages: [],
  });

  useEffect(() => {
    if (appState.isChatOpen) {
      chatField.current.focus();
      appDispatch({ type: "CLEAR_UNREAD__MESSAGES_COUNT" });
    }
  }, [appState.isChatOpen]);

  // Говорим фронту прослушивать ответ от сервера chatFromServer
  // chatFromServer принимает сообщение(42) и ретранслирует его в общий чат
  useEffect(() => {
    socket.current = io(process.env.BACKENDURL || "https://social-app-serv.herokuapp.com");
    socket.current.on("chatFromServer", (message) => {
      setState((draft) => {
        draft.chatMessages.push(message);
      });
    });

    return () => socket.current.disconnect();
  }, []);

  useEffect(() => {
    chatLog.current.scrollTop = chatLog.current.scrollHeight;
    if (state.chatMessages && !appState.isChatOpen) {
      appDispatch({ type: "INCREMENT_MESSAGES_COUNT" });
    }
  }, [state.chatMessages]);

  function handleFieldChange(value) {
    setState((draft) => {
      draft.fieldValue = value;
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Говорим серверу слушать chatFromBrowser
    socket.current.emit("chatFromBrowser", { message: state.fieldValue, token: appState.user.token });
    if (state.fieldValue.trim().length > 0) {
      setState((draft) => {
        draft.chatMessages.push({
          message: draft.fieldValue,
          username: appState.user.username,
          avatar: appState.user.avatar,
        });
        draft.fieldValue = "";
      });
    }
  }

  return (
    <div
      id="chat-wrapper"
      className={
        "chat-wrapper  shadow border-top border-left border-right" +
        (appState.isChatOpen ? " chat-wrapper--is-visible" : "")
      }
    >
      <div className="chat-title-bar bg-primary">
        Chat
        <span onClick={() => appDispatch({ type: "CLOSE_CHAT" })} className="chat-title-bar-close">
          <i className="fas fa-times-circle"></i>
        </span>
      </div>
      <div id="chat" className="chat-log" ref={chatLog}>
        {state.chatMessages.map((message, index) => {
          if (message.username === appState.user.username) {
            return (
              <div className="chat-self" key={index}>
                <div className="chat-message">
                  <div className="chat-message-inner">{message.message}</div>
                </div>
                <img className="chat-avatar avatar-tiny" src={message.avatar} alt="chat-avatar" />
              </div>
            );
          }

          return (
            <div className="chat-other" key={index}>
              <Link to={`/profile/${message.username}`}>
                <img className="avatar-tiny" src={message.avatar} alt="chat-avatar" />
              </Link>
              <div className="chat-message">
                <div className="chat-message-inner">
                  <Link to={`/profile/${message.username}`}>
                    <strong>{message.username}: </strong>
                  </Link>
                  {message.message}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={handleSubmit} id="chatForm" className="chat-form border-top">
        <input
          onChange={(e) => handleFieldChange(e.target.value)}
          value={state.fieldValue}
          ref={chatField}
          type="text"
          className="chat-field"
          id="chatField"
          placeholder="Type a message…"
          autoComplete="off"
        />
      </form>
    </div>
  );
};

export default Chat;
