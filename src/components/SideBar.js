import React from "react";
import styled from "styled-components";

const SideBar = () => {
  return <SideBarContainer />;
};

const SideBarContainer = styled.div`
  position: fixed;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: column;
  height: 100vh;
  width: 20vw;
  min-width: 200px;
  background-color: #2b2b2b;
  box-shadow: 5px 0px 10px hsla(0, 0%, 10%, 0.2);
  z-index: 1;
`;

export default SideBar;
