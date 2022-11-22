import React, { useContext } from "react";
import styled from "styled-components";
import FileTree from "./FileTree";
import { DirectoryContextStore } from "../stores/DirectoryContext";

const SideBar = () => {
  const Directory = useContext(DirectoryContextStore);

  return (
    <SideBarContainer>
      <DirectoryHeader>
        {Directory.currentDirectory.split("/").pop()}
      </DirectoryHeader>
      <FileTree directory={Directory.currentDirectory} />
    </SideBarContainer>
  );
};

const Color = {
  font: "#DADBDD",
  headerBackground: "#585858",
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

const DirectoryHeader = styled.div`
  display: flex;
  position: relative;
  width: inherit;
  min-width: inherit;
  border: 5px solid ${Color.headerBackground};
  background-color: ${Color.headerBackground};
  box-sizing: border-box;
  color: ${Color.font};
`;

export default SideBar;
