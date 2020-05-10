import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { BrowserRouter, Switch, Route } from "react-router-dom";

import Header from "./components/Header";
import HomeGuest from "./components/HomeGuest";
import About from "./components/About";
import Terms from "./components/Terms";
import Footer from "./components/Footer";

const App = () => (
  <BrowserRouter>
    <Header />
    <Switch>
      <Route path="/" exact>
        <HomeGuest />
      </Route>
      <Route path="/about-us">
        <About />
      </Route>
      <Route path="/terms">
        <Terms />
      </Route>
    </Switch>
    <Footer />
  </BrowserRouter>
);

ReactDOM.render(<App />, document.getElementById("app"));
