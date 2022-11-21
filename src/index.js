import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import DirectoryContext from "./stores/DirectoryContext";
import GlobalStyle from "./style/GlobalStyle";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <DirectoryContext>
    <GlobalStyle />
    <App />
  </DirectoryContext>,
);
