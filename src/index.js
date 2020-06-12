import React, { useEffect, Suspense } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Axios from "axios";
// useImmerReducer создает копию state, которую мы можем мутировать. Далее копия заменяет оригинальный state
import { useImmerReducer } from "use-immer";

// User components
import Header from "./components/Header";
import HomeGuest from "./components/HomeGuest";
import About from "./components/About";
import Terms from "./components/Terms";
import Footer from "./components/Footer";
import Home from "./components/Home";
import FlashMessages from "./components/FlashMessages";
import StateContext from "./StateContext";
import DispatchContext from "./DispatchContext";
import Profile from "./components/profile/Profile";
import EditPost from "./components/EditPost";
import NotFound from "./components/NotFound";
import LoadingDots from "./components/LoadingDots";
import { CSSTransition } from "react-transition-group";
const CreatePost = React.lazy(() => import("./components/CreatePost"));
const SinglePost = React.lazy(() => import("./components/SinglePostPage"));
const Search = React.lazy(() => import("./components/Search"));
const Chat = React.lazy(() => import("./components/chat/Chat"));

Axios.defaults.baseURL = process.env.BACKENDURL || "https://social-app-serv.herokuapp.com";

const App = () => {
  // Общий state
  const initialState = {
    loggedIn: Boolean(localStorage.getItem("SocialAppToken")),
    flashMessages: [],
    isSearchOpen: false,
    isChatOpen: false,
    unreadMessagesCount: 0,
    user: {
      token: localStorage.getItem("SocialAppToken"),
      username: localStorage.getItem("SocialAppUsername"),
      avatar: localStorage.getItem("SocialAppAvatar"),
    },
  };

  const reducer = (draft, action) => {
    switch (action.type) {
      case "LOGIN":
        draft.loggedIn = true;
        draft.user = action.data;
        return;
      case "LOGOUT":
        draft.loggedIn = false;
        return;
      case "FLASH_MESSAGE":
        draft.flashMessages.push(action.value);
        return;
      case "SEARCH_OPEN":
        draft.isSearchOpen = true;
        return;
      case "SEARCH_CLOSE":
        draft.isSearchOpen = false;
        return;
      case "TOGGLE_CHAT":
        draft.isChatOpen = !draft.isChatOpen;
        return;
      case "CLOSE_CHAT":
        draft.isChatOpen = false;
        return;
      case "INCREMENT_MESSAGES_COUNT":
        draft.unreadMessagesCount++;
        return;
      case "CLEAR_UNREAD__MESSAGES_COUNT":
        draft.unreadMessagesCount = 0;
        return;
      default:
        return draft;
    }
  };

  const [state, dispatch] = useImmerReducer(reducer, initialState);

  // Проверяем токен
  useEffect(() => {
    if (state.loggedIn) {
      const ourRequest = Axios.CancelToken.source();
      async function fetchResults() {
        try {
          const response = await Axios.post(
            "/checkToken",
            { token: state.user.token },
            { cancelToken: ourRequest.token }
          );
          // Если токен истек
          if (!response.data) {
            dispatch({ type: "LOGOUT" });
            dispatch({ type: "FLASH_MESSAGE", value: "Your session has expired. Please log in again." });
          }
        } catch (err) {
          console.log("There was a problem or the request was canceled");
        }
      }
      fetchResults();
      return () => ourRequest.cancel();
    }
  }, []);

  // Обновляем данные юзера при логине/перезагрузке
  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem("SocialAppToken", state.user.token);
      localStorage.setItem("SocialAppUsername", state.user.username);
      localStorage.setItem("SocialAppAvatar", state.user.avatar);
    } else {
      localStorage.removeItem("SocialAppToken");
      localStorage.removeItem("SocialAppUsername");
      localStorage.removeItem("SocialAppAvatar");
    }
  }, [state.loggedIn]);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} />
          <Header />
          <Suspense fallback={<LoadingDots />}>
            <Switch>
              <Route path="/" exact>
                {state.loggedIn ? <Home /> : <HomeGuest />}
              </Route>
              <Route path="/profile/:username">
                <Profile />
              </Route>
              <Route path="/create-post">
                <CreatePost />
              </Route>
              <Route path="/post/:id" exact>
                <SinglePost />
              </Route>
              <Route path="/post/:id/edit" exact>
                <EditPost />
              </Route>
              <Route path="/about-us">
                <About />
              </Route>
              <Route path="/terms">
                <Terms />
              </Route>
              <Route>
                <NotFound />
              </Route>
            </Switch>
          </Suspense>
          <CSSTransition timeout={300} in={state.isSearchOpen} classNames={"search-overlay"} unmountOnExit>
            <div className="search-overlay">
              <Suspense fallback="">
                <Search />
              </Suspense>
            </div>
          </CSSTransition>
          <Suspense fallback="">{state.loggedIn && <Chat />}</Suspense>
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));
