import React from "react";
import styled from "styled-components";
import FileTree from "./FileTree";

const SideBar = () => {
  return (
    <SideBarContainer>
      <FileTree />
    </SideBarContainer>
  );
};

const Color = {
  background: "#2b2b2b",
};

const SideBarContainer = styled.div`
  position: fixed;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;
  height: 100vh;
  width: 20vw;
  min-width: 200px;
  background-color: ${Color.background};
  box-shadow: 5px 0px 10px hsla(0, 0%, 10%, 0.2);
  overflow: scroll;
  z-index: 1;
`;

export default SideBar;
