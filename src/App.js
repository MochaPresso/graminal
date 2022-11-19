import React, { useState, useEffect } from "react";
import SideBar from "./components/SideBar";
import Terminal from "./components/Terminal";

const App = () => {
  const [isSideBarToggle, setIsSideBarToggle] = useState(false);

  useEffect(() => {
    window.sideBar.toggle("sideBar.toggle", () => {
      setIsSideBarToggle((toggle) => !toggle);
    });
  }, []);

  return (
    <>
      {isSideBarToggle && <SideBar />}
      <Terminal isSideBarToggle={isSideBarToggle} />
    </>
  );
};

export default App;
