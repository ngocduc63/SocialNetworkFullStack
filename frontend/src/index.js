import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";
import { HelmetProvider } from "react-helmet-async";

import axios from "axios";
import { BASE_URL} from "./utils/constants";
axios.defaults.baseURL = BASE_URL


ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </Router>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root"),
);
