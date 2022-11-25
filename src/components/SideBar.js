import React, { useContext } from "react";
import styled from "styled-components";
import FileTree from "./FileTree";
import COLORS from "../constants/COLORS";
import { DirectoryContextStore } from "../stores/DirectoryContext";

const SideBar = () => {
  const Directory = useContext(DirectoryContextStore);

  return (
    <SideBarContainer>
      <DirectoryHeader>
        {Directory.currentDirectory.split("/").pop()}
      </DirectoryHeader>
      <MarginHeader />
      <FileTree directory={Directory.currentDirectory} depth={0} />
    </SideBarContainer>
  );
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
  background-color: ${COLORS.SIDEBAR_BACKGROUND};
  box-shadow: 5px 0px 10px hsla(0, 0%, 10%, 0.2);
  overflow-x: hidden;
  overflow-y: scroll;
  z-index: 1;
  user-select: none;
`;

const MarginHeader = styled.div`
  margin-top: 30px;
`;

const DirectoryHeader = styled.div`
  position: fixed;
  display: flex;
  width: inherit;
  min-width: inherit;
  border: 5px solid ${COLORS.HEADER_BACKGROUND};
  background-color: ${COLORS.HEADER_BACKGROUND};
  box-sizing: border-box;
  color: ${COLORS.FONT};
`;

export default SideBar;
